import { useEffect, useState } from 'react'

import { useAuth } from '../context/AuthContext'
import { subscribeBookmarkIds } from '../services/bookmarkService'

/**
 * Real-time set of postIds the current user has bookmarked.
 * Returned as a Set for O(1) `has` checks in BookmarkButton etc.
 */
export const useBookmarkIds = () => {
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
    const unsubscribe = subscribeBookmarkIds(
      uid,
      (next) => {
        setIds(next)
        setLoading(false)
      },
      () => setLoading(false)
    )
    return unsubscribe
  }, [uid])

  return { ids, idSet: new Set(ids), loading }
}
