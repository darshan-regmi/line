import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile
} from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import React, { useState } from 'react'
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

import { auth, db } from '../../config/firebase'

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
        const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password)

        // Update user profile with display name
        await updateProfile(userCredential.user, {
          displayName: displayName.trim()
        })

        // Store user metadata in Firestore
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          uid: userCredential.user.uid,
          username: username.trim(),
          displayName: displayName.trim(),
          email: email.trim(),
          bio: '',
          avatarType: 'initials',
          avatarIndex: Math.floor(Math.random() * 10), // Random avatar seed
          followersCount: 0,
          followingCount: 0,
          createdAt: new Date(),
          updatedAt: new Date()
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
    setSubmitting(true)
    setError(null)

    try {
      const provider = new GoogleAuthProvider()
      await signInWithPopup(auth, provider)
    } catch (err: any) {
      const errorMsg = err?.message?.replace('Firebase: ', '') || 'Google sign-in failed.'
      setError(errorMsg)
    } finally {
      setSubmitting(false)
    }
  }

  // Smooth interpolations for card rotation
  const frontRotateY = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg']
  })

  const backRotateY = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['-180deg', '0deg']
  })

  // Smooth opacity transitions
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
          {/* Login Card (Front) */}
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
            <Text style={styles.title}>Verse</Text>
            <Text style={styles.subtitle}>Welcome back</Text>

            {error && isLogin ? <Text style={styles.error}>{error}</Text> : null}

            <TextInput
              style={[styles.input, { borderColor: email ? '#00D9FF' : '#2A2A2A' }]}
              placeholder="Email"
              placeholderTextColor="#666"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              editable={!submitting}
              autoComplete="email"
            />

            <TextInput
              style={[styles.input, { borderColor: password ? '#00D9FF' : '#2A2A2A' }]}
              placeholder="Password"
              placeholderTextColor="#666"
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
                <ActivityIndicator color="#0F0F0F" size="small" />
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

          {/* Signup Card (Back) */}
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
            <Text style={styles.title}>Verse</Text>
            <Text style={styles.subtitle}>Create account</Text>

            {error && !isLogin ? <Text style={styles.error}>{error}</Text> : null}

            <TextInput
              style={[styles.input, { borderColor: displayName ? '#00D9FF' : '#2A2A2A' }]}
              placeholder="Display Name"
              placeholderTextColor="#666"
              autoCapitalize="words"
              value={displayName}
              onChangeText={setDisplayName}
              editable={!submitting}
            />

            <TextInput
              style={[styles.input, { borderColor: username ? '#00D9FF' : '#2A2A2A' }]}
              placeholder="Username"
              placeholderTextColor="#666"
              autoCapitalize="none"
              value={username}
              onChangeText={setUsername}
              editable={!submitting}
            />

            <TextInput
              style={[styles.input, { borderColor: email ? '#00D9FF' : '#2A2A2A' }]}
              placeholder="Email"
              placeholderTextColor="#666"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              editable={!submitting}
              autoComplete="email"
            />

            <TextInput
              style={[styles.input, { borderColor: password ? '#00D9FF' : '#2A2A2A' }]}
              placeholder="Password"
              placeholderTextColor="#666"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              editable={!submitting}
              autoComplete="password"
            />

            <TextInput
              style={[styles.input, { borderColor: confirmPassword ? '#00D9FF' : '#2A2A2A' }]}
              placeholder="Confirm Password"
              placeholderTextColor="#666"
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
                <ActivityIndicator color="#0F0F0F" size="small" />
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
    backgroundColor: '#0F0F0F'
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
    backgroundColor: '#1A1A1A',
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
    color: '#FFFFFF',
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center'
  },
  subtitle: {
    fontSize: 16,
    color: '#A0A0A0',
    marginBottom: 32,
    textAlign: 'center'
  },
  input: {
    backgroundColor: '#0F0F0F',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#FFFFFF',
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: '#2A2A2A',
    fontSize: 16
  },
  button: {
    backgroundColor: '#00D9FF',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
    minHeight: 48
  },
  buttonPressed: {
    backgroundColor: '#00B8D4',
    transform: [{ scale: 0.98 }]
  },
  buttonText: {
    color: '#0F0F0F',
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
    backgroundColor: '#2A2A2A'
  },
  dividerText: {
    color: '#666',
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
    color: '#0F0F0F',
    fontWeight: '600',
    fontSize: 16
  },
  switchButton: {
    marginTop: 24,
    alignItems: 'center',
    paddingVertical: 8
  },
  switchText: {
    color: '#A0A0A0',
    fontSize: 14
  },
  switchTextBold: {
    color: '#00D9FF',
    fontWeight: '600'
  },
  error: {
    color: '#FF6B9D',
    marginBottom: 12,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500'
  }
})
