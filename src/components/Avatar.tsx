import React, { ReactElement, useEffect, useState } from 'react'
import { Image, StyleSheet, Text, View } from 'react-native'

import { getAvatarColor, getInitials } from '../utils/avatarHelpers'
import { colors } from '../utils/colorScheme'
import { dicebearUrl } from '../utils/dicebear'

type Props = {
  name: string
  /**
   * When provided, the avatar is rendered as a DiceBear portrait seeded
   * by this uid. Without it, the avatar falls back to initials on a
   * coloured circle.
   */
  uid?: string | null
  avatarIndex?: number | null
  size?: number
}

/**
 * Initials are always rendered as a fallback BEHIND the DiceBear image,
 * so when the image is loading (or fails) the colored circle + initials
 * stay visible. This keeps the avatar grid feeling alive even on slow
 * networks.
 */
export const Avatar = ({ name, uid, avatarIndex, size = 40 }: Props): ReactElement => {
  const bg = getAvatarColor(avatarIndex ?? 0)
  const initials = getInitials(name)

  const [imageOk, setImageOk] = useState(true)

  // Reset error state if uid changes (different person)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setImageOk(true)
  }, [uid])

  const showImage = !!uid && imageOk

  return (
    <View
      style={[
        styles.container,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: bg }
      ]}
    >
      <Text style={[styles.text, { fontSize: size * 0.4 }]}>{initials}</Text>
      {showImage ? (
        <Image
          source={{ uri: dicebearUrl(uid!, size) }}
          style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]}
          onError={() => setImageOk(false)}
        />
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden'
  },
  text: {
    color: colors.background,
    fontWeight: '700'
  },
  image: {
    position: 'absolute',
    top: 0,
    left: 0
  }
})
