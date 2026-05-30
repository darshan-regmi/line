import React, { ReactElement } from 'react'
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native'

import { useFollow } from '../hooks/useFollow'
import { colors } from '../utils/colorScheme'

type Props = {
  targetUid: string
  onChange?: (nowFollowing: boolean) => void
}

export const FollowButton = ({ targetUid, onChange }: Props): ReactElement | null => {
  const { following, loading, busy, isSelf, toggle } = useFollow(targetUid)

  if (isSelf) return null

  const handlePress = async () => {
    const next = !following
    await toggle()
    onChange?.(next)
  }

  return (
    <Pressable
      onPress={handlePress}
      disabled={loading || busy}
      style={({ pressed }) => [
        styles.base,
        following ? styles.following : styles.notFollowing,
        pressed && { opacity: 0.7 },
        (loading || busy) && { opacity: 0.6 }
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={following ? colors.textPrimary : colors.background}
          size="small"
        />
      ) : (
        <Text style={[styles.text, following ? styles.textFollowing : styles.textNotFollowing]}>
          {following ? 'Following' : 'Follow'}
        </Text>
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    minWidth: 110
  },
  notFollowing: {
    backgroundColor: colors.primary
  },
  following: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border
  },
  text: {
    fontSize: 14,
    fontWeight: '700'
  },
  textNotFollowing: {
    color: colors.background
  },
  textFollowing: {
    color: colors.textPrimary
  }
})
