import * as WebBrowser from 'expo-web-browser'
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithCredential,
  signInWithEmailAndPassword,
  updateProfile
} from 'firebase/auth'
import React, { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native'

import { auth } from '../../config/firebase'
import { setPendingSignup } from '../../services/userService'
import { colors } from '../../utils/colorScheme'
import * as Google from 'expo-auth-session/providers/google'

WebBrowser.maybeCompleteAuthSession()

export const AuthScreen = () => {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [username, setUsername] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [flipAnim] = useState(new Animated.Value(0))

  const [, googleResponse, promptGoogle] = Google.useAuthRequest({
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID
  })

  useEffect(() => {
    if (googleResponse?.type !== 'success') return
    const idToken = googleResponse.authentication?.idToken
    if (!idToken) return

    const credential = GoogleAuthProvider.credential(idToken)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSubmitting(true)
    signInWithCredential(auth, credential)
      .catch((err) => {
        setError(err?.message?.replace('Firebase: ', '') ?? 'Google sign-in failed.')
      })
      .finally(() => setSubmitting(false))
  }, [googleResponse])

  const flipCard = () => {
    const toValue = isLogin ? 1 : 0

    Animated.timing(flipAnim, {
      toValue,
      duration: 600,
      useNativeDriver: true,
      easing: Easing.bezier(0.25, 0.46, 0.45, 0.94)
    }).start()

    setIsLogin(!isLogin)
    setError(null)
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setDisplayName('')
    setUsername('')
  }

  const handleEmailAuth = async () => {
    if (!email || !password) {
      setError('Email and password are required.')
      return
    }

    if (!isLogin) {
      if (!displayName || !username) {
        setError('Display name and username are required.')
        return
      }

      if (password !== confirmPassword) {
        setError('Passwords do not match.')
        return
      }

      if (password.length < 6) {
        setError('Password must be at least 6 characters.')
        return
      }

      if (username.length < 3) {
        setError('Username must be at least 3 characters.')
        return
      }
    }

    setSubmitting(true)
    setError(null)

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email.trim(), password)
      } else {
        // Hand the user-typed values to ensureUserDoc (called from useAuthListener)
        setPendingSignup({
          username: username.trim().toLowerCase(),
          displayName: displayName.trim()
        })

        const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password)

        await updateProfile(userCredential.user, {
          displayName: displayName.trim()
        })
      }
    } catch (err: any) {
      const errorMsg = err?.message?.replace('Firebase: ', '') || 'Authentication failed.'
      setError(errorMsg)
    } finally {
      setSubmitting(false)
    }
  }

  const handleGoogleAuth = async () => {
    setError(null)
    try {
      await promptGoogle()
    } catch (err: any) {
      setError(err?.message ?? 'Google sign-in failed.')
    }
  }

  const frontRotateY = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg']
  })

  const backRotateY = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['-180deg', '0deg']
  })

  const frontOpacity = flipAnim.interpolate({
    inputRange: [0, 0.5, 0.5, 1],
    outputRange: [1, 1, 0, 0]
  })

  const backOpacity = flipAnim.interpolate({
    inputRange: [0, 0.5, 0.5, 1],
    outputRange: [0, 0, 1, 1]
  })

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={styles.cardContainer}>
          <Animated.View
            style={[
              styles.card,
              {
                transform: [{ perspective: 1000 }, { rotateY: frontRotateY }],
                opacity: frontOpacity
              }
            ]}
            pointerEvents={isLogin ? 'auto' : 'none'}
          >
            <Text style={styles.title}>Line</Text>
            <Text style={styles.subtitle}>Welcome back</Text>

            {error && isLogin ? <Text style={styles.error}>{error}</Text> : null}

            <TextInput
              style={[styles.input, { borderColor: email ? colors.primary : colors.border }]}
              placeholder="Email"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              editable={!submitting}
              autoComplete="email"
            />

            <TextInput
              style={[styles.input, { borderColor: password ? colors.primary : colors.border }]}
              placeholder="Password"
              placeholderTextColor={colors.textMuted}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              editable={!submitting}
              autoComplete="password"
            />

            <Pressable
              style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
              onPress={handleEmailAuth}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color={colors.background} size="small" />
              ) : (
                <Text style={styles.buttonText}>Log in</Text>
              )}
            </Pressable>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            <Pressable
              style={({ pressed }) => [styles.googleButton, pressed && styles.googleButtonPressed]}
              onPress={handleGoogleAuth}
              disabled={submitting}
            >
              <Text style={styles.googleButtonText}>Continue with Google</Text>
            </Pressable>

            <Pressable onPress={flipCard} style={styles.switchButton} disabled={submitting}>
              <Text style={styles.switchText}>
                Don&apos;t have an account? <Text style={styles.switchTextBold}>Sign up</Text>
              </Text>
            </Pressable>
          </Animated.View>

          <Animated.View
            style={[
              styles.card,
              styles.cardBack,
              {
                transform: [{ perspective: 1000 }, { rotateY: backRotateY }],
                opacity: backOpacity
              }
            ]}
            pointerEvents={!isLogin ? 'auto' : 'none'}
          >
            <Text style={styles.title}>Line</Text>
            <Text style={styles.subtitle}>Create account</Text>

            {error && !isLogin ? <Text style={styles.error}>{error}</Text> : null}

            <TextInput
              style={[styles.input, { borderColor: displayName ? colors.primary : colors.border }]}
              placeholder="Display Name"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="words"
              value={displayName}
              onChangeText={setDisplayName}
              editable={!submitting}
            />

            <TextInput
              style={[styles.input, { borderColor: username ? colors.primary : colors.border }]}
              placeholder="Username"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="none"
              value={username}
              onChangeText={setUsername}
              editable={!submitting}
            />

            <TextInput
              style={[styles.input, { borderColor: email ? colors.primary : colors.border }]}
              placeholder="Email"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              editable={!submitting}
              autoComplete="email"
            />

            <TextInput
              style={[styles.input, { borderColor: password ? colors.primary : colors.border }]}
              placeholder="Password"
              placeholderTextColor={colors.textMuted}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              editable={!submitting}
              autoComplete="password"
            />

            <TextInput
              style={[
                styles.input,
                { borderColor: confirmPassword ? colors.primary : colors.border }
              ]}
              placeholder="Confirm Password"
              placeholderTextColor={colors.textMuted}
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              editable={!submitting}
            />

            <Pressable
              style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
              onPress={handleEmailAuth}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color={colors.background} size="small" />
              ) : (
                <Text style={styles.buttonText}>Sign up</Text>
              )}
            </Pressable>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            <Pressable
              style={({ pressed }) => [styles.googleButton, pressed && styles.googleButtonPressed]}
              onPress={handleGoogleAuth}
              disabled={submitting}
            >
              <Text style={styles.googleButtonText}>Continue with Google</Text>
            </Pressable>

            <Pressable onPress={flipCard} style={styles.switchButton} disabled={submitting}>
              <Text style={styles.switchText}>
                Already have an account? <Text style={styles.switchTextBold}>Log in</Text>
              </Text>
            </Pressable>
          </Animated.View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    paddingVertical: 40
  },
  cardContainer: {
    position: 'relative',
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    minHeight: 520
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 32,
    backfaceVisibility: 'hidden'
  },
  cardBack: {
    position: 'absolute',
    width: '100%',
    top: 0
  },
  title: {
    fontSize: 36,
    color: colors.textPrimary,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center'
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 32,
    textAlign: 'center'
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: colors.textPrimary,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    fontSize: 16
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
    minHeight: 48
  },
  buttonPressed: {
    backgroundColor: colors.primaryPressed,
    transform: [{ scale: 0.98 }]
  },
  buttonText: {
    color: colors.background,
    fontWeight: '600',
    fontSize: 16
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border
  },
  dividerText: {
    color: colors.textMuted,
    marginHorizontal: 12,
    fontSize: 14
  },
  googleButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    minHeight: 48
  },
  googleButtonPressed: {
    backgroundColor: '#F0F0F0',
    transform: [{ scale: 0.98 }]
  },
  googleButtonText: {
    color: colors.background,
    fontWeight: '600',
    fontSize: 16
  },
  switchButton: {
    marginTop: 24,
    alignItems: 'center',
    paddingVertical: 8
  },
  switchText: {
    color: colors.textSecondary,
    fontSize: 14
  },
  switchTextBold: {
    color: colors.primary,
    fontWeight: '600'
  },
  error: {
    color: colors.accent,
    marginBottom: 12,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500'
  }
})
