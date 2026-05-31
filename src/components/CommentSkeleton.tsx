import React, { ReactElement } from 'react'
import { StyleSheet, View } from 'react-native'

import { Skeleton } from './Skeleton'

export const CommentSkeleton = (): ReactElement => (
  <View style={styles.row}>
    <Skeleton width={32} height={32} radius={16} />
    <View style={styles.body}>
      <Skeleton width={120} height={12} />
      <Skeleton width="90%" height={12} style={{ marginTop: 8 }} />
      <Skeleton width="60%" height={12} style={{ marginTop: 6 }} />
    </View>
  </View>
)

const styles = StyleSheet.create({
  row: { flexDirection: 'row', paddingVertical: 12, gap: 12 },
  body: { flex: 1 }
})
