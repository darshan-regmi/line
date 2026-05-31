import React, { memo, ReactElement } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

import { useAuth } from '../context/AuthContext'
import { useUser } from '../hooks/useUser'
import { colors } from '../utils/colorScheme'
import { formatRelativeTime, truncate } from '../utils/formatters'

import { Thread } from '../types'
import { Avatar } from './Avatar'

type Props = {
  thread: Thread
  onPress: () => void
}

const ThreadCardComponent = ({ thread, onPress }: Props): ReactElement | null => {
  const { user } = useAuth()
  const otherUid = thread.participantIds.find((p) => p !== user?.uid) ?? null
  const { user: other } = useUser(otherUid)
  const unread = user ? (thread.unreadCounts?.[user.uid] ?? 0) : 0

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        unread > 0 && styles.unread,
        pressed && { opacity: 0.7 }
      ]}
    >
      <Avatar
        uid={otherUid ?? undefined}
        name={other?.displayName ?? '?'}
        avatarIndex={other?.avatarIndex}
        size={48}
      />
      <View style={styles.body}>
        <View style={styles.topLine}>
          <Text style={styles.name} numberOfLines={1}>
            {other?.displayName ?? 'Conversation'}
          </Text>
          {thread.lastMessageAt ? (
            <Text style={styles.time}>{formatRelativeTime(thread.lastMessageAt)}</Text>
          ) : null}
        </View>
        <View style={styles.bottomLine}>
          <Text style={[styles.snippet, unread > 0 && styles.snippetUnread]} numberOfLines={1}>
            {thread.lastMessage ? truncate(thread.lastMessage, 60) : 'Start the conversation'}
          </Text>
          {unread > 0 ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unread > 9 ? '9+' : unread}</Text>
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  )
}

export const ThreadCard = memo(ThreadCardComponent)

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border
  },
  unread: { backgroundColor: colors.surface },
  body: { flex: 1 },
  topLine: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 4,
    gap: 8
  },
  name: { color: colors.textPrimary, fontSize: 15, fontWeight: '600', flex: 1 },
  time: { color: colors.textSecondary, fontSize: 12 },
  bottomLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8
  },
  snippet: { color: colors.textSecondary, fontSize: 14, flex: 1 },
  snippetUnread: { color: colors.textPrimary, fontWeight: '500' },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6
  },
  badgeText: { color: colors.textPrimary, fontSize: 11, fontWeight: '700' }
})
