import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import React, { ReactElement, useEffect, useState } from 'react'
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { Avatar } from '../../components/Avatar'
import { FollowButton } from '../../components/FollowButton'
import { useAuth } from '../../context/AuthContext'
import { useFollowingUids } from '../../hooks/useFollowingUids'
import { MainStackParamList } from '../../navigation/MainStack'
import { getSuggestedUsers } from '../../services/userService'
import { UserProfile } from '../../types'
import { colors } from '../../utils/colorScheme'
import { useContentStyle } from '../../utils/responsive'

type Nav = NativeStackNavigationProp<MainStackParamList>

const MAX_SUGGESTED = 10

export const SuggestedUsersScreen = (): ReactElement => {
  const nav = useNavigation<Nav>()
  const { user } = useAuth()
  const { uids: followedUids } = useFollowingUids()
  const contentStyle = useContentStyle()

  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)

  const currentUid = user?.uid
  const followingKey = followedUids.slice().sort().join(',')
  useEffect(() => {
    if (!currentUid) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUsers([])
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    getSuggestedUsers(currentUid, followingKey ? followingKey.split(',') : [], MAX_SUGGESTED)
      .then((result) => {
        if (!cancelled) setUsers(result)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [currentUid, followingKey])

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={[styles.header, contentStyle]}>
        <Pressable onPress={() => nav.goBack()} hitSlop={10} style={styles.iconBtn}>
          <Ionicons name="chevron-back" size={26} color={colors.primary} />
        </Pressable>
        <Text style={styles.title}>Suggested for you</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.body, contentStyle]}>
        {loading && users.length === 0 ? (
          <ActivityIndicator color={colors.textSecondary} style={{ marginTop: 32 }} />
        ) : users.length === 0 ? (
          <Text style={styles.empty}>
            No suggestions right now — try searching for a poet by name.
          </Text>
        ) : (
          users.map((u) => (
            <View key={u.uid} style={styles.userRow}>
              <Pressable
                onPress={() => nav.navigate('UserProfile', { userId: u.uid })}
                style={({ pressed }) => [styles.userTapTarget, pressed && { opacity: 0.7 }]}
              >
                <Avatar uid={u.uid} name={u.displayName} avatarIndex={u.avatarIndex} size={44} />
                <View style={styles.userText}>
                  <Text style={styles.userName} numberOfLines={1}>
                    {u.displayName}
                  </Text>
                  <Text style={styles.userHandle} numberOfLines={1}>
                    @{u.username}
                  </Text>
                  {u.bio ? (
                    <Text style={styles.userBio} numberOfLines={2}>
                      {u.bio}
                    </Text>
                  ) : null}
                </View>
              </Pressable>
              <FollowButton targetUid={u.uid} />
            </View>
          ))
        )}
      </ScrollView>
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
  iconBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  title: { color: colors.textPrimary, fontSize: 17, fontWeight: '600' },
  body: { padding: 16, paddingBottom: 40 },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
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
  userBio: { color: colors.textSecondary, fontSize: 13, marginTop: 4, lineHeight: 18 },
  empty: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 40,
    paddingHorizontal: 24
  }
})
