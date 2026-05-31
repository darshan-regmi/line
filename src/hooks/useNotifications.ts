import { useEffect, useState } from 'react'

import { useAuth } from '../context/AuthContext'
import { subscribeNotifications } from '../services/notificationService'

import { Notification } from '../types'

/**
 * Real-time inbox for the current user.
 * Subscribes to /users/{uid}/notifications on the client and keeps a
 * sorted list. Returns the count of unread notifications too so callers
 * can render a badge without an extra query.
 */
export const useNotifications = () => {
  const { user } = useAuth()
  const uid = user?.uid
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!uid) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setNotifications([])
      setLoading(false)
      return
    }

    setLoading(true)
    const unsubscribe = subscribeNotifications(
      uid,
      (next) => {
        setNotifications(next)
        setLoading(false)
      },
      () => setLoading(false)
    )

    return unsubscribe
  }, [uid])

  const unreadCount = notifications.filter((n) => !n.read).length

  return { notifications, unreadCount, loading }
}
