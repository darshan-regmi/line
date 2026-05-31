import {
  collection,
  deleteDoc,
  doc,
  FirestoreError,
  getDoc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc
} from 'firebase/firestore'

import { db } from '../config/firebase'

/**
 * Strictly private block list at /users/{uid}/blocked/{blockedUid}.
 * Doc id == the blocked user's uid so toggle is O(1).
 *
 * Limitation: blocking is currently one-way client-side. The blocked
 * user's actions toward you still write (and notify) — your client just
 * filters them out before display. Rule-level mutual blocking is a
 * Phase 4 item.
 */

export const blockUser = async (uid: string, blockedUid: string): Promise<void> => {
  if (uid === blockedUid) return
  await setDoc(doc(db, 'users', uid, 'blocked', blockedUid), {
    blockedAt: serverTimestamp()
  })
}

export const unblockUser = async (uid: string, blockedUid: string): Promise<void> => {
  await deleteDoc(doc(db, 'users', uid, 'blocked', blockedUid))
}

export const isUserBlocked = async (uid: string, targetUid: string): Promise<boolean> => {
  const snap = await getDoc(doc(db, 'users', uid, 'blocked', targetUid))
  return snap.exists()
}

export const subscribeBlockedUids = (
  uid: string,
  onUpdate: (uids: string[]) => void,
  onError?: (err: FirestoreError) => void
): (() => void) => {
  const q = query(collection(db, 'users', uid, 'blocked'), orderBy('blockedAt', 'desc'), limit(200))
  return onSnapshot(q, (snap) => onUpdate(snap.docs.map((d) => d.id)), onError)
}
