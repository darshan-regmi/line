import React, { ReactElement, useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native'

import { useAuth } from '../context/AuthContext'
import { createReport } from '../services/reportService'
import { colors } from '../utils/colorScheme'

import { ReportReason, ReportTargetType } from '../types'

type Props = {
  visible: boolean
  targetType: ReportTargetType
  targetId: string
  postId?: string
  onClose: () => void
}

const REASONS: { value: ReportReason; label: string }[] = [
  { value: 'spam', label: 'Spam' },
  { value: 'harassment', label: 'Harassment or bullying' },
  { value: 'hate', label: 'Hate speech' },
  { value: 'sexual', label: 'Sexual content' },
  { value: 'self_harm', label: 'Self-harm or suicide' },
  { value: 'misinformation', label: 'Misinformation' },
  { value: 'other', label: 'Something else' }
]

const NOTE_MAX = 280

const targetLabel = (t: ReportTargetType): string => {
  switch (t) {
    case 'post':
      return 'poem'
    case 'comment':
      return 'comment'
    case 'user':
      return 'account'
  }
}

export const ReportSheet = ({
  visible,
  targetType,
  targetId,
  postId,
  onClose
}: Props): ReactElement => {
  const { user } = useAuth()
  const [reason, setReason] = useState<ReportReason | null>(null)
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Reset state every time the sheet opens
  useEffect(() => {
    if (!visible) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReason(null)
    setNote('')
    setSubmitting(false)
  }, [visible])

  const canSubmit = !!reason && !!user && !submitting

  const handleSubmit = async () => {
    if (!canSubmit || !reason || !user) return
    setSubmitting(true)
    try {
      await createReport({
        reporterUid: user.uid,
        targetType,
        targetId,
        reason,
        note: note.trim() || undefined,
        postId
      })
      onClose()
      Alert.alert('Report submitted', "Thanks. We'll review it.")
    } catch (err: any) {
      Alert.alert('Could not submit', err?.message ?? 'Try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <View style={styles.handle} />
            <View style={styles.header}>
              <Pressable onPress={onClose} hitSlop={10}>
                <Text style={styles.cancel}>Cancel</Text>
              </Pressable>
              <Text style={styles.title}>Report this {targetLabel(targetType)}</Text>
              <Pressable onPress={handleSubmit} disabled={!canSubmit} hitSlop={10}>
                {submitting ? (
                  <ActivityIndicator color={colors.primary} size="small" />
                ) : (
                  <Text style={[styles.submit, !canSubmit && styles.submitDisabled]}>Submit</Text>
                )}
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
              <Text style={styles.sectionLabel}>Why are you reporting this?</Text>
              {REASONS.map((r) => {
                const selected = reason === r.value
                return (
                  <Pressable
                    key={r.value}
                    onPress={() => setReason(r.value)}
                    style={({ pressed }) => [styles.reasonRow, pressed && { opacity: 0.7 }]}
                  >
                    <Text style={styles.reasonLabel}>{r.label}</Text>
                    <View style={[styles.radio, selected && styles.radioActive]}>
                      {selected ? <View style={styles.radioDot} /> : null}
                    </View>
                  </Pressable>
                )
              })}

              <Text style={styles.sectionLabel}>Additional detail (optional)</Text>
              <TextInput
                style={styles.noteInput}
                placeholder="Anything else we should know?"
                placeholderTextColor={colors.textMuted}
                value={note}
                onChangeText={(t) => setNote(t.slice(0, NOTE_MAX))}
                editable={!submitting}
                multiline
                textAlignVertical="top"
                maxLength={NOTE_MAX}
              />
              <Text style={styles.counter}>
                {note.length}/{NOTE_MAX}
              </Text>
            </ScrollView>
          </KeyboardAvoidingView>
        </Pressable>
      </Pressable>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end'
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 8,
    paddingBottom: 24,
    maxHeight: '85%'
  },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginBottom: 8
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border
  },
  cancel: { color: colors.textSecondary, fontSize: 15 },
  title: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center'
  },
  submit: { color: colors.primary, fontSize: 15, fontWeight: '700' },
  submitDisabled: { color: colors.textMuted, fontWeight: '600' },
  body: { padding: 20, paddingBottom: 40 },
  sectionLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 12,
    marginBottom: 10
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12
  },
  reasonLabel: { color: colors.textPrimary, fontSize: 15, flex: 1 },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center'
  },
  radioActive: { borderColor: colors.primary },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary
  },
  noteInput: {
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: 15,
    minHeight: 100,
    marginTop: 4
  },
  counter: { color: colors.textMuted, fontSize: 11, marginTop: 4, textAlign: 'right' }
})
