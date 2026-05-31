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

import { Avatar } from '../../components/Avatar'
import { CollectionsSection } from '../../components/CollectionsSection'
import { FollowButton } from '../../components/FollowButton'
import { PostCard } from '../../components/PostCard'
import { useAuth } from '../../context/AuthContext'
import { invalidateUserCache, useUser } from '../../hooks/useUser'
import { MainStackParamList } from '../../navigation/MainStack'
import { getUserPosts } from '../../services/postService'
import { Post } from '../../types'
import { colors } from '../../utils/colorScheme'

type R = RouteProp<MainStackParamList, 'UserProfile'>
type Nav = NativeStackNavigationProp<MainStackParamList>

export const UserProfileScreen = (): ReactElement => {
  const route = useRoute<R>()
  const nav = useNavigation<Nav>()
  const { user: currentUser } = useAuth()
  const targetUid = route.params.userId
  const isSelf = currentUser?.uid === targetUid

  const { user: profile, loading: profileLoading } = useUser(targetUid)

  const [posts, setPosts] = useState<Post[]>([])
  const [postsLoading, setPostsLoading] = useState(true)
  const [optimisticFollowerDelta, setOptimisticFollowerDelta] = useState(0)

  const reload = useCallback(async () => {
    invalidateUserCache(targetUid)
    setPostsLoading(true)
    try {
      const result = await getUserPosts(targetUid)
      setPosts(result.filter((p) => p.isPublished))
    } finally {
      setPostsLoading(false)
    }
  }, [targetUid])

  useFocusEffect(
    useCallback(() => {
      void reload()
    }, [reload])
  )

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

  const followersDisplay = (profile?.followersCount ?? 0) + optimisticFollowerDelta

  const header = (
    <View style={styles.headerCard}>
      <View style={styles.headerRow}>
        <Avatar
          name={profile?.displayName ?? '?'}
          avatarIndex={profile?.avatarIndex ?? 0}
          size={72}
        />
        <View style={styles.statsRow}>
          <Stat label="Poems" value={posts.length} />
          <Stat label="Followers" value={followersDisplay} />
          <Stat label="Following" value={profile?.followingCount ?? 0} />
        </View>
      </View>

      <Text style={styles.displayName}>{profile?.displayName ?? ''}</Text>
      <Text style={styles.username}>@{profile?.username ?? ''}</Text>
      {profile?.bio ? <Text style={styles.bio}>{profile.bio}</Text> : null}

      <View style={styles.actionsRow}>
        {isSelf ? (
          <Pressable
            onPress={() => nav.navigate('EditProfile')}
            style={({ pressed }) => [styles.editBtn, pressed && { opacity: 0.7 }]}
          >
            <Text style={styles.editBtnText}>Edit profile</Text>
          </Pressable>
        ) : (
          <FollowButton
            targetUid={targetUid}
            onChange={(nowFollowing) => setOptimisticFollowerDelta(nowFollowing ? 1 : -1)}
          />
        )}
      </View>

      <CollectionsSection ownerUid={targetUid} viewerUid={currentUser?.uid} />

      <Text style={styles.sectionLabel}>Poems</Text>
    </View>
  )

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.topBar}>
        <Pressable onPress={() => nav.goBack()} hitSlop={10}>
          <Text style={styles.back}>← Back</Text>
        </Pressable>
      </View>

      {profileLoading && !profile ? (
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
            postsLoading ? (
              <ActivityIndicator color={colors.textSecondary} style={{ marginTop: 24 }} />
            ) : (
              <Text style={styles.empty}>No poems yet.</Text>
            )
          }
        />
      )}
    </SafeAreaView>
  )
}

const Stat = ({ label, value }: { label: string; value: number }) => (
  <View style={styles.stat}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
)

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  topBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border
  },
  back: { color: colors.primary, fontSize: 16 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { padding: 16, paddingBottom: 40 },

  headerCard: { marginBottom: 12 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14
  },
  statsRow: {
    flexDirection: 'row',
    gap: 18,
    alignItems: 'center'
  },
  stat: { alignItems: 'center', minWidth: 50 },
  statValue: { color: colors.textPrimary, fontSize: 18, fontWeight: '700' },
  statLabel: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },

  displayName: { color: colors.textPrimary, fontSize: 22, fontWeight: '700' },
  username: { color: colors.textSecondary, fontSize: 14, marginTop: 2 },
  bio: { color: colors.textPrimary, fontSize: 14, lineHeight: 20, marginTop: 10 },

  actionsRow: { flexDirection: 'row', gap: 10, marginTop: 16, marginBottom: 20 },
  editBtn: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 44,
    justifyContent: 'center'
  },
  editBtnText: { color: colors.textPrimary, fontSize: 14, fontWeight: '600' },

  sectionLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8
  },
  empty: { color: colors.textSecondary, textAlign: 'center', marginTop: 40 }
})
