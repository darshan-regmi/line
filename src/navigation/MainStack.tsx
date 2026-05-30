import { createNativeStackNavigator } from '@react-navigation/native-stack'
import React, { ReactElement } from 'react'

import { PostDetailScreen } from '../screens/post/PostDetailScreen'
import { EditProfileScreen } from '../screens/profile/EditProfileScreen'

import { MainTabs } from './MainTabs'

export type MainStackParamList = {
  Tabs: undefined
  PostDetail: { postId: string }
  EditProfile: undefined
}

const Stack = createNativeStackNavigator<MainStackParamList>()

export const MainStack = (): ReactElement => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Tabs" component={MainTabs} />
    <Stack.Screen name="PostDetail" component={PostDetailScreen} />
    <Stack.Screen
      name="EditProfile"
      component={EditProfileScreen}
      options={{ presentation: 'modal' }}
    />
  </Stack.Navigator>
)
