import { Ionicons } from '@expo/vector-icons'
import React, { ReactElement, useState } from 'react'
import { Animated, Pressable, StyleSheet, Text } from 'react-native'

import { colors } from '../utils/colorScheme'

const AnimatedIonicons = Animated.createAnimatedComponent(Ionicons)

type Props = {
  liked: boolean
  count: number
  onPress: () => void
  disabled?: boolean
  size?: number
  showCount?: boolean
}

export const HeartButton = ({
  liked,
  count,
  onPress,
  disabled,
  size = 18,
  showCount = true
}: Props): ReactElement => {
  const [scale] = useState(() => new Animated.Value(1))

  const handlePress = () => {
    if (disabled) return
    Animated.sequence([
      Animated.spring(scale, {
        toValue: 1.4,
        useNativeDriver: true,
        friction: 4,
        tension: 80
      }),
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        friction: 4,
        tension: 60
      })
    ]).start()
    onPress()
  }

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      hitSlop={8}
      style={({ pressed }) => [styles.btn, pressed && { opacity: 0.6 }]}
    >
      <AnimatedIonicons
        name={liked ? 'heart' : 'heart-outline'}
        size={size + 4}
        color={liked ? colors.accent : colors.textSecondary}
        style={{ transform: [{ scale }] }}
      />
      {showCount ? <Text style={[styles.count, liked && styles.countActive]}>{count}</Text> : null}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  count: {
    color: colors.textSecondary,
    fontSize: 13
  },
  countActive: {
    color: colors.accent
  }
})
