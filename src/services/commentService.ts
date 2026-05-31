import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  FirestoreError,
  getDocs,
  increment,
  limit,
  onSnapshot,
  orderBy,
  query,
  QueryDocumentSnapshot,
  serverTimestamp,
  updateDoc
} from 'firebase/firestore'

import { db } from '../config/firebase'

import { Comment } from '../types'
import { createNotification } from './notificationService'

const commentFromDoc = (snap: QueryDocumentSnapshot): Comment => {
  const data = snap.data()
  return {
    commentId: snap.id,
    userId: data.userId ?? '',
    content: data.content ?? '',
    likes: data.likes ?? [],
    likesCount: data.likesCount ?? 0,
    createdAt: data.createdAt ?? null
  }
}

export const addComment = async (
  postId: string,
  userId: string,
  content: string,
  postAuthorUid?: string
): Promise<string> => {
  const ref = await addDoc(collection(db, 'posts', postId, 'comments'), {
    userId,
    content: content.trim(),
    likes: [],
    likesCount: 0,
    createdAt: serverTimestamp()
  })

  await updateDoc(doc(db, 'posts', postId), {
    commentsCount: increment(1),
    updatedAt: serverTimestamp()
  })

  // Best-effort notification to the post author
  if (postAuthorUid) {
    void createNotification({
      recipientUid: postAuthorUid,
      actorUid: userId,
      type: 'comment',
      postId,
      commentId: ref.id
    })
  }

  return ref.id
}

export const getComments = async (postId: string): Promise<Comment[]> => {
  const q = query(
    collection(db, 'posts', postId, 'comments'),
    orderBy('createdAt', 'desc'),
    limit(50)
  )
  const snap = await getDocs(q)
  return snap.docs.map(commentFromDoc)
}

export const toggleCommentLike = async (
  postId: string,
  commentId: string,
  userId: string,
  alreadyLiked: boolean
): Promise<void> => {
  await updateDoc(doc(db, 'posts', postId, 'comments', commentId), {
    likes: alreadyLiked ? arrayRemove(userId) : arrayUnion(userId),
    likesCount: increment(alreadyLiked ? -1 : 1)
  })
}

/**
 * Live subscription to a post's comments.
 * Callback fires immediately and on every change.
 * Returns an unsubscribe function.
 */
export const subscribeComments = (
  postId: string,
  onUpdate: (comments: Comment[]) => void,
  onError?: (err: FirestoreError) => void
): (() => void) => {
  const q = query(
    collection(db, 'posts', postId, 'comments'),
    orderBy('createdAt', 'desc'),
    limit(50)
  )

  return onSnapshot(q, (snap) => onUpdate(snap.docs.map(commentFromDoc)), onError)
}
