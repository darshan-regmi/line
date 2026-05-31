import {
  addDoc,
  collection,
  doc,
  FirestoreError,
  limit,
  onSnapshot,
  orderBy,
  query,
  QueryDocumentSnapshot,
  serverTimestamp,
  updateDoc,
  writeBatch
} from 'firebase/firestore'

import { db } from '../config/firebase'

import { Notification, NotificationType } from '../types'
import { sendPushToUser } from './pushService'
import { getUser } from './userService'

const verbForType: Record<NotificationType, string> = {
  like: 'liked your poem',
  comment: 'commented on your poem',
  follow: 'started following you'
}

const notificationFromDoc = (snap: QueryDocumentSnapshot): Notification => {
  const data = snap.data()
  return {
    notificationId: snap.id,
    type: data.type as NotificationType,
    actorUid: data.actorUid ?? '',
    recipientUid: data.recipientUid ?? '',
    postId: data.postId,
    commentId: data.commentId,
    read: data.read ?? false,
    createdAt: data.createdAt ?? null
  }
}

/**
 * Best-effort write of a notification to the recipient's inbox.
 * Silently no-ops on self-target and swallows errors so a failed
 * notification never blocks the underlying user action.
 */
export const createNotification = async (input: {
  recipientUid: string
  actorUid: string
  type: NotificationType
  postId?: string
  commentId?: string
}): Promise<void> => {
  if (!input.recipientUid || input.recipientUid === input.actorUid) return

  try {
    const payload: Record<string, unknown> = {
      type: input.type,
      actorUid: input.actorUid,
      recipientUid: input.recipientUid,
      read: false,
      createdAt: serverTimestamp()
    }
    if (input.postId) payload.postId = input.postId
    if (input.commentId) payload.commentId = input.commentId

    await addDoc(collection(db, 'users', input.recipientUid, 'notifications'), payload)
  } catch {
    // Non-fatal: notification write may fail offline or due to rules drift
  }

  // Fire push to the recipient's devices, best-effort. Looks up the
  // actor's displayName to compose a friendly banner. Failures are silent
  // and never block the action.
  try {
    const actor = await getUser(input.actorUid)
    const name = actor?.displayName ?? 'Someone'
    await sendPushToUser(input.recipientUid, 'Line', `${name} ${verbForType[input.type]}`, {
      type: input.type,
      postId: input.postId,
      commentId: input.commentId,
      actorUid: input.actorUid
    })
  } catch {
    /* best-effort */
  }
}

/**
 * Live subscription to a user's notification inbox, most-recent first.
 */
export const subscribeNotifications = (
  recipientUid: string,
  onUpdate: (notifications: Notification[]) => void,
  onError?: (err: FirestoreError) => void
): (() => void) => {
  const q = query(
    collection(db, 'users', recipientUid, 'notifications'),
    orderBy('createdAt', 'desc'),
    limit(50)
  )
  return onSnapshot(q, (snap) => onUpdate(snap.docs.map(notificationFromDoc)), onError)
}

export const markNotificationRead = async (
  recipientUid: string,
  notificationId: string
): Promise<void> => {
  await updateDoc(doc(db, 'users', recipientUid, 'notifications', notificationId), {
    read: true
  })
}

/**
 * Marks every passed notification as read in a single Firestore batch.
 * Caller should pass only unread IDs to avoid unnecessary writes.
 */
export const markAllNotificationsRead = async (
  recipientUid: string,
  notificationIds: string[]
): Promise<void> => {
  if (notificationIds.length === 0) return
  const batch = writeBatch(db)
  for (const id of notificationIds) {
    batch.update(doc(db, 'users', recipientUid, 'notifications', id), { read: true })
  }
  await batch.commit()
}
