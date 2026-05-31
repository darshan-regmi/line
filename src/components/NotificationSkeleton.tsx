import React, { ReactElement } from 'react'
import { StyleSheet, View } from 'react-native'

import { colors } from '../utils/colorScheme'

import { Skeleton } from './Skeleton'

export const NotificationSkeleton = (): ReactElement => (
  <View style={styles.row}>
    <Skeleton width={40} height={40} radius={20} />
    <View style={styles.body}>
      <Skeleton width="80%" height={13} />
      <Skeleton width={50} height={11} style={{ marginTop: 6 }} />
    </View>
  </View>
)

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border
  },
  body: { flex: 1 }
})
