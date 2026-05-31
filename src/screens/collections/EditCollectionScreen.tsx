import { RouteProp, useNavigation, useRoute } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import React, { ReactElement, useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { MainStackParamList } from '../../navigation/MainStack'
import {
  createCollection,
  deleteCollection,
  getCollection,
  updateCollection
} from '../../services/collectionService'
import { colors } from '../../utils/colorScheme'
import { useContentStyle } from '../../utils/responsive'

type R = RouteProp<MainStackParamList, 'EditCollection'>
type Nav = NativeStackNavigationProp<MainStackParamList>

const TITLE_MAX = 80
const DESC_MAX = 240

export const EditCollectionScreen = (): ReactElement => {
  const nav = useNavigation<Nav>()
  const route = useRoute<R>()
  const { user } = useAuth()
  const toast = useToast()
  const collectionId = route.params?.collectionId
  const isEdit = !!collectionId

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [isPublic, setIsPublic] = useState(true)
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const contentStyle = useContentStyle()

  // Load existing collection when editing
  useEffect(() => {
    if (!isEdit || !collectionId) return
    let cancelled = false
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true)
    getCollection(collectionId)
      .then((c) => {
        if (cancelled || !c) return
        setTitle(c.title)
        setDescription(c.description)
        setIsPublic(c.isPublic)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [isEdit, collectionId])

  const canSave = title.trim().length > 0 && !!user && !saving

  const handleSave = async () => {
    if (!user || !canSave) return
    setSaving(true)
    try {
      if (isEdit && collectionId) {
        await updateCollection(collectionId, {
          title: title.trim(),
          description: description.trim(),
          isPublic
        })
      } else {
        await createCollection({
          ownerId: user.uid,
          title: title.trim(),
          description: description.trim(),
          isPublic
        })
      }
      toast.show(isEdit ? 'Collection saved' : 'Collection created', 'success')
      nav.goBack()
    } catch (err: any) {
      toast.show(err?.message ?? 'Could not save. Try again.', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = () => {
    if (!collectionId) return
    Alert.alert(
      'Delete collection?',
      'This removes the collection and clears its poem references. Your poems themselves stay safe.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCollection(collectionId)
              toast.show('Collection deleted', 'success')
              nav.goBack()
            } catch (err: any) {
              toast.show(err?.message ?? 'Could not delete. Try again.', 'error')
            }
          }
        }
      ]
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={[styles.header, contentStyle]}>
        <Pressable onPress={() => nav.goBack()} hitSlop={10}>
          <Text style={styles.cancel}>Cancel</Text>
        </Pressable>
        <Text style={styles.title}>{isEdit ? 'Edit collection' : 'New collection'}</Text>
        <Pressable onPress={handleSave} disabled={!canSave} hitSlop={10}>
          {saving ? (
            <ActivityIndicator color={colors.primary} size="small" />
          ) : (
            <Text style={[styles.save, !canSave && styles.saveDisabled]}>
              {isEdit ? 'Save' : 'Create'}
            </Text>
          )}
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <KeyboardAvoidingView
          style={styles.body}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={[styles.form, contentStyle]}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.label}>Title</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Spring poems"
              placeholderTextColor={colors.textMuted}
              value={title}
              onChangeText={(t) => setTitle(t.slice(0, TITLE_MAX))}
              editable={!saving}
              maxLength={TITLE_MAX}
            />

            <Text style={styles.label}>Description (optional)</Text>
            <TextInput
              style={[styles.input, styles.descInput]}
              placeholder="What ties this collection together?"
              placeholderTextColor={colors.textMuted}
              value={description}
              onChangeText={(t) => setDescription(t.slice(0, DESC_MAX))}
              editable={!saving}
              multiline
              textAlignVertical="top"
              maxLength={DESC_MAX}
            />
            <Text style={styles.counter}>
              {description.length}/{DESC_MAX}
            </Text>

            <View style={styles.toggleRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.toggleLabel}>Public</Text>
                <Text style={styles.toggleSub}>
                  {isPublic
                    ? 'Anyone can see this collection on your profile.'
                    : 'Only you can see this collection.'}
                </Text>
              </View>
              <Switch
                value={isPublic}
                onValueChange={setIsPublic}
                disabled={saving}
                trackColor={{ false: colors.surfaceElevated, true: colors.primary }}
                thumbColor={colors.textPrimary}
              />
            </View>

            {isEdit ? (
              <Pressable
                onPress={handleDelete}
                disabled={saving}
                style={({ pressed }) => [styles.deleteBtn, pressed && { opacity: 0.7 }]}
              >
                <Text style={styles.deleteText}>Delete collection</Text>
              </Pressable>
            ) : null}
          </ScrollView>
        </KeyboardAvoidingView>
      )}
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
  save: { color: colors.primary, fontSize: 16, fontWeight: '700' },
  saveDisabled: { color: colors.textMuted, fontWeight: '600' },
  body: { flex: 1 },
  form: { padding: 20, paddingBottom: 60 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  label: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 18,
    marginBottom: 8
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: 16
  },
  descInput: { minHeight: 120 },
  counter: { color: colors.textMuted, fontSize: 11, marginTop: 4, textAlign: 'right' },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    marginTop: 24,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12
  },
  toggleLabel: { color: colors.textPrimary, fontSize: 15, fontWeight: '600' },
  toggleSub: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },
  deleteBtn: {
    marginTop: 32,
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border
  },
  deleteText: { color: colors.accent, fontSize: 15, fontWeight: '600' }
})
