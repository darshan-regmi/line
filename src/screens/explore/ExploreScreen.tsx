import React, { ReactElement } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { colors } from '../../utils/colorScheme'

export const ExploreScreen = (): ReactElement => {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Explore</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.placeholder}>Trending poems & search.</Text>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border
  },
  title: { color: colors.textPrimary, fontSize: 24, fontWeight: '700' },
  content: { padding: 24 },
  placeholder: { color: colors.textSecondary, fontSize: 16 }
})
