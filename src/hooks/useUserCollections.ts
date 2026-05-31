import { useEffect, useState } from 'react'

import { subscribeUserCollections } from '../services/collectionService'

import { Collection } from '../types'

/**
 * Real-time list of a user's collections.
 *
 * `visibleToViewer` filters to public collections when the viewer isn't
 * the owner. The rules engine already blocks private docs for non-owners,
 * but filtering client-side avoids transient flashes during a permission
 * check race.
 */
export const useUserCollections = (
  ownerUid: string | null | undefined,
  viewerUid: string | null | undefined
) => {
  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!ownerUid) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCollections([])
      setLoading(false)
      return
    }
    setLoading(true)
    const unsubscribe = subscribeUserCollections(
      ownerUid,
      (next) => {
        setCollections(next)
        setLoading(false)
      },
      () => setLoading(false)
    )
    return unsubscribe
  }, [ownerUid])

  const isSelf = !!viewerUid && viewerUid === ownerUid
  const visible = isSelf ? collections : collections.filter((c) => c.isPublic)

  return { collections: visible, loading, isSelf }
}
