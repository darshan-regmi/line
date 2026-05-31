import { createNativeStackNavigator } from '@react-navigation/native-stack'
import React, { ReactElement } from 'react'

import { AuthScreen } from '../screens/auth/LoginScreen'
import { PrivacyScreen } from '../screens/legal/PrivacyScreen'
import { TermsScreen } from '../screens/legal/TermsScreen'

export type AuthStackParamList = {
  Login: undefined
  Privacy: undefined
  Terms: undefined
}

const Stack = createNativeStackNavigator<AuthStackParamList>()

export const AuthStack = (): ReactElement => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={AuthScreen} />
    <Stack.Screen name="Privacy" component={PrivacyScreen} />
    <Stack.Screen name="Terms" component={TermsScreen} />
  </Stack.Navigator>
)
