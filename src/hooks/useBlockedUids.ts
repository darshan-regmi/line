import { useEffect, useMemo, useState } from 'react'

import { useAuth } from '../context/AuthContext'
import { subscribeBlockedUids } from '../services/blockService'

/**
 * Real-time set of uids the current user has blocked.
 * Returns a Set for O(1) `has` checks used to filter feeds, notifications,
 * suggested users, and so on.
 */
export const useBlockedUids = () => {
  const { user } = useAuth()
  const uid = user?.uid
  const [ids, setIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!uid) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIds([])
      setLoading(false)
      return
    }
    setLoading(true)
    const unsubscribe = subscribeBlockedUids(
      uid,
      (next) => {
        setIds(next)
        setLoading(false)
      },
      () => setLoading(false)
    )
    return unsubscribe
  }, [uid])

  const idSet = useMemo(() => new Set(ids), [ids])

  return { ids, idSet, loading }
}
