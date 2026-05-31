import { collection, onSnapshot } from 'firebase/firestore'
import { useEffect, useState } from 'react'

import { db } from '../config/firebase'
import { useAuth } from '../context/AuthContext'

/**
 * Real-time list of the current user's followed uids.
 * Powers the personalized home feed and "exclude already-following" logic
 * in the suggested-users section.
 */
export const useFollowingUids = () => {
  const { user } = useAuth()
  const uid = user?.uid
  const [uids, setUids] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!uid) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUids([])
      setLoading(false)
      return
    }

    setLoading(true)
    const unsubscribe = onSnapshot(
      collection(db, 'users', uid, 'following'),
      (snap) => {
        setUids(snap.docs.map((d) => d.id))
        setLoading(false)
      },
      () => setLoading(false)
    )

    return unsubscribe
  }, [uid])

  return { uids, loading }
}
