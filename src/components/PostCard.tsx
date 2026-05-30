import React, { memo, ReactElement, useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

import { useAuth } from '../context/AuthContext'
import { useUser } from '../hooks/useUser'
import { toggleLike } from '../services/postService'
import { colors } from '../utils/colorScheme'
import { formatRelativeTime, truncate } from '../utils/formatters'

import { Post } from '../types'
import { Avatar } from './Avatar'

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
      await toggleLike(localPost.postId, currentUser.uid, liked)
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
          </Text>
        </View>
      </Pressable>

      {localPost.title ? <Text style={styles.title}>{localPost.title}</Text> : null}
      <Text style={styles.body}>{truncate(localPost.content, 280)}</Text>

      <View style={styles.actions}>
        <Pressable
          onPress={handleLike}
          disabled={!currentUser}
          hitSlop={8}
          style={({ pressed }) => [styles.action, pressed && { opacity: 0.6 }]}
        >
          <Text style={[styles.actionIcon, liked && styles.actionIconActive]}>
            {liked ? '♥' : '♡'}
          </Text>
          <Text style={[styles.actionText, liked && styles.actionTextActive]}>
            {localPost.likesCount}
          </Text>
        </Pressable>

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
  actionIconActive: {
    color: colors.accent
  },
  actionText: {
    color: colors.textSecondary,
    fontSize: 13
  },
  actionTextActive: {
    color: colors.accent
  }
})
