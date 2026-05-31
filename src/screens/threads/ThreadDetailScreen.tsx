import { Ionicons } from '@expo/vector-icons'
import { RouteProp, useFocusEffect, useNavigation, useRoute } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import React, { ReactElement, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  ListRenderItem,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { Avatar } from '../../components/Avatar'
import { MessageBubble } from '../../components/MessageBubble'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { useMessages } from '../../hooks/useMessages'
import { useUser } from '../../hooks/useUser'
import { MainStackParamList } from '../../navigation/MainStack'
import {
  getOrCreateThread,
  markThreadRead,
  sendMessage,
  threadIdFor
} from '../../services/messageService'
import { Message } from '../../types'
import { colors } from '../../utils/colorScheme'
import { useContentStyle } from '../../utils/responsive'

type R = RouteProp<MainStackParamList, 'ThreadDetail'>
type Nav = NativeStackNavigationProp<MainStackParamList>

type AnnotatedMessage = { message: Message; showTimestamp: boolean }

// If consecutive messages from the same sender are within 5 minutes,
// hide the timestamp under the earlier one. Reduces visual clutter.
const TIMESTAMP_GROUP_MS = 5 * 60 * 1000

export const ThreadDetailScreen = (): ReactElement => {
  const route = useRoute<R>()
  const nav = useNavigation<Nav>()
  const { user } = useAuth()
  const toast = useToast()
  const contentStyle = useContentStyle()
  const otherUid = route.params.otherUid
  const { user: other } = useUser(otherUid)

  const threadId = user ? threadIdFor(user.uid, otherUid) : null
  const { messages, loading } = useMessages(threadId)

  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const listRef = useRef<FlatList<AnnotatedMessage>>(null)

  // Ensure the thread doc exists on first open. Idempotent — service
  // skips if it already exists.
  useEffect(() => {
    if (!user) return
    void getOrCreateThread(user.uid, otherUid).catch(() => {
      // best-effort
    })
  }, [user, otherUid])

  // Mark read on focus + whenever new messages arrive while focused.
  useFocusEffect(
    useCallback(() => {
      if (!user || !threadId) return
      void markThreadRead(threadId, user.uid)
    }, [user, threadId])
  )

  useEffect(() => {
    if (!user || !threadId) return
    void markThreadRead(threadId, user.uid)
  }, [messages.length, threadId, user])

  // Annotate each message with whether the NEXT bubble should "group"
  // (same sender within 5 min). Show timestamp only on the last bubble
  // of each cluster.
  const annotated = useMemo(() => {
    return messages.map((m, i) => {
      const next = messages[i + 1]
      const sameClusterAsNext =
        next &&
        next.senderId === m.senderId &&
        m.createdAt &&
        next.createdAt &&
        next.createdAt.toMillis() - m.createdAt.toMillis() < TIMESTAMP_GROUP_MS
      return { message: m, showTimestamp: !sameClusterAsNext }
    })
  }, [messages])

  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (messages.length === 0) return
    const t = setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50)
    return () => clearTimeout(t)
  }, [messages.length])

  const handleSend = async () => {
    const text = draft.trim()
    if (!user || !threadId || !text || sending) return
    setSending(true)
    setDraft('')
    try {
      await sendMessage(threadId, user.uid, otherUid, text)
    } catch (err: any) {
      toast.show(err?.message ?? 'Could not send. Try again.', 'error')
      setDraft(text)
    } finally {
      setSending(false)
    }
  }

  const renderItem: ListRenderItem<AnnotatedMessage> = ({ item }) => (
    <MessageBubble
      message={item.message}
      isMine={!!user && item.message.senderId === user.uid}
      showTimestamp={item.showTimestamp}
    />
  )

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={[styles.header, contentStyle]}>
        <Pressable onPress={() => nav.goBack()} hitSlop={10} style={styles.iconBtn}>
          <Ionicons name="chevron-back" size={26} color={colors.primary} />
        </Pressable>
        <Pressable
          onPress={() => nav.navigate('UserProfile', { userId: otherUid })}
          style={styles.headerCenter}
          hitSlop={6}
        >
          <Avatar
            uid={otherUid}
            name={other?.displayName ?? '?'}
            avatarIndex={other?.avatarIndex}
            size={32}
          />
          <Text style={styles.title} numberOfLines={1}>
            {other?.displayName ?? 'Conversation'}
          </Text>
        </Pressable>
        <View style={{ width: 36 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {loading && messages.length === 0 ? (
          <View style={styles.center}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={annotated}
            keyExtractor={(item) => item.message.messageId}
            renderItem={renderItem}
            contentContainerStyle={[styles.list, contentStyle]}
            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
            ListEmptyComponent={
              <Text style={styles.empty}>Say hello — your first message will land here.</Text>
            }
          />
        )}

        <View style={[styles.composer, contentStyle]}>
          <TextInput
            style={styles.composerInput}
            placeholder="Message…"
            placeholderTextColor={colors.textMuted}
            value={draft}
            onChangeText={setDraft}
            editable={!sending}
            multiline
          />
          <Pressable
            onPress={handleSend}
            disabled={!draft.trim() || sending}
            hitSlop={8}
            style={({ pressed }) => [
              styles.send,
              pressed && { opacity: 0.7 },
              (!draft.trim() || sending) && { opacity: 0.4 }
            ]}
          >
            {sending ? (
              <ActivityIndicator color={colors.background} size="small" />
            ) : (
              <Ionicons name="arrow-up" size={20} color={colors.background} />
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
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
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border
  },
  iconBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    justifyContent: 'center'
  },
  title: { color: colors.textPrimary, fontSize: 15, fontWeight: '600', flexShrink: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { paddingVertical: 12, flexGrow: 1 },
  empty: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 40,
    paddingHorizontal: 32
  },
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
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center'
  }
})
