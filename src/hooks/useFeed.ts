import { QueryDocumentSnapshot } from 'firebase/firestore'
import { useCallback, useEffect, useState } from 'react'

import { getFeedPage } from '../services/postService'

import { Post } from '../types'

export const useFeed = () => {
  const [posts, setPosts] = useState<Post[]>([])
  const [cursor, setCursor] = useState<QueryDocumentSnapshot | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadFirst = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const page = await getFeedPage(null)
      setPosts(page.posts)
      setCursor(page.cursor)
      setHasMore(page.hasMore)
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load feed')
    } finally {
      setLoading(false)
    }
  }, [])

  const refresh = useCallback(async () => {
    setRefreshing(true)
    setError(null)
    try {
      const page = await getFeedPage(null)
      setPosts(page.posts)
      setCursor(page.cursor)
      setHasMore(page.hasMore)
    } catch (e: any) {
      setError(e?.message ?? 'Failed to refresh feed')
    } finally {
      setRefreshing(false)
    }
  }, [])

  const loadMore = useCallback(async () => {
    if (!hasMore || loading || refreshing || !cursor) return
    try {
      const page = await getFeedPage(cursor)
      setPosts((prev) => [...prev, ...page.posts])
      setCursor(page.cursor)
      setHasMore(page.hasMore)
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load more')
    }
  }, [cursor, hasMore, loading, refreshing])

  const replacePost = useCallback((updated: Post) => {
    setPosts((prev) => prev.map((p) => (p.postId === updated.postId ? updated : p)))
  }, [])

  const prependPost = useCallback((newPost: Post) => {
    setPosts((prev) => [newPost, ...prev])
  }, [])

  useEffect(() => {
    // Initial load on mount; loadFirst manages its own loading flag.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadFirst()
  }, [loadFirst])

  return {
    posts,
    loading,
    refreshing,
    hasMore,
    error,
    refresh,
    loadMore,
    replacePost,
    prependPost
  }
}
