import { RouteProp, useNavigation, useRoute } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import React, { ReactElement, useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  ListRenderItem,
  Platform,
  Pressable,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { AddToCollectionSheet } from '../../components/AddToCollectionSheet'
import { Avatar } from '../../components/Avatar'
import { BookmarkButton } from '../../components/BookmarkButton'
import { CommentItem } from '../../components/CommentItem'
import { HeartButton } from '../../components/HeartButton'
import { LikesModal } from '../../components/LikesModal'
import { useAuth } from '../../context/AuthContext'
import { usePost } from '../../hooks/usePost'
import { useUser } from '../../hooks/useUser'
import { MainStackParamList } from '../../navigation/MainStack'
import { addComment, subscribeComments } from '../../services/commentService'
import { incrementPostView, toggleLike } from '../../services/postService'
import { Comment } from '../../types'
import { colors } from '../../utils/colorScheme'
import { formatRelativeTime, pluralize } from '../../utils/formatters'

type R = RouteProp<MainStackParamList, 'PostDetail'>
type Nav = NativeStackNavigationProp<MainStackParamList>

export const PostDetailScreen = (): ReactElement => {
  const route = useRoute<R>()
  const nav = useNavigation<Nav>()
  const { user } = useAuth()

  const { post, setPost, loading } = usePost(route.params.postId)
  const { user: author } = useUser(post?.userId)

  const [comments, setComments] = useState<Comment[]>([])
  const [commentsLoading, setCommentsLoading] = useState(true)
  const [draft, setDraft] = useState('')
  const [posting, setPosting] = useState(false)
  const [likeBusy, setLikeBusy] = useState(false)
  const [likesModalVisible, setLikesModalVisible] = useState(false)
  const [collectionSheetVisible, setCollectionSheetVisible] = useState(false)

  const postId = post?.postId
  useEffect(() => {
    if (!postId) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCommentsLoading(true)
    const unsubscribe = subscribeComments(postId, (next) => {
      setComments(next)
      setCommentsLoading(false)
    })
    return unsubscribe
  }, [postId])

  // Bump view count once per mount. Best-effort; failure is silent.
  useEffect(() => {
    if (!postId) return
    void incrementPostView(postId)
  }, [postId])

  const liked = !!user && !!post && post.likes.includes(user.uid)

  const handleLike = async () => {
    if (!user || !post || likeBusy) return
    const next = {
      ...post,
      likes: liked ? post.likes.filter((id) => id !== user.uid) : [...post.likes, user.uid],
      likesCount: post.likesCount + (liked ? -1 : 1)
    }
    setPost(next)
    setLikeBusy(true)
    try {
      await toggleLike(post.postId, user.uid, liked, post.userId)
    } catch {
      setPost(post)
    } finally {
      setLikeBusy(false)
    }
  }

  const handleShare = async () => {
    if (!post) return
    const handle = author?.username ? `@${author.username}` : (author?.displayName ?? 'a poet')
    const title = post.title ? `${post.title}\n\n` : ''
    const message = `${title}${post.content}\n\n— ${handle} on Line`
    try {
      await Share.share({ message, title: post.title || undefined })
    } catch {
      // User cancelled or share unavailable — silent
    }
  }

  const handlePostComment = async () => {
    if (!user || !post || !draft.trim() || posting) return
    setPosting(true)
    const text = draft.trim()
    try {
      const id = await addComment(post.postId, user.uid, text, post.userId)
      const newComment: Comment = {
        commentId: id,
        userId: user.uid,
        content: text,
        likes: [],
        likesCount: 0,
        createdAt: null
      }
      // The real-time listener may have already added this comment (Firestore
      // surfaces pending writes via the local cache). Skip the prepend if the
      // id is already present — otherwise React warns about duplicate keys.
      setComments((prev) => (prev.some((c) => c.commentId === id) ? prev : [newComment, ...prev]))
      setPost({ ...post, commentsCount: post.commentsCount + 1 })
      setDraft('')
    } catch (err: any) {
      Alert.alert('Could not comment', err?.message ?? 'Try again.')
    } finally {
      setPosting(false)
    }
  }

  if (loading || !post) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => nav.goBack()} hitSlop={10}>
            <Text style={styles.back}>← Back</Text>
          </Pressable>
        </View>
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </SafeAreaView>
    )
  }

  const renderComment: ListRenderItem<Comment> = ({ item }) => (
    <CommentItem comment={item} postId={post.postId} />
  )

  const header = (
    <View>
      <Pressable
        onPress={() => nav.navigate('UserProfile', { userId: post.userId })}
        style={({ pressed }) => [styles.authorRow, pressed && { opacity: 0.7 }]}
        hitSlop={4}
      >
        <Avatar
          name={author?.displayName ?? '?'}
          avatarIndex={author?.avatarIndex ?? 0}
          size={44}
        />
        <View style={styles.authorMeta}>
          <Text style={styles.authorName}>{author?.displayName ?? 'Anonymous'}</Text>
          <Text style={styles.authorSub}>
            @{author?.username ?? '...'} · {formatRelativeTime(post.createdAt)}
            {post.viewCount > 0 ? ` · ${pluralize(post.viewCount, 'view')}` : ''}
          </Text>
        </View>
      </Pressable>

      {post.title ? <Text style={styles.title}>{post.title}</Text> : null}
      <Text style={styles.body}>{post.content}</Text>

      <View style={styles.actions}>
        <HeartButton
          liked={liked}
          count={0}
          onPress={handleLike}
          disabled={!user}
          size={22}
          showCount={false}
        />
        <Pressable
          onPress={() => setLikesModalVisible(true)}
          disabled={post.likesCount === 0}
          hitSlop={8}
          style={({ pressed }) => [pressed && { opacity: 0.6 }]}
        >
          <Text style={[styles.likeCount, post.likesCount === 0 && { opacity: 0.4 }]}>
            {post.likesCount} {post.likesCount === 1 ? 'like' : 'likes'}
          </Text>
        </Pressable>
        <View style={styles.action}>
          <Text style={styles.actionIcon}>💬</Text>
          <Text style={styles.actionText}>{post.commentsCount}</Text>
        </View>
        <View style={{ flex: 1 }} />
        {user ? (
          <Pressable
            onPress={() => setCollectionSheetVisible(true)}
            hitSlop={8}
            style={({ pressed }) => [styles.action, pressed && { opacity: 0.6 }]}
          >
            <Text style={[styles.actionIcon, { fontSize: 20 }]}>📚</Text>
          </Pressable>
        ) : null}
        <BookmarkButton postId={post.postId} size={22} />
      </View>

      <View style={styles.divider} />
      <Text style={styles.commentsLabel}>Comments</Text>
    </View>
  )

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => nav.goBack()} hitSlop={10}>
          <Text style={styles.back}>← Back</Text>
        </Pressable>
        <Pressable onPress={handleShare} hitSlop={10}>
          <Text style={styles.share}>Share</Text>
        </Pressable>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <FlatList
          data={comments}
          keyExtractor={(c) => c.commentId}
          renderItem={renderComment}
          ListHeaderComponent={header}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            commentsLoading ? (
              <ActivityIndicator color={colors.textSecondary} style={{ marginTop: 16 }} />
            ) : (
              <Text style={styles.empty}>Be the first to comment.</Text>
            )
          }
        />

        <View style={styles.composer}>
          <TextInput
            style={styles.composerInput}
            placeholder="Add a comment..."
            placeholderTextColor={colors.textMuted}
            value={draft}
            onChangeText={setDraft}
            editable={!posting}
            multiline
          />
          <Pressable
            onPress={handlePostComment}
            disabled={!draft.trim() || posting}
            hitSlop={8}
            style={({ pressed }) => [
              styles.send,
              pressed && { opacity: 0.7 },
              (!draft.trim() || posting) && { opacity: 0.4 }
            ]}
          >
            {posting ? (
              <ActivityIndicator color={colors.background} size="small" />
            ) : (
              <Text style={styles.sendText}>Post</Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>

      <LikesModal
        visible={likesModalVisible}
        userIds={post.likes}
        onClose={() => setLikesModalVisible(false)}
        onUserPress={(uid) => {
          setLikesModalVisible(false)
          nav.navigate('UserProfile', { userId: uid })
        }}
      />

      <AddToCollectionSheet
        visible={collectionSheetVisible}
        postId={post.postId}
        onClose={() => setCollectionSheetVisible(false)}
        onCreateNew={() => {
          setCollectionSheetVisible(false)
          nav.navigate('EditCollection')
        }}
      />
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
  back: { color: colors.primary, fontSize: 16 },
  share: { color: colors.primary, fontSize: 16, fontWeight: '600' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { padding: 16, paddingBottom: 80 },

  authorRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  authorMeta: { marginLeft: 12, flex: 1 },
  authorName: { color: colors.textPrimary, fontSize: 16, fontWeight: '600' },
  authorSub: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },

  title: { color: colors.textPrimary, fontSize: 24, fontWeight: '700', marginBottom: 10 },
  body: { color: colors.textPrimary, fontSize: 17, lineHeight: 28, fontWeight: '300' },

  actions: { flexDirection: 'row', alignItems: 'center', marginTop: 18, gap: 16 },
  action: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  likeCount: { color: colors.textSecondary, fontSize: 14, fontWeight: '500' },
  actionIcon: { color: colors.textSecondary, fontSize: 20 },
  actionIconActive: { color: colors.accent },
  actionText: { color: colors.textSecondary, fontSize: 14 },
  actionTextActive: { color: colors.accent },

  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginVertical: 20
  },
  commentsLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4
  },
  empty: { color: colors.textSecondary, textAlign: 'center', marginTop: 24 },

  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.background
  },
  composerInput: {
    flex: 1,
    color: colors.textPrimary,
    backgroundColor: colors.surface,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 120
  },
  send: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 40,
    minWidth: 56
  },
  sendText: { color: colors.background, fontWeight: '700', fontSize: 14 }
})
