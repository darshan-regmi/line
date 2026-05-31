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

import { auth } from '../../config/firebase'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { invalidateUserCache, useUser } from '../../hooks/useUser'
import { deleteAccount, updateUser } from '../../services/userService'
import { colors } from '../../utils/colorScheme'
import { useContentStyle } from '../../utils/responsive'

const BIO_MAX = 160

export const EditProfileScreen = (): ReactElement => {
  const nav = useNavigation()
  const { user } = useAuth()
  const toast = useToast()
  const { user: profile, loading } = useUser(user?.uid)

  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const contentStyle = useContentStyle()

  const handleDeleteAccount = () => {
    if (!user || deleting) return
    Alert.alert(
      'Delete account?',
      'This permanently removes your profile, posts (unpublished), bookmarks, ' +
        'collections, blocked list, and follow relationships. Direct messages ' +
        'you sent may remain visible to the other participant. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          style: 'destructive',
          onPress: () =>
            Alert.alert(
              'Are you absolutely sure?',
              'Last chance — your account and data are erased immediately.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete account',
                  style: 'destructive',
                  onPress: async () => {
                    setDeleting(true)
                    try {
                      await deleteAccount(user.uid)
                      try {
                        await auth.currentUser?.delete()
                      } catch (authErr: any) {
                        // Firebase requires recent login for delete; surface a clear hint
                        const code = authErr?.code ?? ''
                        if (code === 'auth/requires-recent-login') {
                          toast.show('For security, sign in again then retry deletion.', 'error')
                          return
                        }
                        throw authErr
                      }
                      // AuthListener will catch the null user and bounce to the AuthStack
                    } catch (err: any) {
                      toast.show(err?.message ?? 'Could not delete account.', 'error')
                    } finally {
                      setDeleting(false)
                    }
                  }
                }
              ]
            )
        }
      ]
    )
  }

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
      toast.show('Profile saved', 'success')
      nav.goBack()
    } catch (err: any) {
      toast.show(err?.message ?? 'Could not save. Try again.', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={[styles.header, contentStyle]}>
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
          <ScrollView
            contentContainerStyle={[styles.form, contentStyle]}
            keyboardShouldPersistTaps="handled"
          >
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

            <View style={styles.dangerZone}>
              <Text style={styles.dangerLabel}>Danger zone</Text>
              <Pressable
                onPress={handleDeleteAccount}
                disabled={deleting}
                style={({ pressed }) => [
                  styles.deleteBtn,
                  pressed && { opacity: 0.7 },
                  deleting && { opacity: 0.5 }
                ]}
              >
                {deleting ? (
                  <ActivityIndicator color={colors.accent} size="small" />
                ) : (
                  <Text style={styles.deleteBtnText}>Delete account</Text>
                )}
              </Pressable>
              <Text style={styles.dangerHint}>
                Permanently removes your profile and unpublishes all your poems. Cannot be undone.
              </Text>
            </View>
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
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  dangerZone: {
    marginTop: 48,
    paddingTop: 24,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border
  },
  dangerLabel: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12
  },
  deleteBtn: {
    backgroundColor: colors.surface,
    borderColor: colors.accent,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center'
  },
  deleteBtnText: { color: colors.accent, fontSize: 15, fontWeight: '600' },
  dangerHint: { color: colors.textMuted, fontSize: 12, marginTop: 10, lineHeight: 18 }
})
