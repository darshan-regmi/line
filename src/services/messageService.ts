import {
  collection,
  doc,
  FirestoreError,
  getDoc,
  increment,
  limit,
  onSnapshot,
  orderBy,
  query,
  QueryDocumentSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch
} from 'firebase/firestore'

import { db } from '../config/firebase'

import { Message, Thread } from '../types'

/**
 * Direct messages between two users.
 *
 * Thread id convention: sortedUids.join('_'). Same pair always maps to
 * the same id so we never create duplicate threads from either side.
 */

export const threadIdFor = (uidA: string, uidB: string): string => [uidA, uidB].sort().join('_')

const threadFromDoc = (snap: QueryDocumentSnapshot): Thread => {
  const data = snap.data()
  return {
    threadId: snap.id,
    participantIds: data.participantIds ?? [],
    lastMessage: data.lastMessage ?? null,
    lastMessageAt: data.lastMessageAt ?? null,
    lastMessageSenderId: data.lastMessageSenderId ?? null,
    unreadCounts: data.unreadCounts ?? {},
    createdAt: data.createdAt ?? null,
    updatedAt: data.updatedAt ?? null
  }
}

const messageFromDoc = (snap: QueryDocumentSnapshot): Message => {
  const data = snap.data()
  return {
    messageId: snap.id,
    senderId: data.senderId ?? '',
    content: data.content ?? '',
    createdAt: data.createdAt ?? null
  }
}

/**
 * Returns the threadId for the (currentUid, otherUid) pair, creating
 * the thread doc if it doesn't exist yet.
 */
export const getOrCreateThread = async (currentUid: string, otherUid: string): Promise<string> => {
  if (currentUid === otherUid) throw new Error('Cannot DM yourself')
  const threadId = threadIdFor(currentUid, otherUid)
  const ref = doc(db, 'threads', threadId)
  const existing = await getDoc(ref)
  if (existing.exists()) return threadId

  await setDoc(ref, {
    participantIds: [currentUid, otherUid].sort(),
    lastMessage: null,
    lastMessageAt: null,
    lastMessageSenderId: null,
    unreadCounts: { [currentUid]: 0, [otherUid]: 0 },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  })
  return threadId
}

/**
 * Live subscription to a user's threads, most-recent activity first.
 */
export const subscribeThreads = (
  uid: string,
  onUpdate: (threads: Thread[]) => void,
  onError?: (err: FirestoreError) => void
): (() => void) => {
  const q = query(
    collection(db, 'threads'),
    where('participantIds', 'array-contains', uid),
    orderBy('lastMessageAt', 'desc'),
    limit(50)
  )
  return onSnapshot(q, (snap) => onUpdate(snap.docs.map(threadFromDoc)), onError)
}

/**
 * Live subscription to messages inside a thread, oldest at top of the
 * returned array. The UI typically reverses for a chat view; we keep
 * the natural order here so callers can choose.
 */
export const subscribeMessages = (
  threadId: string,
  onUpdate: (messages: Message[]) => void,
  onError?: (err: FirestoreError) => void
): (() => void) => {
  const q = query(
    collection(db, 'threads', threadId, 'messages'),
    orderBy('createdAt', 'asc'),
    limit(200)
  )
  return onSnapshot(q, (snap) => onUpdate(snap.docs.map(messageFromDoc)), onError)
}

/**
 * Sends a message and atomically updates the thread envelope (last
 * message snippet + recipient's unread count).
 */
export const sendMessage = async (
  threadId: string,
  senderId: string,
  recipientUid: string,
  content: string
): Promise<void> => {
  const trimmed = content.trim()
  if (!trimmed) return

  const messageRef = doc(collection(db, 'threads', threadId, 'messages'))
  const threadRef = doc(db, 'threads', threadId)

  const batch = writeBatch(db)
  batch.set(messageRef, {
    senderId,
    content: trimmed,
    createdAt: serverTimestamp()
  })
  batch.update(threadRef, {
    lastMessage: trimmed.slice(0, 200),
    lastMessageAt: serverTimestamp(),
    lastMessageSenderId: senderId,
    [`unreadCounts.${recipientUid}`]: increment(1),
    updatedAt: serverTimestamp()
  })
  await batch.commit()
}

/**
 * Mark a thread as read for the current user (clears their unread count).
 * Best-effort; failure is silent so it never blocks the UI.
 */
export const markThreadRead = async (threadId: string, uid: string): Promise<void> => {
  try {
    await updateDoc(doc(db, 'threads', threadId), {
      [`unreadCounts.${uid}`]: 0
    })
  } catch {
    /* non-fatal */
  }
}
