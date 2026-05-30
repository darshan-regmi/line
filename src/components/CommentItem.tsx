import React, { memo, ReactElement } from 'react'
import { StyleSheet, Text, View } from 'react-native'

import { useUser } from '../hooks/useUser'
import { colors } from '../utils/colorScheme'
import { formatRelativeTime } from '../utils/formatters'

import { Comment } from '../types'
import { Avatar } from './Avatar'

type Props = {
  comment: Comment
}

const CommentItemComponent = ({ comment }: Props): ReactElement => {
  const { user: author } = useUser(comment.userId)

  return (
    <View style={styles.row}>
      <Avatar name={author?.displayName ?? '?'} avatarIndex={author?.avatarIndex} size={32} />
      <View style={styles.body}>
        <View style={styles.metaRow}>
          <Text style={styles.author} numberOfLines={1}>
            {author?.displayName ?? 'Anonymous'}
          </Text>
          <Text style={styles.time}>{formatRelativeTime(comment.createdAt)}</Text>
        </View>
        <Text style={styles.content}>{comment.content}</Text>
      </View>
    </View>
  )
}

export const CommentItem = memo(CommentItemComponent)

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingVertical: 12,
    gap: 12
  },
  body: {
    flex: 1
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 4
  },
  author: {
    color: colors.textPrimary,
    fontWeight: '600',
    fontSize: 14
  },
  time: {
    color: colors.textSecondary,
    fontSize: 12
  },
  content: {
    color: colors.textPrimary,
    fontSize: 14,
    lineHeight: 20
  }
})
