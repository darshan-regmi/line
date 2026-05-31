import { BottomTabBarProps } from '@react-navigation/bottom-tabs'
import { CommonActions } from '@react-navigation/native'
import React, { ReactElement } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'

import { colors } from '../utils/colorScheme'

const SIDEBAR_WIDTH = 72
const ICON_SIZE = 26

/**
 * Custom left-rail sidebar used only at desktop breakpoints. RN Nav v7's
 * built-in `tabBarPosition: 'left'` enforces an internal minWidth around
 * 280px and arranges items in ways that don't survive a 72px column, so
 * we render our own bar against the BottomTabBar contract instead.
 */
export const DesktopSidebar = ({
  state,
  descriptors,
  navigation
}: BottomTabBarProps): ReactElement => {
  return (
    <View style={styles.container}>
      {state.routes.map((route, index) => {
        const focused = index === state.index
        const { options } = descriptors[route.key]!
        const Icon = options.tabBarIcon

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true
          })
          if (!focused && !event.defaultPrevented) {
            navigation.dispatch({
              ...CommonActions.navigate({ name: route.name, params: route.params }),
              target: state.key
            })
          }
        }

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            accessibilityRole="tab"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={options.tabBarAccessibilityLabel ?? route.name}
            style={({ pressed }) => [
              styles.item,
              pressed && styles.itemPressed,
              focused && styles.itemActive
            ]}
          >
            {Icon
              ? Icon({
                  focused,
                  color: focused ? colors.primary : colors.textSecondary,
                  size: ICON_SIZE
                })
              : null}
          </Pressable>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: SIDEBAR_WIDTH,
    backgroundColor: colors.surface,
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: colors.border,
    paddingVertical: 24,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14
  },
  item: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  itemPressed: {
    opacity: 0.6
  },
  itemActive: {
    backgroundColor: colors.background
  }
})
