import { QueryDocumentSnapshot } from 'firebase/firestore'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { FeedMode, getFeedPage, PAGE_SIZE, subscribeFeedFirstPage } from '../services/postService'

import { Post } from '../types'

/**
 * Real-time feed hook.
 *
 * First page is driven by an `onSnapshot` listener so new posts, likes, and
 * comment counts surface live. Pagination (page 2+) stays one-shot via
 * `getFeedPage` to keep listener costs bounded — the listener only watches
 * the top `PAGE_SIZE` documents.
 *
 * `posts` merges the live first page with any paginated extras, deduped by
 * postId so a post that climbs back into the first page doesn't double-render.
 */
export const useFeed = (mode: FeedMode = 'latest', followedUids: string[] = []) => {
  const [firstPage, setFirstPage] = useState<Post[]>([])
  const [firstPageLastDoc, setFirstPageLastDoc] = useState<QueryDocumentSnapshot | null>(null)
  const [extras, setExtras] = useState<Post[]>([])
  const [extrasCursor, setExtrasCursor] = useState<QueryDocumentSnapshot | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Stable string key for the followed uids set so the subscription only
  // re-runs when the set actually changes, not on every render's new array ref.
  const uidsKey = useMemo(() => followedUids.slice().sort().join(','), [followedUids])

  // Real-time subscription to the first page
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true)
    setError(null)
    setExtras([])
    setExtrasCursor(null)
    setHasMore(true)

    const subscriptionUids = uidsKey ? uidsKey.split(',') : []

    const unsubscribe = subscribeFeedFirstPage(
      mode,
      (posts, lastDoc) => {
        setFirstPage(posts)
        setFirstPageLastDoc(lastDoc)
        // If the first page came back smaller than PAGE_SIZE, there are no
        // more pages to load — otherwise the footer spinner would run forever
        // for feeds with fewer than PAGE_SIZE posts.
        setHasMore(posts.length === PAGE_SIZE)
        setLoading(false)
      },
      (err) => {
        setError(err.message)
        setLoading(false)
      },
      subscriptionUids
    )

    return unsubscribe
  }, [mode, uidsKey])

  const posts = useMemo<Post[]>(() => {
    const seen = new Set<string>()
    const merged: Post[] = []
    for (const p of [...firstPage, ...extras]) {
      if (!seen.has(p.postId)) {
        seen.add(p.postId)
        merged.push(p)
      }
    }
    return merged
  }, [firstPage, extras])

  // The listener already keeps the first page fresh; "refresh" just resets the
  // paginated extras so the user lands back at the top of the live window.
  //
  // hasMore is recomputed from firstPage.length — the listener already set it
  // when it last fired, but if a previous loadMore had bumped it back to true
  // we need to undo that. Re-setting to `true` unconditionally is wrong:
  // the listener won't refire (data is current) so the footer spinner would
  // stay on forever.
  const refresh = useCallback(() => {
    setRefreshing(true)
    setExtras([])
    setExtrasCursor(null)
    setHasMore(firstPage.length === PAGE_SIZE)
    // Brief visual feedback for the pull gesture
    setTimeout(() => setRefreshing(false), 250)
  }, [firstPage.length])

  const loadMore = useCallback(async () => {
    if (!hasMore || loading || refreshing) return
    const cursor = extrasCursor ?? firstPageLastDoc
    if (!cursor) return

    try {
      const pageUids = uidsKey ? uidsKey.split(',') : []
      const page = await getFeedPage(cursor, mode, pageUids)
      setExtras((prev) => [...prev, ...page.posts])
      setExtrasCursor(page.cursor)
      setHasMore(page.hasMore)
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load more')
    }
  }, [extrasCursor, firstPageLastDoc, hasMore, loading, refreshing, mode, uidsKey])

  // Optimistic replacement — patches both layers so the change is instant.
  // The first-page listener will overwrite firstPage shortly after with the
  // canonical value from Firestore (typically a no-op if the optimistic
  // patch matches the server state).
  const replacePost = useCallback((updated: Post) => {
    setFirstPage((prev) => prev.map((p) => (p.postId === updated.postId ? updated : p)))
    setExtras((prev) => prev.map((p) => (p.postId === updated.postId ? updated : p)))
  }, [])

  return {
    posts,
    loading,
    refreshing,
    hasMore,
    error,
    refresh,
    loadMore,
    replacePost
  }
}
