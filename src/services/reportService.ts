import { addDoc, collection, serverTimestamp } from 'firebase/firestore'

import { db } from '../config/firebase'

import { ReportReason, ReportTargetType } from '../types'

/**
 * Submits a moderation report. Reports are write-only from the client —
 * admins review the queue in the Firebase Console. Rules enforce:
 *   - reporterUid must match the auth uid
 *   - status starts 'open'
 *   - targetType and reason are constrained to known values
 *
 * Note is optional, capped at 280 chars to keep stored reports compact.
 */
export const createReport = async (input: {
  reporterUid: string
  targetType: ReportTargetType
  targetId: string
  reason: ReportReason
  note?: string
  postId?: string
}): Promise<void> => {
  const payload: Record<string, unknown> = {
    reporterUid: input.reporterUid,
    targetType: input.targetType,
    targetId: input.targetId,
    reason: input.reason,
    status: 'open',
    createdAt: serverTimestamp()
  }
  if (input.note) payload.note = input.note.trim().slice(0, 280)
  if (input.postId) payload.postId = input.postId

  await addDoc(collection(db, 'reports'), payload)
}
