import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import React, { ReactElement, useCallback } from 'react'
import { FlatList, ListRenderItem, Pressable, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { ThreadCard } from '../../components/ThreadCard'
import { useAuth } from '../../context/AuthContext'
import { useThreads } from '../../hooks/useThreads'
import { MainStackParamList } from '../../navigation/MainStack'
import { Thread } from '../../types'
import { colors } from '../../utils/colorScheme'
import { useContentStyle } from '../../utils/responsive'

type Nav = NativeStackNavigationProp<MainStackParamList>

export const ThreadsScreen = (): ReactElement => {
  const nav = useNavigation<Nav>()
  const { user } = useAuth()
  const { threads, loading } = useThreads()
  const contentStyle = useContentStyle()

  const renderItem: ListRenderItem<Thread> = useCallback(
    ({ item }) => {
      const otherUid = item.participantIds.find((p) => p !== user?.uid)
      if (!otherUid) return null
      return <ThreadCard thread={item} onPress={() => nav.navigate('ThreadDetail', { otherUid })} />
    },
    [nav, user?.uid]
  )

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={[styles.header, contentStyle]}>
        <Pressable onPress={() => nav.goBack()} hitSlop={10} style={styles.iconBtn}>
          <Ionicons name="chevron-back" size={26} color={colors.primary} />
        </Pressable>
        <Text style={styles.title}>Messages</Text>
        <View style={{ width: 36 }} />
      </View>

      {loading && threads.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.loadingText}>Loading…</Text>
        </View>
      ) : (
        <FlatList
          data={threads}
          keyExtractor={(t) => t.threadId}
          renderItem={renderItem}
          contentContainerStyle={contentStyle ?? undefined}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>No conversations yet</Text>
              <Text style={styles.emptySub}>
                Open another poet&apos;s profile and tap Message to start one.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border
  },
  iconBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  title: { color: colors.textPrimary, fontSize: 17, fontWeight: '600' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: colors.textSecondary, fontSize: 14 },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32
  },
  emptyTitle: { color: colors.textPrimary, fontSize: 18, fontWeight: '600', marginBottom: 6 },
  emptySub: { color: colors.textSecondary, fontSize: 14, textAlign: 'center' }
})
