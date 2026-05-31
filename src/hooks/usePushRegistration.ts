import * as Notifications from 'expo-notifications'
import { useEffect } from 'react'

import { useAuth } from '../context/AuthContext'
import { registerForPushAsync, savePushToken } from '../services/pushService'

/**
 * Registers the current device's Expo push token to the signed-in user's
 * doc on every sign-in. Idempotent — arrayUnion handles duplicates.
 *
 * Wire this once near the root (App.tsx). It also receives notification
 * tap responses so the app can navigate to the right screen. The navigation
 * itself is handled by a deep-link callback passed in by the caller.
 */
type NavigateFn = (target: NavigateTarget) => void

export type NavigateTarget =
  | { screen: 'PostDetail'; postId: string }
  | { screen: 'UserProfile'; userId: string }
  | { screen: 'ThreadDetail'; otherUid: string }

export const usePushRegistration = (navigate: NavigateFn): void => {
  const { user } = useAuth()
  const uid = user?.uid

  // Register the token once per sign-in
  useEffect(() => {
    if (!uid) return
    let cancelled = false
    void (async () => {
      const token = await registerForPushAsync()
      if (cancelled || !token) return
      await savePushToken(uid, token)
    })()
    return () => {
      cancelled = true
    }
  }, [uid])

  // Handle taps on push notifications
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as
        | {
            type?: 'like' | 'comment' | 'follow' | 'dm'
            postId?: string
            actorUid?: string
            threadOtherUid?: string
          }
        | undefined
      if (!data?.type) return

      switch (data.type) {
        case 'like':
        case 'comment':
          if (data.postId) navigate({ screen: 'PostDetail', postId: data.postId })
          break
        case 'follow':
          if (data.actorUid) navigate({ screen: 'UserProfile', userId: data.actorUid })
          break
        case 'dm':
          if (data.threadOtherUid)
            navigate({ screen: 'ThreadDetail', otherUid: data.threadOtherUid })
          break
      }
    })
    return () => sub.remove()
  }, [navigate])
}
