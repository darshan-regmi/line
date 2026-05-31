import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import React, { ReactElement, useCallback, useState } from 'react'
import { FlatList, ListRenderItem, Pressable, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { Avatar } from '../../components/Avatar'
import { CollectionsSection } from '../../components/CollectionsSection'
import { PostCard } from '../../components/PostCard'
import { PostCardSkeleton } from '../../components/PostCardSkeleton'
import { useAuth } from '../../context/AuthContext'
import { invalidateUserCache, useUser } from '../../hooks/useUser'
import { MainStackParamList } from '../../navigation/MainStack'
import { getUserPosts } from '../../services/postService'
import { Post } from '../../types'
import { colors } from '../../utils/colorScheme'
import { useContentStyle } from '../../utils/responsive'

type Nav = NativeStackNavigationProp<MainStackParamList>

export const ProfileScreen = (): ReactElement => {
  const nav = useNavigation<Nav>()
  const { user, signOut } = useAuth()
  const { user: profile, loading: profileLoading } = useUser(user?.uid)
  const contentStyle = useContentStyle()

  const [posts, setPosts] = useState<Post[]>([])
  const [postsLoading, setPostsLoading] = useState(true)

  const reload = useCallback(async () => {
    if (!user) return
    if (user.uid) invalidateUserCache(user.uid)
    setPostsLoading(true)
    try {
      const result = await getUserPosts(user.uid)
      setPosts(result.filter((p) => p.isPublished))
    } finally {
      setPostsLoading(false)
    }
  }, [user])

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

  const header = (
    <View style={styles.headerCard}>
      <View style={styles.headerRow}>
        <Avatar
          uid={user?.uid}
          name={profile?.displayName ?? user?.displayName ?? '?'}
          avatarIndex={profile?.avatarIndex ?? 0}
          size={72}
        />
        <View style={styles.statsRow}>
          <Stat label="Poems" value={posts.length} />
          <Stat label="Followers" value={profile?.followersCount ?? 0} />
          <Stat label="Following" value={profile?.followingCount ?? 0} />
        </View>
      </View>

      <Text style={styles.displayName}>{profile?.displayName ?? user?.displayName ?? ''}</Text>
      <Text style={styles.username}>@{profile?.username ?? ''}</Text>
      {profile?.bio ? <Text style={styles.bio}>{profile.bio}</Text> : null}

      <View style={styles.actionsRow}>
        <Pressable
          onPress={() => nav.navigate('EditProfile')}
          style={({ pressed }) => [styles.editBtn, pressed && { opacity: 0.7 }]}
        >
          <Text style={styles.editBtnText}>Edit profile</Text>
        </Pressable>
        <Pressable
          onPress={() => nav.navigate('Saved')}
          style={({ pressed }) => [styles.editBtn, pressed && { opacity: 0.7 }]}
        >
          <Text style={styles.editBtnText}>Saved</Text>
        </Pressable>
        <Pressable
          onPress={() => {
            void signOut()
          }}
          style={({ pressed }) => [styles.signOutBtn, pressed && { opacity: 0.7 }]}
        >
          <Text style={styles.signOutBtnText}>Sign out</Text>
        </Pressable>
        <View style={styles.legalRow}>
          <Text style={styles.legalLink} onPress={() => nav.navigate('Privacy')}>
            Privacy
          </Text>
          <Text style={styles.legalSep}> · </Text>
          <Text style={styles.legalLink} onPress={() => nav.navigate('Terms')}>
            Terms
          </Text>
        </View>
      </View>

      {user ? <CollectionsSection ownerUid={user.uid} viewerUid={user.uid} /> : null}

      <Text style={styles.sectionLabel}>Your poems</Text>
    </View>
  )

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {profileLoading && !profile ? (
        <View style={[styles.list, contentStyle]}>
          <PostCardSkeleton />
          <PostCardSkeleton />
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.postId}
          renderItem={renderItem}
          ListHeaderComponent={header}
          contentContainerStyle={[styles.list, contentStyle]}
          ListEmptyComponent={
            postsLoading ? (
              <View>
                <PostCardSkeleton />
                <PostCardSkeleton />
              </View>
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
    minHeight: 44
  },
  editBtnText: { color: colors.textPrimary, fontSize: 14, fontWeight: '600' },
  signOutBtn: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 44
  },
  signOutBtnText: { color: colors.accent, fontSize: 14, fontWeight: '600' },
  legalRow: {
    flexBasis: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    paddingTop: 12
  },
  legalLink: { color: colors.textSecondary, fontSize: 12, fontWeight: '600' },
  legalSep: { color: colors.textSecondary, fontSize: 12 },

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
