import { User as FirebaseUser } from 'firebase/auth'
import {
  deleteDoc,
  doc,
  getDoc,
  increment,
  serverTimestamp,
  setDoc,
  updateDoc
} from 'firebase/firestore'

import { db } from '../config/firebase'

import { UserProfile } from '../types'

let pendingSignup: { username?: string; displayName?: string } | null = null

export const setPendingSignup = (info: { username: string; displayName: string } | null) => {
  pendingSignup = info
}

const sanitizeUsername = (raw: string): string =>
  raw
    .toLowerCase()
    .replace(/[^a-z0-9_.]/g, '')
    .slice(0, 24) || 'poet'

export const ensureUserDoc = async (firebaseUser: FirebaseUser): Promise<UserProfile> => {
  const existing = await getUser(firebaseUser.uid)
  if (existing) return existing

  // Drain the buffer so a later sign-in can't reuse stale signup info
  const signup = pendingSignup
  pendingSignup = null

  const emailPrefix = firebaseUser.email?.split('@')[0] ?? ''
  const fallbackUsername = sanitizeUsername(emailPrefix) + firebaseUser.uid.slice(-4).toLowerCase()

  await setDoc(doc(db, 'users', firebaseUser.uid), {
    uid: firebaseUser.uid,
    username: signup?.username ?? fallbackUsername,
    email: firebaseUser.email ?? '',
    displayName: signup?.displayName ?? firebaseUser.displayName ?? 'Poet',
    bio: '',
    avatarType: 'initials',
    avatarIndex: Math.floor(Math.random() * 10),
    followersCount: 0,
    followingCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  })

  const created = await getUser(firebaseUser.uid)
  if (!created) throw new Error('Failed to read back created user doc')
  return created
}

export const getUser = async (uid: string): Promise<UserProfile | null> => {
  const snap = await getDoc(doc(db, 'users', uid))
  if (!snap.exists()) return null
  const data = snap.data()
  return {
    uid: snap.id,
    username: data.username ?? '',
    email: data.email ?? '',
    displayName: data.displayName ?? '',
    bio: data.bio ?? '',
    avatarType: data.avatarType ?? 'initials',
    avatarIndex: data.avatarIndex ?? 0,
    followersCount: data.followersCount ?? 0,
    followingCount: data.followingCount ?? 0,
    createdAt: data.createdAt ?? null,
    updatedAt: data.updatedAt ?? null
  }
}

export const updateUser = async (
  uid: string,
  updates: Partial<Pick<UserProfile, 'displayName' | 'bio' | 'avatarIndex'>>
): Promise<void> => {
  await updateDoc(doc(db, 'users', uid), {
    ...updates,
    updatedAt: serverTimestamp()
  })
}

export const followUser = async (currentUid: string, targetUid: string): Promise<void> => {
  if (currentUid === targetUid) return

  await setDoc(doc(db, 'users', currentUid, 'following', targetUid), {
    followedAt: serverTimestamp()
  })
  await setDoc(doc(db, 'users', targetUid, 'followers', currentUid), {
    followedAt: serverTimestamp()
  })

  await updateDoc(doc(db, 'users', currentUid), { followingCount: increment(1) })
  await updateDoc(doc(db, 'users', targetUid), { followersCount: increment(1) })
}

export const unfollowUser = async (currentUid: string, targetUid: string): Promise<void> => {
  if (currentUid === targetUid) return

  await deleteDoc(doc(db, 'users', currentUid, 'following', targetUid))
  await deleteDoc(doc(db, 'users', targetUid, 'followers', currentUid))

  await updateDoc(doc(db, 'users', currentUid), { followingCount: increment(-1) })
  await updateDoc(doc(db, 'users', targetUid), { followersCount: increment(-1) })
}

export const isFollowing = async (currentUid: string, targetUid: string): Promise<boolean> => {
  const snap = await getDoc(doc(db, 'users', currentUid, 'following', targetUid))
  return snap.exists()
}
