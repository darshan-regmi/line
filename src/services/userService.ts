import { User as FirebaseUser } from 'firebase/auth'
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where
} from 'firebase/firestore'

import { db } from '../config/firebase'

import { UserProfile } from '../types'
import { createNotification } from './notificationService'

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

  const username = signup?.username ?? fallbackUsername
  const displayName = signup?.displayName ?? firebaseUser.displayName ?? 'Poet'

  await setDoc(doc(db, 'users', firebaseUser.uid), {
    uid: firebaseUser.uid,
    username,
    usernameLower: username.toLowerCase(),
    email: firebaseUser.email ?? '',
    displayName,
    displayNameLower: displayName.toLowerCase(),
    bio: '',
    avatarType: 'initials',
    avatarIndex: Math.floor(Math.random() * 10),
    followersCount: 0,
    followingCount: 0,
    expoPushTokens: [],
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
    expoPushTokens: data.expoPushTokens ?? [],
    createdAt: data.createdAt ?? null,
    updatedAt: data.updatedAt ?? null
  }
}

export const updateUser = async (
  uid: string,
  updates: Partial<Pick<UserProfile, 'displayName' | 'bio' | 'avatarIndex'>>
): Promise<void> => {
  const enriched: Record<string, unknown> = {
    ...updates,
    updatedAt: serverTimestamp()
  }
  // Keep displayNameLower in sync so search results reflect renames
  if (updates.displayName !== undefined) {
    enriched.displayNameLower = updates.displayName.toLowerCase()
  }
  await updateDoc(doc(db, 'users', uid), enriched)
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

  // Best-effort notification to the followed user
  void createNotification({
    recipientUid: targetUid,
    actorUid: currentUid,
    type: 'follow'
  })
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

/**
 * Fetches user profiles for an array of uids in parallel.
 * Skips uids whose docs don't exist (e.g., deleted accounts).
 */
export const getUsersByIds = async (uids: string[]): Promise<UserProfile[]> => {
  if (uids.length === 0) return []
  const results = await Promise.all(uids.map((uid) => getUser(uid)))
  return results.filter((u): u is UserProfile => u !== null)
}

const userFromQueryDoc = (snap: { id: string; data: () => any }): UserProfile => {
  const data = snap.data() ?? {}
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
    expoPushTokens: data.expoPushTokens ?? [],
    createdAt: data.createdAt ?? null,
    updatedAt: data.updatedAt ?? null
  }
}

/**
 * Returns the uids the current user is following. Reads /users/{uid}/following.
 */
export const getFollowingUids = async (uid: string): Promise<string[]> => {
  const snap = await getDocs(collection(db, 'users', uid, 'following'))
  return snap.docs.map((d) => d.id)
}

/**
 * Suggested accounts to follow: top users by followersCount, excluding
 * the current user and anyone already followed. Over-fetches to allow
 * client-side filtering, then trims to `max`.
 */
export const getSuggestedUsers = async (
  currentUid: string,
  excludeUids: string[],
  max = 5
): Promise<UserProfile[]> => {
  const exclude = new Set([currentUid, ...excludeUids])
  const q = query(
    collection(db, 'users'),
    orderBy('followersCount', 'desc'),
    limit(max + exclude.size + 1)
  )
  const snap = await getDocs(q)
  return snap.docs
    .map(userFromQueryDoc)
    .filter((u) => !exclude.has(u.uid))
    .slice(0, max)
}

/**
 * Prefix-match users by lowercased username. Existing docs without
 * `usernameLower` won't appear (no backfill performed).
 */
export const searchUsers = async (prefix: string, max = 10): Promise<UserProfile[]> => {
  const lower = prefix.trim().toLowerCase()
  if (!lower) return []

  const q = query(
    collection(db, 'users'),
    where('usernameLower', '>=', lower),
    where('usernameLower', '<', lower + '\uf8ff'),
    orderBy('usernameLower'),
    limit(max)
  )
  const snap = await getDocs(q)
  return snap.docs.map(userFromQueryDoc)
}
