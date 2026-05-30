import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import React, { ReactElement } from 'react'
import { Text } from 'react-native'

import { CreatePostScreen } from '../screens/create/CreatePostScreen'
import { ExploreScreen } from '../screens/explore/ExploreScreen'
import { HomeScreen } from '../screens/home/HomeScreen'
import { ProfileScreen } from '../screens/profile/ProfileScreen'
import { colors } from '../utils/colorScheme'

export type MainTabsParamList = {
  Home: undefined
  Explore: undefined
  Create: undefined
  Profile: undefined
}

const Tab = createBottomTabNavigator<MainTabsParamList>()

const tabIcon = (label: string) => {
  const TabIcon = () => <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{label}</Text>
  TabIcon.displayName = `TabIcon(${label})`
  return TabIcon
}

export const MainTabs = (): ReactElement => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarStyle: {
        backgroundColor: colors.surface,
        borderTopColor: colors.border
      },
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.textSecondary
    }}
  >
    <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarIcon: tabIcon('●') }} />
    <Tab.Screen name="Explore" component={ExploreScreen} options={{ tabBarIcon: tabIcon('◎') }} />
    <Tab.Screen name="Create" component={CreatePostScreen} options={{ tabBarIcon: tabIcon('+') }} />
    <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarIcon: tabIcon('◐') }} />
  </Tab.Navigator>
)
