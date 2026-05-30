import { DarkTheme, NavigationContainer } from '@react-navigation/native'
import React, { ReactElement } from 'react'
import { ActivityIndicator, StyleSheet, View } from 'react-native'

import { useAuth } from '../context/AuthContext'
import { colors } from '../utils/colorScheme'

import { AuthStack } from './AuthStack'
import { MainStack } from './MainStack'

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

  if (initializing) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator color={colors.primary} />
      </View>
    )
  }

  return (
    <NavigationContainer theme={navTheme}>
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
