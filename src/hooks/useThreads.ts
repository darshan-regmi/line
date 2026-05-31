import { useEffect, useMemo, useState } from 'react'

import { useAuth } from '../context/AuthContext'
import { subscribeThreads } from '../services/messageService'

import { Thread } from '../types'
import { useBlockedUids } from './useBlockedUids'

/**
 * Real-time list of the current user's DM threads.
 * Filters out threads whose OTHER participant is blocked.
 */
export const useThreads = () => {
  const { user } = useAuth()
  const uid = user?.uid
  const { idSet: blockedSet } = useBlockedUids()

  const [threads, setThreads] = useState<Thread[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!uid) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setThreads([])
      setLoading(false)
      return
    }
    setLoading(true)
    const unsubscribe = subscribeThreads(
      uid,
      (next) => {
        setThreads(next)
        setLoading(false)
      },
      () => setLoading(false)
    )
    return unsubscribe
  }, [uid])

  const visible = useMemo(() => {
    if (!uid) return []
    return threads.filter((t) => {
      const other = t.participantIds.find((p) => p !== uid)
      return other ? !blockedSet.has(other) : true
    })
  }, [threads, uid, blockedSet])

  const totalUnread = useMemo(() => {
    if (!uid) return 0
    return visible.reduce((sum, t) => sum + (t.unreadCounts?.[uid] ?? 0), 0)
  }, [visible, uid])

  return { threads: visible, totalUnread, loading }
}
