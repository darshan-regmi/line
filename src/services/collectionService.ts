import {
  addDoc,
  collection,
  deleteDoc,
  doc,
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
  setDoc,
  where,
  writeBatch
} from 'firebase/firestore'

import { db } from '../config/firebase'

import { Collection } from '../types'

const collectionFromDoc = (snap: QueryDocumentSnapshot): Collection => {
  const data = snap.data() ?? {}
  return {
    collectionId: snap.id,
    ownerId: data.ownerId ?? '',
    title: data.title ?? '',
    description: data.description ?? '',
    isPublic: data.isPublic ?? false,
    postCount: data.postCount ?? 0,
    createdAt: data.createdAt ?? null,
    updatedAt: data.updatedAt ?? null
  }
}

export const createCollection = async (input: {
  ownerId: string
  title: string
  description?: string
  isPublic: boolean
}): Promise<string> => {
  const ref = await addDoc(collection(db, 'collections'), {
    ownerId: input.ownerId,
    title: input.title.trim(),
    description: input.description?.trim() ?? '',
    isPublic: input.isPublic,
    postCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  })
  return ref.id
}

export const getCollection = async (collectionId: string): Promise<Collection | null> => {
  const snap = await getDoc(doc(db, 'collections', collectionId))
  if (!snap.exists()) return null
  return collectionFromDoc(snap as QueryDocumentSnapshot)
}

export const updateCollection = async (
  collectionId: string,
  updates: Partial<Pick<Collection, 'title' | 'description' | 'isPublic'>>
): Promise<void> => {
  const ref = doc(db, 'collections', collectionId)
  const enriched: Record<string, unknown> = {
    ...updates,
    updatedAt: serverTimestamp()
  }
  if (updates.title !== undefined) enriched.title = updates.title.trim()
  if (updates.description !== undefined) enriched.description = updates.description.trim()
  await setDoc(ref, enriched, { merge: true })
}

/**
 * Deletes a collection and all post references inside it.
 * Rules limit deletion to the owner.
 */
export const deleteCollection = async (collectionId: string): Promise<void> => {
  // First clear the subcollection (limited to 100 — fine for MVP scale)
  const postsSnap = await getDocs(collection(db, 'collections', collectionId, 'posts'))
  const batch = writeBatch(db)
  for (const d of postsSnap.docs) {
    batch.delete(d.ref)
  }
  await batch.commit()
  await deleteDoc(doc(db, 'collections', collectionId))
}

/**
 * Live subscription to a user's collections, newest first.
 * Caller must filter for visibility — service returns all of the owner's
 * docs; rules block private docs from non-owners anyway.
 */
export const subscribeUserCollections = (
  ownerId: string,
  onUpdate: (collections: Collection[]) => void,
  onError?: (err: FirestoreError) => void
): (() => void) => {
  const q = query(
    collection(db, 'collections'),
    where('ownerId', '==', ownerId),
    orderBy('createdAt', 'desc'),
    limit(50)
  )
  return onSnapshot(q, (snap) => onUpdate(snap.docs.map(collectionFromDoc)), onError)
}

export const getUserCollections = async (ownerId: string): Promise<Collection[]> => {
  const q = query(
    collection(db, 'collections'),
    where('ownerId', '==', ownerId),
    orderBy('createdAt', 'desc'),
    limit(50)
  )
  const snap = await getDocs(q)
  return snap.docs.map(collectionFromDoc)
}

/**
 * Adds a post to a collection AND bumps postCount in a single atomic batch.
 * Safe to call repeatedly — no-ops if the post is already in the collection.
 */
export const addPostToCollection = async (collectionId: string, postId: string): Promise<void> => {
  const postRef = doc(db, 'collections', collectionId, 'posts', postId)
  const existing = await getDoc(postRef)
  if (existing.exists()) return // idempotent

  const batch = writeBatch(db)
  batch.set(postRef, { addedAt: serverTimestamp() })
  batch.update(doc(db, 'collections', collectionId), {
    postCount: increment(1),
    updatedAt: serverTimestamp()
  })
  await batch.commit()
}

export const removePostFromCollection = async (
  collectionId: string,
  postId: string
): Promise<void> => {
  const postRef = doc(db, 'collections', collectionId, 'posts', postId)
  const existing = await getDoc(postRef)
  if (!existing.exists()) return

  const batch = writeBatch(db)
  batch.delete(postRef)
  batch.update(doc(db, 'collections', collectionId), {
    postCount: increment(-1),
    updatedAt: serverTimestamp()
  })
  await batch.commit()
}

/**
 * Returns the postIds in a collection, most-recently-added first.
 */
export const getCollectionPostIds = async (collectionId: string): Promise<string[]> => {
  const q = query(
    collection(db, 'collections', collectionId, 'posts'),
    orderBy('addedAt', 'desc'),
    limit(100)
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => d.id)
}
