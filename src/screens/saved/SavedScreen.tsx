import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import React, { ReactElement, useCallback, useEffect, useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  ListRenderItem,
  Pressable,
  StyleSheet,
  Text,
  View
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { PostCard } from '../../components/PostCard'
import { useBookmarkIds } from '../../hooks/useBookmarkIds'
import { MainStackParamList } from '../../navigation/MainStack'
import { hydrateBookmarkedPosts } from '../../services/bookmarkService'
import { Post } from '../../types'
import { colors } from '../../utils/colorScheme'

type Nav = NativeStackNavigationProp<MainStackParamList>

export const SavedScreen = (): ReactElement => {
  const nav = useNavigation<Nav>()
  const { ids, loading: idsLoading } = useBookmarkIds()

  const [posts, setPosts] = useState<Post[]>([])
  const [hydrating, setHydrating] = useState(false)

  // Hydrate the bookmarked postIds into full Post docs. Re-runs when the
  // set of ids changes — same stable key trick as elsewhere.
  const idsKey = ids.join(',')
  useEffect(() => {
    if (ids.length === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPosts([])
      setHydrating(false)
      return
    }
    let cancelled = false
    setHydrating(true)
    hydrateBookmarkedPosts(ids)
      .then((result) => {
        if (!cancelled) setPosts(result.filter((p) => p.isPublished))
      })
      .finally(() => {
        if (!cancelled) setHydrating(false)
      })
    return () => {
      cancelled = true
    }
  }, [idsKey, ids])

  const renderItem: ListRenderItem<Post> = useCallback(
    ({ item }) => (
      <PostCard
        post={item}
        onPress={() => nav.navigate('PostDetail', { postId: item.postId })}
        onAuthorPress={(userId) => nav.navigate('UserProfile', { userId })}
      />
    ),
    [nav]
  )

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => nav.goBack()} hitSlop={10}>
          <Text style={styles.back}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>Saved</Text>
        <View style={{ width: 60 }} />
      </View>

      {(idsLoading || hydrating) && posts.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.postId}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>No saved poems yet</Text>
              <Text style={styles.emptySub}>
                Tap the ☆ on any poem to save it for later — it&apos;ll show up here.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border
  },
  back: { color: colors.primary, fontSize: 16 },
  title: { color: colors.textPrimary, fontSize: 17, fontWeight: '600' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { padding: 16, paddingBottom: 32 },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32
  },
  emptyTitle: { color: colors.textPrimary, fontSize: 18, fontWeight: '600', marginBottom: 6 },
  emptySub: { color: colors.textSecondary, fontSize: 14, textAlign: 'center' }
})
