import { RouteProp, useFocusEffect, useNavigation, useRoute } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import React, { ReactElement, useCallback, useState } from 'react'
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
import { useAuth } from '../../context/AuthContext'
import { MainStackParamList } from '../../navigation/MainStack'
import { hydrateBookmarkedPosts } from '../../services/bookmarkService'
import { getCollection, getCollectionPostIds } from '../../services/collectionService'
import { Collection, Post } from '../../types'
import { colors } from '../../utils/colorScheme'
import { pluralize } from '../../utils/formatters'

type R = RouteProp<MainStackParamList, 'CollectionDetail'>
type Nav = NativeStackNavigationProp<MainStackParamList>

export const CollectionDetailScreen = (): ReactElement => {
  const route = useRoute<R>()
  const nav = useNavigation<Nav>()
  const { user } = useAuth()
  const collectionId = route.params.collectionId

  const [collection, setCollection] = useState<Collection | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    setLoading(true)
    try {
      const [c, ids] = await Promise.all([
        getCollection(collectionId),
        getCollectionPostIds(collectionId)
      ])
      setCollection(c)
      // hydrateBookmarkedPosts is a generic id-list-to-Post hydration; reusing it
      const hydrated = await hydrateBookmarkedPosts(ids)
      setPosts(hydrated.filter((p) => p.isPublished))
    } finally {
      setLoading(false)
    }
  }, [collectionId])

  useFocusEffect(
    useCallback(() => {
      void reload()
    }, [reload])
  )

  const isOwner = !!user && !!collection && user.uid === collection.ownerId

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

  const header = (
    <View style={styles.headerCard}>
      <Text style={styles.title}>{collection?.title ?? ''}</Text>
      {collection?.description ? (
        <Text style={styles.description}>{collection.description}</Text>
      ) : null}
      <Text style={styles.meta}>
        {pluralize(collection?.postCount ?? 0, 'poem')}
        {collection ? ` · ${collection.isPublic ? 'Public' : 'Private'}` : ''}
      </Text>
    </View>
  )

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.topBar}>
        <Pressable onPress={() => nav.goBack()} hitSlop={10}>
          <Text style={styles.back}>← Back</Text>
        </Pressable>
        {isOwner && collection ? (
          <Pressable onPress={() => nav.navigate('EditCollection', { collectionId })} hitSlop={10}>
            <Text style={styles.edit}>Edit</Text>
          </Pressable>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>

      {loading && posts.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.postId}
          renderItem={renderItem}
          ListHeaderComponent={header}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.empty}>
              {isOwner
                ? 'This collection is empty. Tap “Add to collection” on any poem to add it here.'
                : 'This collection is empty.'}
            </Text>
          }
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border
  },
  back: { color: colors.primary, fontSize: 16 },
  edit: { color: colors.primary, fontSize: 16, fontWeight: '600' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { padding: 16, paddingBottom: 40 },

  headerCard: { marginBottom: 12 },
  title: { color: colors.textPrimary, fontSize: 24, fontWeight: '700' },
  description: { color: colors.textPrimary, fontSize: 14, lineHeight: 20, marginTop: 8 },
  meta: { color: colors.textSecondary, fontSize: 12, marginTop: 10 },

  empty: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 40,
    paddingHorizontal: 24
  }
})
