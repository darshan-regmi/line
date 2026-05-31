import React, { ReactElement, useState } from 'react'
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native'

import { useAuth } from '../context/AuthContext'
import { useBookmarkIds } from '../hooks/useBookmarkIds'
import { addBookmark, removeBookmark } from '../services/bookmarkService'
import { colors } from '../utils/colorScheme'

type Props = {
  postId: string
  size?: number
}

export const BookmarkButton = ({ postId, size = 20 }: Props): ReactElement | null => {
  const { user } = useAuth()
  const { idSet, loading } = useBookmarkIds()
  const [busy, setBusy] = useState(false)

  if (!user) return null

  const bookmarked = idSet.has(postId)

  const handlePress = async () => {
    if (busy) return
    setBusy(true)
    try {
      if (bookmarked) {
        await removeBookmark(user.uid, postId)
      } else {
        await addBookmark(user.uid, postId)
      }
      // Listener will update idSet shortly; no local optimistic state needed.
    } catch {
      // best-effort
    } finally {
      setBusy(false)
    }
  }

  return (
    <Pressable
      onPress={handlePress}
      disabled={loading || busy}
      hitSlop={8}
      style={({ pressed }) => [styles.btn, pressed && { opacity: 0.6 }]}
    >
      {busy ? (
        <ActivityIndicator color={colors.textSecondary} size="small" />
      ) : (
        <Text
          style={[
            styles.icon,
            { fontSize: size, color: bookmarked ? colors.secondary : colors.textSecondary }
          ]}
        >
          {bookmarked ? '★' : '☆'}
        </Text>
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  btn: { alignItems: 'center', justifyContent: 'center', minWidth: 28, minHeight: 28 },
  icon: { lineHeight: 22 }
})
