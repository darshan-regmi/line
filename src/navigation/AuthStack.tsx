import { createNativeStackNavigator } from '@react-navigation/native-stack'
import React, { ReactElement } from 'react'

import { AuthScreen } from '../screens/auth/LoginScreen'

export type AuthStackParamList = {
  Login: undefined
}

const Stack = createNativeStackNavigator<AuthStackParamList>()

export const AuthStack = (): ReactElement => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={AuthScreen} />
  </Stack.Navigator>
)
