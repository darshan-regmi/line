import { createNativeStackNavigator } from '@react-navigation/native-stack'
import React, { ReactElement } from 'react'

import { NotificationsScreen } from '../screens/notifications/NotificationsScreen'
import { PostDetailScreen } from '../screens/post/PostDetailScreen'
import { EditProfileScreen } from '../screens/profile/EditProfileScreen'
import { UserProfileScreen } from '../screens/profile/UserProfileScreen'
import { SavedScreen } from '../screens/saved/SavedScreen'

import { MainTabs } from './MainTabs'

export type MainStackParamList = {
  Tabs: undefined
  PostDetail: { postId: string }
  UserProfile: { userId: string }
  EditProfile: undefined
  Notifications: undefined
  Saved: undefined
}

const Stack = createNativeStackNavigator<MainStackParamList>()

export const MainStack = (): ReactElement => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Tabs" component={MainTabs} />
    <Stack.Screen name="PostDetail" component={PostDetailScreen} />
    <Stack.Screen name="UserProfile" component={UserProfileScreen} />
    <Stack.Screen name="Notifications" component={NotificationsScreen} />
    <Stack.Screen name="Saved" component={SavedScreen} />
    <Stack.Screen
      name="EditProfile"
      component={EditProfileScreen}
      options={{ presentation: 'modal' }}
    />
  </Stack.Navigator>
)
