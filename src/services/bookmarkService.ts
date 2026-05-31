import {
  collection,
  deleteDoc,
  doc,
  documentId,
  FirestoreError,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where
} from 'firebase/firestore'

import { db } from '../config/firebase'

import { Post } from '../types'

const IN_CLAUSE_MAX = 30

/**
 * Strictly private bookmarks. Doc id == postId so toggle is O(1).
 * Lives at /users/{uid}/bookmarks/{postId}.
 */

export const addBookmark = async (uid: string, postId: string): Promise<void> => {
  await setDoc(doc(db, 'users', uid, 'bookmarks', postId), {
    createdAt: serverTimestamp()
  })
}

export const removeBookmark = async (uid: string, postId: string): Promise<void> => {
  await deleteDoc(doc(db, 'users', uid, 'bookmarks', postId))
}

export const isBookmarked = async (uid: string, postId: string): Promise<boolean> => {
  const snap = await getDoc(doc(db, 'users', uid, 'bookmarks', postId))
  return snap.exists()
}

/**
 * Live subscription to the current user's bookmarked postIds, most-recent first.
 */
export const subscribeBookmarkIds = (
  uid: string,
  onUpdate: (postIds: string[]) => void,
  onError?: (err: FirestoreError) => void
): (() => void) => {
  const q = query(
    collection(db, 'users', uid, 'bookmarks'),
    orderBy('createdAt', 'desc'),
    limit(100)
  )
  return onSnapshot(q, (snap) => onUpdate(snap.docs.map((d) => d.id)), onError)
}

/**
 * Hydrates a list of postIds into Post documents in a single batched query.
 * Preserves the input order so SavedScreen renders most-recently-bookmarked first.
 *
 * Uses where(documentId(), 'in', [...]) — capped at 30 by Firestore. If more
 * than 30 are passed, the first 30 are returned; SavedScreen should paginate.
 */
export const hydrateBookmarkedPosts = async (postIds: string[]): Promise<Post[]> => {
  if (postIds.length === 0) return []
  const batch = postIds.slice(0, IN_CLAUSE_MAX)
  const q = query(collection(db, 'posts'), where(documentId(), 'in', batch))
  const snap = await getDocs(q)

  // Map then sort by the original `batch` order
  const byId = new Map<string, Post>()
  for (const d of snap.docs) {
    const data = d.data() ?? {}
    byId.set(d.id, {
      postId: d.id,
      userId: data.userId ?? '',
      title: data.title ?? '',
      content: data.content ?? '',
      likes: data.likes ?? [],
      likesCount: data.likesCount ?? 0,
      commentsCount: data.commentsCount ?? 0,
      viewCount: data.viewCount ?? 0,
      isPublished: data.isPublished ?? false,
      createdAt: data.createdAt ?? null,
      updatedAt: data.updatedAt ?? null
    })
  }

  return batch.map((id) => byId.get(id)).filter((p): p is Post => !!p)
}
