import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import React, { ReactElement, useCallback, useEffect, useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  ListRenderItem,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { PostCard } from '../../components/PostCard'
import { PostCardSkeleton } from '../../components/PostCardSkeleton'
import { useFeed } from '../../hooks/useFeed'
import { useFollowingUids } from '../../hooks/useFollowingUids'
import { useNotifications } from '../../hooks/useNotifications'
import { useThreads } from '../../hooks/useThreads'
import { MainStackParamList } from '../../navigation/MainStack'
import { getFeedPage } from '../../services/postService'
import { Post } from '../../types'
import { colors } from '../../utils/colorScheme'
import { useContentStyle } from '../../utils/responsive'

type Nav = NativeStackNavigationProp<MainStackParamList>

export const HomeScreen = (): ReactElement => {
  const nav = useNavigation<Nav>()

  // Personalize the feed: when the user follows people we show posts from
  // those accounts. With zero follows we fall back to the global latest
  // feed so the home tab isn't empty for new users.
  const { uids: followedUids, loading: followsLoading } = useFollowingUids()
  const personalized = followedUids.length > 0
  const { unreadCount } = useNotifications()
  const { totalUnread: unreadThreads } = useThreads()
  const contentStyle = useContentStyle()

  const { posts, loading, refreshing, hasMore, error, refresh, loadMore, replacePost } = useFeed(
    personalized ? 'following' : 'latest',
    personalized ? followedUids : []
  )

  // When the personalised feed is empty we load a handful of trending posts
  // as a one-shot fallback so the home tab still has something to read.
  const [suggested, setSuggested] = useState<Post[]>([])
  const showEmptyState = personalized && !loading && posts.length === 0
  useEffect(() => {
    if (!showEmptyState) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSuggested([])
      return
    }
    let cancelled = false
    getFeedPage(null, 'trending')
      .then((page) => {
        if (!cancelled) setSuggested(page.posts)
      })
      .catch(() => {
        /* best-effort */
      })
    return () => {
      cancelled = true
    }
  }, [showEmptyState])

  const renderItem: ListRenderItem<Post> = useCallback(
    ({ item }) => (
      <PostCard
        post={item}
        onPress={() => nav.navigate('PostDetail', { postId: item.postId })}
        onAuthorPress={(userId) => nav.navigate('UserProfile', { userId })}
        onLikeToggled={replacePost}
      />
    ),
    [nav, replacePost]
  )

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={[styles.header, contentStyle]}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.heading}>Line</Text>
            <Text style={styles.subhead}>
              {personalized ? 'From poets you follow' : 'Latest poems'}
            </Text>
          </View>
          <Pressable
            onPress={() => nav.navigate('Notifications')}
            hitSlop={10}
            style={({ pressed }) => [styles.bellBtn, pressed && { opacity: 0.6 }]}
          >
            <Ionicons
              name={unreadCount > 0 ? 'notifications' : 'notifications-outline'}
              size={24}
              color={unreadCount > 0 ? colors.primary : colors.textPrimary}
            />
            {unreadCount > 0 ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
              </View>
            ) : null}
          </Pressable>
          <Pressable
            onPress={() => nav.navigate('Threads')}
            hitSlop={10}
            style={({ pressed }) => [styles.bellBtn, pressed && { opacity: 0.6 }]}
          >
            <Ionicons
              name={unreadThreads > 0 ? 'chatbubble' : 'chatbubble-outline'}
              size={22}
              color={unreadThreads > 0 ? colors.primary : colors.textPrimary}
            />
            {unreadThreads > 0 ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadThreads > 9 ? '9+' : unreadThreads}</Text>
              </View>
            ) : null}
          </Pressable>
        </View>
      </View>

      {(loading || followsLoading) && posts.length === 0 ? (
        <View style={[styles.list, contentStyle]}>
          <PostCardSkeleton />
          <PostCardSkeleton />
          <PostCardSkeleton />
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.postId}
          renderItem={renderItem}
          contentContainerStyle={[styles.list, contentStyle]}
          onEndReached={loadMore}
          onEndReachedThreshold={0.4}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          ListEmptyComponent={
            <View>
              <View style={styles.empty}>
                <Text style={styles.emptyTitle}>
                  {personalized ? 'Quiet here for now' : 'No poems yet'}
                </Text>
                <Text style={styles.emptySub}>
                  {error ??
                    (personalized
                      ? 'Nobody you follow has posted yet. Try Explore to find more poets.'
                      : 'Tap the + tab to share the first verse.')}
                </Text>
              </View>
              {personalized && suggested.length > 0 ? (
                <View style={styles.suggestedSection}>
                  <Text style={styles.suggestedLabel}>Suggested poems</Text>
                  {suggested.map((p) => (
                    <PostCard
                      key={p.postId}
                      post={p}
                      onPress={() => nav.navigate('PostDetail', { postId: p.postId })}
                      onAuthorPress={(userId) => nav.navigate('UserProfile', { userId })}
                      onLikeToggled={replacePost}
                    />
                  ))}
                </View>
              ) : null}
            </View>
          }
          ListFooterComponent={
            hasMore && posts.length > 0 ? (
              <View style={styles.footer}>
                <ActivityIndicator color={colors.textSecondary} />
              </View>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border
  },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  heading: { color: colors.textPrimary, fontSize: 26, fontWeight: '700' },
  subhead: { color: colors.textSecondary, fontSize: 13, marginTop: 2 },
  bellBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative'
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4
  },
  badgeText: { color: colors.textPrimary, fontSize: 10, fontWeight: '700' },
  list: { padding: 16, paddingBottom: 32 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32
  },
  emptyTitle: { color: colors.textPrimary, fontSize: 18, fontWeight: '600', marginBottom: 6 },
  emptySub: { color: colors.textSecondary, fontSize: 14, textAlign: 'center' },
  suggestedSection: { paddingTop: 12 },
  suggestedLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
    paddingHorizontal: 4
  },
  footer: { paddingVertical: 16 }
})
