import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  DocumentSnapshot,
  FirestoreError,
  getDoc,
  getDocs,
  increment,
  limit,
  onSnapshot,
  orderBy,
  query,
  QueryDocumentSnapshot,
  serverTimestamp,
  startAfter,
  updateDoc,
  where
} from 'firebase/firestore'

import { db } from '../config/firebase'

import { Post } from '../types'

const PAGE_SIZE = 10

const postFromDoc = (snap: QueryDocumentSnapshot | DocumentSnapshot): Post => {
  const data = snap.data() ?? {}
  return {
    postId: snap.id,
    userId: data.userId ?? '',
    title: data.title ?? '',
    content: data.content ?? '',
    likes: data.likes ?? [],
    likesCount: data.likesCount ?? 0,
    commentsCount: data.commentsCount ?? 0,
    isPublished: data.isPublished ?? false,
    createdAt: data.createdAt ?? null,
    updatedAt: data.updatedAt ?? null
  }
}

export type FeedPage = {
  posts: Post[]
  cursor: QueryDocumentSnapshot | null
  hasMore: boolean
}

export const createPost = async (input: {
  userId: string
  title: string
  content: string
  isPublished?: boolean
}): Promise<string> => {
  const ref = await addDoc(collection(db, 'posts'), {
    userId: input.userId,
    title: input.title.trim(),
    content: input.content.trim(),
    likes: [],
    likesCount: 0,
    commentsCount: 0,
    isPublished: input.isPublished ?? true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  })
  return ref.id
}

export const getPost = async (postId: string): Promise<Post | null> => {
  const snap = await getDoc(doc(db, 'posts', postId))
  if (!snap.exists()) return null
  return postFromDoc(snap)
}

export type FeedMode = 'latest' | 'trending'

const sortConstraintsFor = (mode: FeedMode) =>
  mode === 'trending'
    ? [orderBy('likesCount', 'desc'), orderBy('createdAt', 'desc')]
    : [orderBy('createdAt', 'desc')]

export const getFeedPage = async (
  cursor: QueryDocumentSnapshot | null,
  mode: FeedMode = 'latest'
): Promise<FeedPage> => {
  const constraints = [
    where('isPublished', '==', true),
    ...sortConstraintsFor(mode),
    limit(PAGE_SIZE)
  ]

  const q = cursor
    ? query(collection(db, 'posts'), ...constraints, startAfter(cursor))
    : query(collection(db, 'posts'), ...constraints)

  const snap = await getDocs(q)
  const posts = snap.docs.map(postFromDoc)
  const nextCursor = snap.docs.length > 0 ? snap.docs[snap.docs.length - 1]! : null

  return {
    posts,
    cursor: nextCursor,
    hasMore: snap.docs.length === PAGE_SIZE
  }
}

/**
 * Live subscription to the first page of the feed.
 * The callback fires immediately and on any subsequent change.
 * Returns an unsubscribe function.
 */
export const subscribeFeedFirstPage = (
  mode: FeedMode,
  onUpdate: (posts: Post[], lastDoc: QueryDocumentSnapshot | null) => void,
  onError?: (err: FirestoreError) => void
): (() => void) => {
  const q = query(
    collection(db, 'posts'),
    where('isPublished', '==', true),
    ...sortConstraintsFor(mode),
    limit(PAGE_SIZE)
  )

  return onSnapshot(
    q,
    (snap) => {
      const posts = snap.docs.map(postFromDoc)
      const lastDoc = snap.docs.length > 0 ? snap.docs[snap.docs.length - 1]! : null
      onUpdate(posts, lastDoc)
    },
    onError
  )
}

export const getUserPosts = async (userId: string): Promise<Post[]> => {
  const q = query(
    collection(db, 'posts'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(50)
  )
  const snap = await getDocs(q)
  return snap.docs.map(postFromDoc)
}

export const toggleLike = async (
  postId: string,
  userId: string,
  alreadyLiked: boolean
): Promise<void> => {
  await updateDoc(doc(db, 'posts', postId), {
    likes: alreadyLiked ? arrayRemove(userId) : arrayUnion(userId),
    likesCount: increment(alreadyLiked ? -1 : 1),
    updatedAt: serverTimestamp()
  })
}

export const deletePost = async (postId: string): Promise<void> => {
  await updateDoc(doc(db, 'posts', postId), {
    isPublished: false,
    updatedAt: serverTimestamp()
  })
}
