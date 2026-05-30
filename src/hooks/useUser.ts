import { useEffect, useState } from 'react'

import { getUser } from '../services/userService'

import { UserProfile } from '../types'

const cache = new Map<string, UserProfile>()

export const useUser = (uid: string | null | undefined) => {
  const [user, setUser] = useState<UserProfile | null>(uid ? (cache.get(uid) ?? null) : null)
  const [loading, setLoading] = useState(!!uid && !cache.has(uid))

  useEffect(() => {
    if (!uid) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUser(null)
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    getUser(uid)
      .then((result) => {
        if (cancelled) return
        if (result) cache.set(uid, result)
        setUser(result)
      })
      .finally(() => !cancelled && setLoading(false))

    return () => {
      cancelled = true
    }
  }, [uid])

  return { user, loading }
}

export const invalidateUserCache = (uid: string) => cache.delete(uid)
