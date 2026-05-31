import { useEffect, useState } from 'react'

import { subscribeMessages } from '../services/messageService'

import { Message } from '../types'

/**
 * Real-time list of messages in a thread, oldest first.
 * Caller can reverse for an inverted FlatList chat view.
 */
export const useMessages = (threadId: string | null | undefined) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!threadId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMessages([])
      setLoading(false)
      return
    }
    setLoading(true)
    const unsubscribe = subscribeMessages(
      threadId,
      (next) => {
        setMessages(next)
        setLoading(false)
      },
      () => setLoading(false)
    )
    return unsubscribe
  }, [threadId])

  return { messages, loading }
}
