import { useCallback, useEffect, useState } from 'react'

import { useAuth } from '../context/AuthContext'
import { followUser, isFollowing, unfollowUser } from '../services/userService'

import { invalidateUserCache } from './useUser'

export const useFollow = (targetUid: string | null | undefined) => {
  const { user } = useAuth()
  const currentUid = user?.uid ?? null

  const isSelf = !!currentUid && !!targetUid && currentUid === targetUid

  const [following, setFollowing] = useState(false)
  const [loading, setLoading] = useState(!!targetUid && !isSelf)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!targetUid || !currentUid || isSelf) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFollowing(false)
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    isFollowing(currentUid, targetUid)
      .then((result) => {
        if (!cancelled) setFollowing(result)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [currentUid, targetUid, isSelf])

  const toggle = useCallback(async () => {
    if (!currentUid || !targetUid || isSelf || busy) return
    const wasFollowing = following
    setFollowing(!wasFollowing)
    setBusy(true)
    try {
      if (wasFollowing) {
        await unfollowUser(currentUid, targetUid)
      } else {
        await followUser(currentUid, targetUid)
      }
      // The target user's followersCount changed; the current user's followingCount too
      invalidateUserCache(targetUid)
      invalidateUserCache(currentUid)
    } catch {
      setFollowing(wasFollowing)
    } finally {
      setBusy(false)
    }
  }, [busy, currentUid, following, isSelf, targetUid])

  return { following, loading, busy, isSelf, toggle }
}
