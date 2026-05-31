import React, { ReactElement, useEffect, useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  ListRenderItem,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View
} from 'react-native'

import { useAuth } from '../context/AuthContext'
import { useUserCollections } from '../hooks/useUserCollections'
import {
  addPostToCollection,
  getCollectionPostIds,
  removePostFromCollection
} from '../services/collectionService'
import { colors } from '../utils/colorScheme'
import { pluralize } from '../utils/formatters'

import { Collection } from '../types'

type Props = {
  visible: boolean
  postId: string
  onClose: () => void
  onCreateNew: () => void
}

/**
 * Bottom-sheet picker letting the user toggle a post in/out of any of
 * their collections. Loads which collections currently contain the post
 * by querying each of them once on open (small N, batched).
 */
export const AddToCollectionSheet = ({
  visible,
  postId,
  onClose,
  onCreateNew
}: Props): ReactElement => {
  const { user } = useAuth()
  const { collections, loading } = useUserCollections(user?.uid, user?.uid)
  const [containingIds, setContainingIds] = useState<Set<string>>(new Set())
  const [busyId, setBusyId] = useState<string | null>(null)
  const [containmentLoading, setContainmentLoading] = useState(false)

  // Determine which collections already contain this post.
  // For each collection, check the doc at /collections/{id}/posts/{postId}.
  useEffect(() => {
    if (!visible || !user || collections.length === 0) return
    let cancelled = false
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setContainmentLoading(true)

    const computeMembership = async () => {
      // Fetch postIds for each collection in parallel. Acceptable for N small
      // (typical user has <20 collections); upgrade to a per-post reverse-index
      // if collections grow beyond that.
      const results = await Promise.all(
        collections.map(async (c) => {
          try {
            const ids = await getCollectionPostIds(c.collectionId)
            return ids.includes(postId) ? c.collectionId : null
          } catch {
            return null
          }
        })
      )
      if (!cancelled) {
        setContainingIds(new Set(results.filter((id): id is string => !!id)))
        setContainmentLoading(false)
      }
    }

    void computeMembership()
    return () => {
      cancelled = true
    }
  }, [visible, user, collections, postId])

  const handleToggle = async (collectionId: string) => {
    if (busyId) return
    const isIn = containingIds.has(collectionId)
    setBusyId(collectionId)

    // Optimistic update
    setContainingIds((prev) => {
      const next = new Set(prev)
      if (isIn) next.delete(collectionId)
      else next.add(collectionId)
      return next
    })

    try {
      if (isIn) await removePostFromCollection(collectionId, postId)
      else await addPostToCollection(collectionId, postId)
    } catch {
      // Revert
      setContainingIds((prev) => {
        const next = new Set(prev)
        if (isIn) next.add(collectionId)
        else next.delete(collectionId)
        return next
      })
    } finally {
      setBusyId(null)
    }
  }

  const renderItem: ListRenderItem<Collection> = ({ item }) => {
    const isIn = containingIds.has(item.collectionId)
    const isBusy = busyId === item.collectionId
    return (
      <Pressable
        onPress={() => handleToggle(item.collectionId)}
        disabled={isBusy}
        style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}
      >
        <View style={styles.rowText}>
          <Text style={styles.rowTitle} numberOfLines={1}>
            {item.title || 'Untitled collection'}
          </Text>
          <Text style={styles.rowMeta}>
            {pluralize(item.postCount, 'poem')} · {item.isPublic ? 'Public' : 'Private'}
          </Text>
        </View>
        {isBusy ? (
          <ActivityIndicator color={colors.primary} size="small" />
        ) : (
          <View style={[styles.check, isIn && styles.checkActive]}>
            {isIn ? <Text style={styles.checkMark}>✓</Text> : null}
          </View>
        )}
      </Pressable>
    )
  }

  const showLoading = loading && collections.length === 0

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <Text style={styles.title}>Add to collection</Text>
            <Pressable onPress={onClose} hitSlop={10}>
              <Text style={styles.done}>Done</Text>
            </Pressable>
          </View>

          <Pressable
            onPress={onCreateNew}
            style={({ pressed }) => [styles.createNew, pressed && { opacity: 0.7 }]}
          >
            <Text style={styles.createNewText}>+ Create new collection</Text>
          </Pressable>

          {showLoading || containmentLoading ? (
            <ActivityIndicator color={colors.primary} style={{ marginTop: 24 }} />
          ) : collections.length === 0 ? (
            <Text style={styles.empty}>
              No collections yet. Tap &ldquo;Create new&rdquo; above to start one.
            </Text>
          ) : (
            <FlatList
              data={collections}
              keyExtractor={(c) => c.collectionId}
              renderItem={renderItem}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              contentContainerStyle={styles.list}
            />
          )}
        </Pressable>
      </Pressable>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end'
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 8,
    paddingBottom: 24,
    maxHeight: '75%'
  },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginBottom: 8
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border
  },
  title: { color: colors.textPrimary, fontSize: 17, fontWeight: '700' },
  done: { color: colors.primary, fontSize: 16, fontWeight: '600' },
  createNew: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border
  },
  createNewText: { color: colors.primary, fontSize: 15, fontWeight: '600' },
  list: { paddingHorizontal: 20, paddingVertical: 8 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12
  },
  rowText: { flex: 1 },
  rowTitle: { color: colors.textPrimary, fontSize: 15, fontWeight: '600' },
  rowMeta: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },
  check: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center'
  },
  checkActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  checkMark: { color: colors.background, fontSize: 14, fontWeight: '900' },
  separator: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border },
  empty: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 32,
    paddingHorizontal: 40
  }
})
