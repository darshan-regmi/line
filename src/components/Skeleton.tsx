import React, { ReactElement, useEffect, useState } from 'react'
import { Animated, StyleProp, ViewStyle } from 'react-native'

import { colors } from '../utils/colorScheme'

type Props = {
  width?: number | string
  height: number
  radius?: number
  style?: StyleProp<ViewStyle>
}

/**
 * A pulsing rectangle. Use as the visual primitive for any content-shaped
 * placeholder (PostCardSkeleton, CommentSkeleton, etc.).
 */
export const Skeleton = ({ width = '100%', height, radius = 6, style }: Props): ReactElement => {
  const [opacity] = useState(() => new Animated.Value(0.4))

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.85, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 700, useNativeDriver: true })
      ])
    )
    loop.start()
    return () => loop.stop()
  }, [opacity])

  return (
    <Animated.View
      style={[
        {
          width: width as unknown as number,
          height,
          borderRadius: radius,
          backgroundColor: colors.border,
          opacity
        },
        style
      ]}
    />
  )
}
