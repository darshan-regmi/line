import React, { ReactElement } from 'react'
import { StyleSheet, Text, View } from 'react-native'

import { getAvatarColor, getInitials } from '../utils/avatarHelpers'
import { colors } from '../utils/colorScheme'

type Props = {
  name: string
  avatarIndex?: number | null
  size?: number
}

export const Avatar = ({ name, avatarIndex, size = 40 }: Props): ReactElement => {
  const bg = getAvatarColor(avatarIndex ?? 0)
  const initials = getInitials(name)

  return (
    <View
      style={[
        styles.container,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: bg }
      ]}
    >
      <Text style={[styles.text, { fontSize: size * 0.4 }]}>{initials}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  text: {
    color: colors.background,
    fontWeight: '700'
  }
})
