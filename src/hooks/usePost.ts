import { useEffect, useState } from 'react'

import { getPost } from '../services/postService'

import { Post } from '../types'

export const usePost = (postId: string | null | undefined) => {
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(!!postId)

  useEffect(() => {
    if (!postId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPost(null)
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    getPost(postId)
      .then((result) => {
        if (cancelled) return
        setPost(result)
      })
      .finally(() => !cancelled && setLoading(false))

    return () => {
      cancelled = true
    }
  }, [postId])

  return { post, setPost, loading }
}
