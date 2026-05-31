import { useNavigation } from '@react-navigation/native'
import React, { ReactElement, useState } from 'react'
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { createPost } from '../../services/postService'
import { colors } from '../../utils/colorScheme'
import { useContentStyle } from '../../utils/responsive'

const TITLE_MAX = 100
const CONTENT_MAX = 2000

export const CreatePostScreen = (): ReactElement => {
  const nav = useNavigation()
  const { user } = useAuth()
  const toast = useToast()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const contentStyle = useContentStyle()

  const canSubmit = title.trim().length > 0 && content.trim().length > 0 && !submitting

  const handlePublish = async () => {
    if (!user || !canSubmit) return
    setSubmitting(true)
    try {
      await createPost({
        userId: user.uid,
        title: title.trim(),
        content: content.trim(),
        isPublished: true
      })
      setTitle('')
      setContent('')
      toast.show('Posted', 'success')
      nav.goBack()
    } catch (err: any) {
      toast.show(err?.message ?? 'Could not publish. Try again.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={[styles.header, contentStyle]}>
        <Pressable onPress={() => nav.goBack()} hitSlop={10}>
          <Text style={styles.cancel}>Cancel</Text>
        </Pressable>
        <Text style={styles.title}>New poem</Text>
        <Pressable onPress={handlePublish} disabled={!canSubmit} hitSlop={10}>
          {submitting ? (
            <ActivityIndicator color={colors.primary} size="small" />
          ) : (
            <Text style={[styles.publish, !canSubmit && styles.publishDisabled]}>Publish</Text>
          )}
        </Pressable>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.body}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[styles.scroll, contentStyle]}
        >
          <TextInput
            style={styles.titleInput}
            placeholder="Title"
            placeholderTextColor={colors.textMuted}
            value={title}
            onChangeText={(t) => setTitle(t.slice(0, TITLE_MAX))}
            editable={!submitting}
            maxLength={TITLE_MAX}
          />
          <Text style={styles.counter}>
            {title.length}/{TITLE_MAX}
          </Text>

          <TextInput
            style={styles.contentInput}
            placeholder="Write something true..."
            placeholderTextColor={colors.textMuted}
            value={content}
            onChangeText={(t) => setContent(t.slice(0, CONTENT_MAX))}
            multiline
            editable={!submitting}
            textAlignVertical="top"
          />
          <Text style={styles.counter}>
            {content.length}/{CONTENT_MAX}
          </Text>
        </ScrollView>
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
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border
  },
  cancel: { color: colors.textSecondary, fontSize: 16 },
  title: { color: colors.textPrimary, fontSize: 17, fontWeight: '600' },
  publish: { color: colors.primary, fontSize: 16, fontWeight: '700' },
  publishDisabled: { color: colors.textMuted, fontWeight: '600' },
  body: { flex: 1 },
  scroll: { padding: 20, paddingBottom: 60 },
  titleInput: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: '700',
    paddingVertical: 6
  },
  contentInput: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: '300',
    lineHeight: 26,
    minHeight: 240,
    paddingVertical: 16
  },
  counter: {
    color: colors.textMuted,
    fontSize: 11,
    textAlign: 'right',
    marginBottom: 8
  }
})
