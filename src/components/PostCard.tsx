import React, { memo, ReactElement, useEffect, useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

import { useAuth } from '../context/AuthContext'
import { useUser } from '../hooks/useUser'
import { toggleLike } from '../services/postService'
import { colors } from '../utils/colorScheme'
import { formatRelativeTime, pluralize, truncate } from '../utils/formatters'

import { Post } from '../types'
import { Avatar } from './Avatar'
import { HeartButton } from './HeartButton'

type Props = {
  post: Post
  onPress?: () => void
  onAuthorPress?: (userId: string) => void
  onLikeToggled?: (updated: Post) => void
}

const PostCardComponent = ({
  post,
  onPress,
  onAuthorPress,
  onLikeToggled
}: Props): ReactElement => {
  const { user: currentUser } = useAuth()
  const { user: author } = useUser(post.userId)
  const [localPost, setLocalPost] = useState<Post>(post)
  const [busy, setBusy] = useState(false)

  // Sync local state when the parent passes a new post (e.g., real-time
  // listener fired or another user liked). Optimistic in-flight changes get
  // overwritten by the canonical server value — desired behavior.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocalPost(post)
  }, [post])

  const liked = !!currentUser && localPost.likes.includes(currentUser.uid)

  const handleLike = async () => {
    if (!currentUser || busy) return

    const next: Post = {
      ...localPost,
      likes: liked
        ? localPost.likes.filter((id) => id !== currentUser.uid)
        : [...localPost.likes, currentUser.uid],
      likesCount: localPost.likesCount + (liked ? -1 : 1)
    }

    setLocalPost(next)
    setBusy(true)
    try {
      await toggleLike(localPost.postId, currentUser.uid, liked, localPost.userId)
      onLikeToggled?.(next)
    } catch {
      setLocalPost(localPost)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}
    >
      <Pressable
        onPress={onAuthorPress ? () => onAuthorPress(post.userId) : undefined}
        disabled={!onAuthorPress}
        style={({ pressed }) => [styles.header, pressed && onAuthorPress && { opacity: 0.7 }]}
        hitSlop={4}
      >
        <Avatar name={author?.displayName ?? '?'} avatarIndex={author?.avatarIndex} size={36} />
        <View style={styles.headerText}>
          <Text style={styles.author} numberOfLines={1}>
            {author?.displayName ?? 'Anonymous'}
          </Text>
          <Text style={styles.meta}>
            @{author?.username ?? '...'} · {formatRelativeTime(localPost.createdAt)}
            {localPost.viewCount > 0 ? ` · ${pluralize(localPost.viewCount, 'view')}` : ''}
          </Text>
        </View>
      </Pressable>

      {localPost.title ? <Text style={styles.title}>{localPost.title}</Text> : null}
      <Text style={styles.body}>{truncate(localPost.content, 280)}</Text>

      <View style={styles.actions}>
        <HeartButton
          liked={liked}
          count={localPost.likesCount}
          onPress={handleLike}
          disabled={!currentUser}
          size={18}
        />

        <View style={styles.action}>
          <Text style={styles.actionIcon}>💬</Text>
          <Text style={styles.actionText}>{localPost.commentsCount}</Text>
        </View>
      </View>
    </Pressable>
  )
}

export const PostCard = memo(PostCardComponent)

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  headerText: {
    marginLeft: 12,
    flex: 1
  },
  author: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '600'
  },
  meta: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2
  },
  title: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6
  },
  body: {
    color: colors.textPrimary,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '300'
  },
  actions: {
    flexDirection: 'row',
    marginTop: 14,
    gap: 20
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  actionIcon: {
    color: colors.textSecondary,
    fontSize: 18
  },
  actionText: {
    color: colors.textSecondary,
    fontSize: 13
  }
})
