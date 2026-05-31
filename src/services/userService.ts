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

/**
 * Pure format check (no network). Returns null on success or a human-readable
 * error string on failure.
 */
export const validateUsernameFormat = (raw: string): string | null => {
  const trimmed = raw.trim().toLowerCase()
  if (trimmed.length < 3) return 'Username must be at least 3 characters.'
  if (trimmed.length > 24) return 'Username must be 24 characters or fewer.'
  if (!/^[a-z0-9_.]+$/.test(trimmed)) {
    return 'Use lowercase letters, numbers, dots or underscores.'
  }
  return null
}

/**
 * Reads `/usernames/{usernameLower}` to check whether the username is free.
 * Caller must be signed-in (rules require it).
 */
export const isUsernameAvailable = async (raw: string): Promise<boolean> => {
  const usernameLower = raw.trim().toLowerCase()
  if (validateUsernameFormat(usernameLower) !== null) return false
  const snap = await getDoc(doc(db, 'usernames', usernameLower))
  return !snap.exists()
}

const claimUsername = async (uid: string, usernameLower: string): Promise<void> => {
  await setDoc(doc(db, 'usernames', usernameLower), {
    uid,
    claimedAt: serverTimestamp()
  })
}

export const releaseUsername = async (usernameLower: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'usernames', usernameLower))
  } catch {
    /* best-effort */
  }
}

/**
 * Self-deletes the user's data in a best-effort sweep before the caller
 * deletes the Firebase Auth account. Steps:
 *   1. Unpublish (don't delete) every post authored by this user, so other
 *      users' comments/likes don't vanish mid-thread.
 *   2. Delete the user's bookmarks, blocked, following, followers, and
 *      notifications subcollections.
 *   3. For each user we follow, decrement their followersCount; for each
 *      follower of ours, decrement their followingCount (mirrors unfollow).
 *   4. Delete every collection we own and its post-references subcollection.
 *   5. Release the /usernames/{lower} claim.
 *   6. Delete /users/{uid}.
 *
 * DMs are intentionally untouched: thread rules deny client deletes so
 * history is preserved for the other participant (called out in the
 * privacy policy).
 *
 * Each step is wrapped — partial cleanup is better than an early abort.
 */
export const deleteAccount = async (uid: string): Promise<void> => {
  const profile = await getUser(uid)

  // 1) Unpublish authored posts
  try {
    const posts = await getDocs(query(collection(db, 'posts'), where('userId', '==', uid)))
    await Promise.all(
      posts.docs.map((p) =>
        updateDoc(p.ref, { isPublished: false, updatedAt: serverTimestamp() }).catch(() => {})
      )
    )
  } catch {
    /* best-effort */
  }

  // 2) Wipe per-user subcollections that only the owner can touch
  const wipeSubcollection = async (name: string): Promise<void> => {
    try {
      const snap = await getDocs(collection(db, 'users', uid, name))
      await Promise.all(snap.docs.map((d) => deleteDoc(d.ref).catch(() => {})))
    } catch {
      /* best-effort */
    }
  }

  // 3) Symmetric follow cleanup — read first so we know whom to decrement
  let followingUids: string[] = []
  let followerUids: string[] = []
  try {
    const [followingSnap, followersSnap] = await Promise.all([
      getDocs(collection(db, 'users', uid, 'following')),
      getDocs(collection(db, 'users', uid, 'followers'))
    ])
    followingUids = followingSnap.docs.map((d) => d.id)
    followerUids = followersSnap.docs.map((d) => d.id)
  } catch {
    /* best-effort */
  }

  await Promise.all([
    wipeSubcollection('bookmarks'),
    wipeSubcollection('blocked'),
    wipeSubcollection('notifications'),
    wipeSubcollection('following'),
    wipeSubcollection('followers')
  ])

  // Remove the inverse edges and decrement counters on the other end
  await Promise.all([
    ...followingUids.map(async (target) => {
      try {
        await deleteDoc(doc(db, 'users', target, 'followers', uid))
        await updateDoc(doc(db, 'users', target), {
          followersCount: increment(-1),
          updatedAt: serverTimestamp()
        })
      } catch {
        /* best-effort */
      }
    }),
    ...followerUids.map(async (follower) => {
      try {
        await deleteDoc(doc(db, 'users', follower, 'following', uid))
        await updateDoc(doc(db, 'users', follower), {
          followingCount: increment(-1),
          updatedAt: serverTimestamp()
        })
      } catch {
        /* best-effort */
      }
    })
  ])

  // 4) Owned collections
  try {
    const owned = await getDocs(query(collection(db, 'collections'), where('ownerId', '==', uid)))
    await Promise.all(
      owned.docs.map(async (col) => {
        try {
          const inner = await getDocs(collection(db, 'collections', col.id, 'posts'))
          await Promise.all(inner.docs.map((p) => deleteDoc(p.ref).catch(() => {})))
        } catch {
          /* best-effort */
        }
        try {
          await deleteDoc(col.ref)
        } catch {
          /* best-effort */
        }
      })
    )
  } catch {
    /* best-effort */
  }

  // 5) Release the username
  if (profile?.username) {
    await releaseUsername(profile.username.toLowerCase())
  }

  // 6) Finally, the user doc itself
  try {
    await deleteDoc(doc(db, 'users', uid))
  } catch {
    /* best-effort */
  }
}

export const ensureUserDoc = async (firebaseUser: FirebaseUser): Promise<UserProfile> => {
  const existing = await getUser(firebaseUser.uid)
  if (existing) return existing

  // Drain the buffer so a later sign-in can't reuse stale signup info
  const signup = pendingSignup
  pendingSignup = null

  const emailPrefix = firebaseUser.email?.split('@')[0] ?? ''
  const fallbackUsername = sanitizeUsername(emailPrefix) + firebaseUser.uid.slice(-4).toLowerCase()

  const desired = signup?.username?.trim().toLowerCase() || fallbackUsername
  const displayName = signup?.displayName ?? firebaseUser.displayName ?? 'Poet'

  // Try to claim the desired username; if it's already taken, fall back to
  // `<sanitized-email-prefix><uid-suffix>` which is effectively unique per uid.
  let username = desired
  try {
    await claimUsername(firebaseUser.uid, desired)
  } catch {
    username = fallbackUsername
    await claimUsername(firebaseUser.uid, fallbackUsername)
  }

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
