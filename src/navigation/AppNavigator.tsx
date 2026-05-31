import {
  createNavigationContainerRef,
  DarkTheme,
  NavigationContainer
} from '@react-navigation/native'
import React, { ReactElement, useCallback } from 'react'
import { ActivityIndicator, StyleSheet, View } from 'react-native'

import { useAuth } from '../context/AuthContext'
import { NavigateTarget, usePushRegistration } from '../hooks/usePushRegistration'
import { colors } from '../utils/colorScheme'

import { AuthStack } from './AuthStack'
import { MainStack, MainStackParamList } from './MainStack'

const navigationRef = createNavigationContainerRef<MainStackParamList>()

const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.background,
    card: colors.surface,
    border: colors.border,
    primary: colors.primary,
    text: colors.textPrimary
  }
}

export const AppNavigator = (): ReactElement => {
  const { user, initializing } = useAuth()

  // Push tap handler. Stable across re-renders so the listener inside
  // usePushRegistration doesn't churn.
  const handlePushNav = useCallback((target: NavigateTarget) => {
    if (!navigationRef.isReady()) return
    switch (target.screen) {
      case 'PostDetail':
        navigationRef.navigate('PostDetail', { postId: target.postId })
        break
      case 'UserProfile':
        navigationRef.navigate('UserProfile', { userId: target.userId })
        break
      case 'ThreadDetail':
        navigationRef.navigate('ThreadDetail', { otherUid: target.otherUid })
        break
    }
  }, [])

  // Registers the device's Expo push token to the signed-in user's doc
  // and wires the tap-to-navigate handler. Runs across the whole app.
  usePushRegistration(handlePushNav)

  if (initializing) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator color={colors.primary} />
      </View>
    )
  }

  return (
    <NavigationContainer ref={navigationRef} theme={navTheme}>
      {user ? <MainStack /> : <AuthStack />}
    </NavigationContainer>
  )
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center'
  }
})
