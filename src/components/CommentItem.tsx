import React, { memo, ReactElement, useEffect, useState } from 'react'
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native'

import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { useUser } from '../hooks/useUser'
import { blockUser } from '../services/blockService'
import { toggleCommentLike } from '../services/commentService'
import { colors } from '../utils/colorScheme'
import { formatRelativeTime } from '../utils/formatters'

import { Comment } from '../types'
import { Avatar } from './Avatar'
import { HeartButton } from './HeartButton'

type Props = {
  comment: Comment
  postId: string
  onReport: (comment: Comment) => void
}

const CommentItemComponent = ({ comment, postId, onReport }: Props): ReactElement => {
  const { user: currentUser } = useAuth()
  const toast = useToast()
  const { user: author } = useUser(comment.userId)

  const [local, setLocal] = useState<Comment>(comment)
  const [busy, setBusy] = useState(false)

  // Sync when parent passes a new comment (real-time listener fired)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocal(comment)
  }, [comment])

  const liked = !!currentUser && local.likes.includes(currentUser.uid)
  const canModerate = !!currentUser && currentUser.uid !== local.userId

  const handleLike = async () => {
    if (!currentUser || busy) return

    const next: Comment = {
      ...local,
      likes: liked
        ? local.likes.filter((id) => id !== currentUser.uid)
        : [...local.likes, currentUser.uid],
      likesCount: local.likesCount + (liked ? -1 : 1)
    }

    setLocal(next)
    setBusy(true)
    try {
      await toggleCommentLike(postId, local.commentId, currentUser.uid, liked)
    } catch {
      setLocal(local)
    } finally {
      setBusy(false)
    }
  }

  const openActionMenu = () => {
    if (!currentUser || !canModerate) return
    const handle = author?.displayName ?? 'this author'
    Alert.alert('More options', undefined, [
      { text: 'Report comment', onPress: () => onReport(local) },
      {
        text: `Block ${handle}`,
        style: 'destructive',
        onPress: () => {
          Alert.alert(
            `Block ${handle}?`,
            "You won't see their poems, comments, or notifications.",
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Block',
                style: 'destructive',
                onPress: async () => {
                  try {
                    await blockUser(currentUser.uid, local.userId)
                    toast.show('Blocked', 'success')
                  } catch (err: any) {
                    toast.show(err?.message ?? 'Could not block. Try again.', 'error')
                  }
                }
              }
            ]
          )
        }
      },
      { text: 'Cancel', style: 'cancel' }
    ])
  }

  return (
    <Pressable onLongPress={openActionMenu} delayLongPress={400} style={styles.row}>
      <Avatar
        uid={comment.userId}
        name={author?.displayName ?? '?'}
        avatarIndex={author?.avatarIndex}
        size={32}
      />
      <View style={styles.body}>
        <View style={styles.metaRow}>
          <Text style={styles.author} numberOfLines={1}>
            {author?.displayName ?? 'Anonymous'}
          </Text>
          <Text style={styles.time}>{formatRelativeTime(local.createdAt)}</Text>
        </View>
        <Text style={styles.content}>{local.content}</Text>
        <View style={styles.actions}>
          <HeartButton
            liked={liked}
            count={local.likesCount}
            onPress={handleLike}
            disabled={!currentUser}
            size={14}
          />
        </View>
      </View>
    </Pressable>
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
  },
  actions: {
    flexDirection: 'row',
    marginTop: 6
  }
})
