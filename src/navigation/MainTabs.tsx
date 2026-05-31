import { Ionicons } from '@expo/vector-icons'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import React, { ReactElement } from 'react'
import { StyleSheet } from 'react-native'

import { CreatePostScreen } from '../screens/create/CreatePostScreen'
import { ExploreScreen } from '../screens/explore/ExploreScreen'
import { HomeScreen } from '../screens/home/HomeScreen'
import { ProfileScreen } from '../screens/profile/ProfileScreen'
import { colors } from '../utils/colorScheme'
import { useBreakpoint } from '../utils/responsive'

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

const SIDEBAR_WIDTH = 220

export const MainTabs = (): ReactElement => {
  // On desktop (>= 1024) the bottom-tab navigator flips to a left sidebar.
  // React Navigation handles content offset automatically — the screen
  // content area shrinks by the sidebar's width.
  const { isDesktop } = useBreakpoint()

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarPosition: isDesktop ? 'left' : 'bottom',
        tabBarLabelPosition: isDesktop ? 'beside-icon' : 'below-icon',
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: isDesktop
          ? {
              backgroundColor: colors.surface,
              borderRightWidth: StyleSheet.hairlineWidth,
              borderRightColor: colors.border,
              borderTopWidth: 0,
              width: SIDEBAR_WIDTH,
              paddingTop: 24
            }
          : {
              backgroundColor: colors.surface,
              borderTopWidth: StyleSheet.hairlineWidth,
              borderTopColor: colors.border
            },
        tabBarItemStyle: isDesktop
          ? {
              justifyContent: 'flex-start',
              paddingHorizontal: 20,
              paddingVertical: 12,
              marginVertical: 2
            }
          : undefined,
        tabBarLabelStyle: isDesktop
          ? { fontSize: 14, fontWeight: '600', marginLeft: 16 }
          : { fontSize: 11, fontWeight: '600' }
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
}
