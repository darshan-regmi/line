import React, { ReactElement, ReactNode } from 'react'
import { Pressable, StyleProp, StyleSheet, ViewStyle } from 'react-native'

type Props = {
  onPress: () => void
  children: ReactNode
  disabled?: boolean
  style?: StyleProp<ViewStyle>
}

export const AnimatedButton = ({ onPress, children, disabled, style }: Props): ReactElement => (
  <Pressable
    onPress={onPress}
    disabled={disabled}
    style={({ pressed }) => [
      styles.base,
      style,
      pressed && !disabled ? styles.pressed : null,
      disabled ? styles.disabled : null
    ]}
  >
    {children}
  </Pressable>
)

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center'
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }]
  },
  disabled: {
    opacity: 0.4
  }
})
