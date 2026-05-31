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

import { getUsersByIds } from '../services/userService'
import { colors } from '../utils/colorScheme'

import { UserProfile } from '../types'
import { Avatar } from './Avatar'
import { FollowButton } from './FollowButton'

type Props = {
  visible: boolean
  userIds: string[]
  onClose: () => void
  onUserPress: (userId: string) => void
}

export const LikesModal = ({ visible, userIds, onClose, onUserPress }: Props): ReactElement => {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!visible) return
    let cancelled = false
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true)
    getUsersByIds(userIds)
      .then((result) => {
        if (!cancelled) setUsers(result)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [visible, userIds])

  const renderItem: ListRenderItem<UserProfile> = ({ item }) => (
    <Pressable
      onPress={() => onUserPress(item.uid)}
      style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}
    >
      <Avatar uid={item.uid} name={item.displayName} avatarIndex={item.avatarIndex} size={40} />
      <View style={styles.userText}>
        <Text style={styles.name} numberOfLines={1}>
          {item.displayName}
        </Text>
        <Text style={styles.username} numberOfLines={1}>
          @{item.username}
        </Text>
      </View>
      <FollowButton targetUid={item.uid} />
    </Pressable>
  )

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        {/* Inner Pressable prevents backdrop tap from closing when interacting with sheet */}
        <Pressable style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <Text style={styles.title}>Likes</Text>
            <Pressable onPress={onClose} hitSlop={10}>
              <Text style={styles.done}>Done</Text>
            </Pressable>
          </View>

          {loading ? (
            <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
          ) : users.length === 0 ? (
            <Text style={styles.empty}>No likes yet.</Text>
          ) : (
            <FlatList
              data={users}
              keyExtractor={(u) => u.uid}
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
    maxHeight: '70%'
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
  list: { paddingHorizontal: 20, paddingVertical: 8 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 12
  },
  userText: { flex: 1 },
  name: { color: colors.textPrimary, fontSize: 15, fontWeight: '600' },
  username: { color: colors.textSecondary, fontSize: 13, marginTop: 2 },
  separator: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border },
  empty: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 40,
    paddingHorizontal: 40
  }
})
