import React, { memo, ReactElement } from 'react'
import { StyleSheet, Text, View } from 'react-native'

import { colors } from '../utils/colorScheme'
import { formatRelativeTime } from '../utils/formatters'

import { Message } from '../types'

type Props = {
  message: Message
  isMine: boolean
  /** When true, render the timestamp below the bubble. Caller controls grouping. */
  showTimestamp?: boolean
}

const MessageBubbleComponent = ({ message, isMine, showTimestamp }: Props): ReactElement => (
  <View style={[styles.row, isMine ? styles.rowMine : styles.rowTheirs]}>
    <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleTheirs]}>
      <Text style={[styles.text, isMine ? styles.textMine : styles.textTheirs]}>
        {message.content}
      </Text>
    </View>
    {showTimestamp ? (
      <Text style={[styles.time, isMine ? styles.timeMine : styles.timeTheirs]}>
        {formatRelativeTime(message.createdAt)}
      </Text>
    ) : null}
  </View>
)

export const MessageBubble = memo(MessageBubbleComponent)

const styles = StyleSheet.create({
  row: {
    marginVertical: 2,
    paddingHorizontal: 16,
    maxWidth: '85%'
  },
  rowMine: { alignSelf: 'flex-end' },
  rowTheirs: { alignSelf: 'flex-start' },
  bubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18
  },
  bubbleMine: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4
  },
  bubbleTheirs: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderBottomLeftRadius: 4
  },
  text: { fontSize: 15, lineHeight: 20 },
  textMine: { color: colors.background },
  textTheirs: { color: colors.textPrimary },
  time: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 4
  },
  timeMine: { textAlign: 'right' },
  timeTheirs: { textAlign: 'left' }
})
