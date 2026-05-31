import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import React, { ReactElement, useCallback, useEffect, useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  ListRenderItem,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { Avatar } from '../../components/Avatar'
import { FollowButton } from '../../components/FollowButton'
import { PostCard } from '../../components/PostCard'
import { useAuth } from '../../context/AuthContext'
import { useFeed } from '../../hooks/useFeed'
import { useFollowingUids } from '../../hooks/useFollowingUids'
import { MainStackParamList } from '../../navigation/MainStack'
import { searchPosts } from '../../services/postService'
import { getSuggestedUsers, searchUsers } from '../../services/userService'
import { Post, UserProfile } from '../../types'
import { colors } from '../../utils/colorScheme'
import { useContentStyle } from '../../utils/responsive'

type Nav = NativeStackNavigationProp<MainStackParamList>

const SEARCH_DEBOUNCE_MS = 300

export const ExploreScreen = (): ReactElement => {
  const nav = useNavigation<Nav>()
  const { posts, loading, refreshing, hasMore, error, refresh, loadMore, replacePost } =
    useFeed('trending')

  const { user: currentUser } = useAuth()
  const { uids: followedUids } = useFollowingUids()

  const [searchQuery, setSearchQuery] = useState('')
  const [searchUsersResult, setSearchUsersResult] = useState<UserProfile[]>([])
  const [searchPostsResult, setSearchPostsResult] = useState<Post[]>([])
  const [searching, setSearching] = useState(false)

  const [suggested, setSuggested] = useState<UserProfile[]>([])
  const [suggestedLoading, setSuggestedLoading] = useState(false)

  const contentStyle = useContentStyle()

  const trimmed = searchQuery.trim()
  const searchActive = trimmed.length > 0

  // Refresh the suggested-users list whenever the current user or their
  // follows change. Excludes self + already-followed.
  const currentUid = currentUser?.uid
  const followingKey = followedUids.slice().sort().join(',')
  useEffect(() => {
    if (!currentUid) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSuggested([])
      return
    }
    let cancelled = false
    setSuggestedLoading(true)
    getSuggestedUsers(currentUid, followingKey ? followingKey.split(',') : [], 5)
      .then((result) => {
        if (!cancelled) setSuggested(result)
      })
      .finally(() => {
        if (!cancelled) setSuggestedLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [currentUid, followingKey])

  // Debounced search
  useEffect(() => {
    if (!searchActive) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSearchUsersResult([])
      setSearchPostsResult([])
      setSearching(false)
      return
    }

    let cancelled = false
    const timer = setTimeout(async () => {
      setSearching(true)
      try {
        const [u, p] = await Promise.all([searchUsers(trimmed, 8), searchPosts(trimmed, 10)])
        if (cancelled) return
        setSearchUsersResult(u)
        setSearchPostsResult(p)
      } finally {
        if (!cancelled) setSearching(false)
      }
    }, SEARCH_DEBOUNCE_MS)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [trimmed, searchActive])

  const renderTrending: ListRenderItem<Post> = useCallback(
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

  const noResults =
    searchActive && !searching && searchUsersResult.length === 0 && searchPostsResult.length === 0

  // The header (with the TextInput) lives at a STABLE position in the tree so
  // typing doesn't remount it — otherwise the keyboard dismisses on every
  // keystroke.
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={[styles.header, contentStyle]}>
        <Text style={styles.heading}>Explore</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search users or poems..."
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
        />
        {!searchActive ? <Text style={styles.subhead}>Trending poems</Text> : null}
      </View>

      {searchActive ? (
        <ScrollView
          contentContainerStyle={[styles.searchScroll, contentStyle]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          {searching && searchUsersResult.length === 0 && searchPostsResult.length === 0 ? (
            <ActivityIndicator color={colors.primary} style={{ marginTop: 24 }} />
          ) : null}

          {searchUsersResult.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Users</Text>
              {searchUsersResult.map((u) => (
                <Pressable
                  key={u.uid}
                  onPress={() => nav.navigate('UserProfile', { userId: u.uid })}
                  style={({ pressed }) => [styles.userRow, pressed && { opacity: 0.7 }]}
                >
                  <Avatar name={u.displayName} avatarIndex={u.avatarIndex} size={40} />
                  <View style={styles.userText}>
                    <Text style={styles.userName} numberOfLines={1}>
                      {u.displayName}
                    </Text>
                    <Text style={styles.userHandle} numberOfLines={1}>
                      @{u.username}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>
          ) : null}

          {searchPostsResult.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Poems</Text>
              {searchPostsResult.map((p) => (
                <PostCard
                  key={p.postId}
                  post={p}
                  onPress={() => nav.navigate('PostDetail', { postId: p.postId })}
                  onAuthorPress={(userId) => nav.navigate('UserProfile', { userId })}
                />
              ))}
            </View>
          ) : null}

          {noResults ? (
            <Text style={styles.empty}>
              No matches for &quot;{trimmed}&quot;. Search is prefix-only and only finds docs
              created or edited after the lowercase fields were added.
            </Text>
          ) : null}
        </ScrollView>
      ) : loading && posts.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.postId}
          renderItem={renderTrending}
          contentContainerStyle={[styles.list, contentStyle]}
          onEndReached={loadMore}
          onEndReachedThreshold={0.4}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          ListHeaderComponent={
            suggested.length > 0 || suggestedLoading ? (
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Suggested for you</Text>
                {suggestedLoading && suggested.length === 0 ? (
                  <ActivityIndicator color={colors.textSecondary} style={{ marginTop: 12 }} />
                ) : (
                  suggested.map((u) => (
                    <View key={u.uid} style={styles.userRow}>
                      <Pressable
                        onPress={() => nav.navigate('UserProfile', { userId: u.uid })}
                        style={({ pressed }) => [styles.userTapTarget, pressed && { opacity: 0.7 }]}
                      >
                        <Avatar name={u.displayName} avatarIndex={u.avatarIndex} size={40} />
                        <View style={styles.userText}>
                          <Text style={styles.userName} numberOfLines={1}>
                            {u.displayName}
                          </Text>
                          <Text style={styles.userHandle} numberOfLines={1}>
                            @{u.username}
                          </Text>
                        </View>
                      </Pressable>
                      <FollowButton targetUid={u.uid} />
                    </View>
                  ))
                )}
                <Text style={styles.sectionLabel}>Trending</Text>
              </View>
            ) : null
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.empty2}>
              <Text style={styles.emptyTitle}>Nothing trending yet</Text>
              <Text style={styles.emptySub}>
                {error ?? 'Be the first to share a poem worth reading.'}
              </Text>
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
  heading: { color: colors.textPrimary, fontSize: 26, fontWeight: '700', marginBottom: 12 },
  subhead: { color: colors.textSecondary, fontSize: 13, marginTop: 8 },
  searchInput: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: colors.textPrimary,
    fontSize: 15,
    borderWidth: 1,
    borderColor: colors.border
  },
  list: { padding: 16, paddingBottom: 32 },
  searchScroll: { padding: 16, paddingBottom: 32 },
  section: { marginBottom: 24 },
  sectionLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 12
  },
  userTapTarget: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1
  },
  userText: { flex: 1 },
  userName: { color: colors.textPrimary, fontSize: 15, fontWeight: '600' },
  userHandle: { color: colors.textSecondary, fontSize: 13, marginTop: 2 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 32,
    paddingHorizontal: 24
  },
  empty2: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32
  },
  emptyTitle: { color: colors.textPrimary, fontSize: 18, fontWeight: '600', marginBottom: 6 },
  emptySub: { color: colors.textSecondary, fontSize: 14, textAlign: 'center' },
  footer: { paddingVertical: 16 }
})
