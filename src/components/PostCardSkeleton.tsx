import React, { ReactElement } from 'react'
import { StyleSheet, View } from 'react-native'

import { colors } from '../utils/colorScheme'

import { Skeleton } from './Skeleton'

/**
 * Content-shaped placeholder mirroring the real PostCard so the loading
 * state doesn't reflow when posts arrive.
 */
export const PostCardSkeleton = (): ReactElement => (
  <View style={styles.card}>
    <View style={styles.header}>
      <Skeleton width={36} height={36} radius={18} />
      <View style={styles.headerText}>
        <Skeleton width={140} height={13} />
        <Skeleton width={90} height={11} style={{ marginTop: 6 }} />
      </View>
    </View>
    <Skeleton width="55%" height={20} style={{ marginTop: 12 }} />
    <Skeleton width="100%" height={14} style={{ marginTop: 10 }} />
    <Skeleton width="92%" height={14} style={{ marginTop: 6 }} />
    <Skeleton width="40%" height={14} style={{ marginTop: 6 }} />
    <View style={styles.actions}>
      <Skeleton width={60} height={14} />
      <Skeleton width={40} height={14} />
    </View>
  </View>
)

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12
  },
  header: { flexDirection: 'row', alignItems: 'center' },
  headerText: { marginLeft: 12, flex: 1 },
  actions: { flexDirection: 'row', gap: 20, marginTop: 14 }
})
