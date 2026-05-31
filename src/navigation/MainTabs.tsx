import { Ionicons } from '@expo/vector-icons'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import React, { ReactElement } from 'react'

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

type IoniconsName = React.ComponentProps<typeof Ionicons>['name']

const tabIcon = (outline: IoniconsName, filled: IoniconsName) => {
  const TabIcon = ({ focused, color, size }: { focused: boolean; color: string; size: number }) => (
    <Ionicons name={focused ? filled : outline} size={size} color={color} />
  )
  TabIcon.displayName = `TabIcon(${outline})`
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
      tabBarInactiveTintColor: colors.textSecondary,
      tabBarLabelStyle: { fontSize: 11, fontWeight: '600' }
    }}
  >
    <Tab.Screen
      name="Home"
      component={HomeScreen}
      options={{ tabBarIcon: tabIcon('home-outline', 'home') }}
    />
    <Tab.Screen
      name="Explore"
      component={ExploreScreen}
      options={{ tabBarIcon: tabIcon('compass-outline', 'compass') }}
    />
    <Tab.Screen
      name="Create"
      component={CreatePostScreen}
      options={{ tabBarIcon: tabIcon('add-circle-outline', 'add-circle') }}
    />
    <Tab.Screen
      name="Profile"
      component={ProfileScreen}
      options={{ tabBarIcon: tabIcon('person-outline', 'person') }}
    />
  </Tab.Navigator>
)
