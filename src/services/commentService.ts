import {
  addDoc,
  collection,
  doc,
  getDocs,
  increment,
  limit,
  orderBy,
  query,
  QueryDocumentSnapshot,
  serverTimestamp,
  updateDoc
} from 'firebase/firestore'

import { db } from '../config/firebase'

import { Comment } from '../types'

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
  content: string
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
