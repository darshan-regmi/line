import React, { memo, ReactElement } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

import { useUser } from '../hooks/useUser'
import { colors } from '../utils/colorScheme'
import { formatRelativeTime } from '../utils/formatters'

import { Notification } from '../types'
import { Avatar } from './Avatar'

type Props = {
  notification: Notification
  onPress: () => void
}

const verbFor = (type: Notification['type']): string => {
  switch (type) {
    case 'like':
      return 'liked your poem'
    case 'comment':
      return 'commented on your poem'
    case 'follow':
      return 'started following you'
  }
}

const NotificationItemComponent = ({ notification, onPress }: Props): ReactElement => {
  const { user: actor } = useUser(notification.actorUid)

  const name = actor?.displayName ?? 'Someone'

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        !notification.read && styles.unread,
        pressed && { opacity: 0.7 }
      ]}
    >
      <Avatar name={name} avatarIndex={actor?.avatarIndex} size={40} />
      <View style={styles.body}>
        <Text style={styles.text} numberOfLines={2}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.verb}> {verbFor(notification.type)}</Text>
        </Text>
        <Text style={styles.time}>{formatRelativeTime(notification.createdAt)}</Text>
      </View>
      {!notification.read ? <View style={styles.dot} /> : null}
    </Pressable>
  )
}

export const NotificationItem = memo(NotificationItemComponent)

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
  unread: {
    backgroundColor: colors.surface
  },
  body: { flex: 1 },
  text: { color: colors.textPrimary, fontSize: 14, lineHeight: 20 },
  name: { fontWeight: '700' },
  verb: { color: colors.textPrimary },
  time: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary
  }
})
