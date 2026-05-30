import { useNavigation } from '@react-navigation/native'
import React, { ReactElement, useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
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
import { invalidateUserCache, useUser } from '../../hooks/useUser'
import { updateUser } from '../../services/userService'
import { colors } from '../../utils/colorScheme'

const BIO_MAX = 160

export const EditProfileScreen = (): ReactElement => {
  const nav = useNavigation()
  const { user } = useAuth()
  const { user: profile, loading } = useUser(user?.uid)

  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (profile) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDisplayName(profile.displayName)
      setBio(profile.bio)
    }
  }, [profile])

  const canSave = !!user && displayName.trim().length > 0 && !saving

  const handleSave = async () => {
    if (!user || !canSave) return
    setSaving(true)
    try {
      await updateUser(user.uid, {
        displayName: displayName.trim(),
        bio: bio.trim()
      })
      invalidateUserCache(user.uid)
      nav.goBack()
    } catch (err: any) {
      Alert.alert('Could not save', err?.message ?? 'Try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => nav.goBack()} hitSlop={10}>
          <Text style={styles.cancel}>Cancel</Text>
        </Pressable>
        <Text style={styles.title}>Edit profile</Text>
        <Pressable onPress={handleSave} disabled={!canSave} hitSlop={10}>
          {saving ? (
            <ActivityIndicator color={colors.primary} size="small" />
          ) : (
            <Text style={[styles.save, !canSave && styles.saveDisabled]}>Save</Text>
          )}
        </Pressable>
      </View>

      {loading && !profile ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <KeyboardAvoidingView
          style={styles.body}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
            <Text style={styles.label}>Display name</Text>
            <TextInput
              style={styles.input}
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Your name"
              placeholderTextColor={colors.textMuted}
              editable={!saving}
            />

            <Text style={styles.label}>Bio</Text>
            <TextInput
              style={[styles.input, styles.bioInput]}
              value={bio}
              onChangeText={(t) => setBio(t.slice(0, BIO_MAX))}
              placeholder="A line about yourself"
              placeholderTextColor={colors.textMuted}
              editable={!saving}
              multiline
              textAlignVertical="top"
              maxLength={BIO_MAX}
            />
            <Text style={styles.counter}>
              {bio.length}/{BIO_MAX}
            </Text>
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
  bioInput: { minHeight: 100 },
  counter: { color: colors.textMuted, fontSize: 11, marginTop: 4, textAlign: 'right' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' }
})
