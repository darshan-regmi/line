import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import React, { ReactElement, useCallback } from 'react'
import {
  ActivityIndicator,
  FlatList,
  ListRenderItem,
  Pressable,
  StyleSheet,
  Text,
  View
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { NotificationItem } from '../../components/NotificationItem'
import { useAuth } from '../../context/AuthContext'
import { useNotifications } from '../../hooks/useNotifications'
import { MainStackParamList } from '../../navigation/MainStack'
import { markAllNotificationsRead } from '../../services/notificationService'
import { Notification } from '../../types'
import { colors } from '../../utils/colorScheme'
import { useContentStyle } from '../../utils/responsive'

type Nav = NativeStackNavigationProp<MainStackParamList>

export const NotificationsScreen = (): ReactElement => {
  const nav = useNavigation<Nav>()
  const { user } = useAuth()
  const { notifications, loading, unreadCount } = useNotifications()
  const contentStyle = useContentStyle()

  // Mark everything read when the screen comes into focus.
  // Best-effort — failure is silently ignored.
  useFocusEffect(
    useCallback(() => {
      if (!user || unreadCount === 0) return
      const unreadIds = notifications.filter((n) => !n.read).map((n) => n.notificationId)
      void markAllNotificationsRead(user.uid, unreadIds)
    }, [user, unreadCount, notifications])
  )

  const handlePress = useCallback(
    (notification: Notification) => {
      switch (notification.type) {
        case 'like':
        case 'comment':
          if (notification.postId) nav.navigate('PostDetail', { postId: notification.postId })
          break
        case 'follow':
          nav.navigate('UserProfile', { userId: notification.actorUid })
          break
      }
    },
    [nav]
  )

  const renderItem: ListRenderItem<Notification> = useCallback(
    ({ item }) => <NotificationItem notification={item} onPress={() => handlePress(item)} />,
    [handlePress]
  )

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={[styles.header, contentStyle]}>
        <Pressable onPress={() => nav.goBack()} hitSlop={10}>
          <Text style={styles.back}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>Notifications</Text>
        <View style={{ width: 60 }} />
      </View>

      {loading && notifications.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(n) => n.notificationId}
          renderItem={renderItem}
          contentContainerStyle={contentStyle ?? undefined}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>No notifications yet</Text>
              <Text style={styles.emptySub}>
                When someone likes, comments, or follows you, it&apos;ll show up here.
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
  back: { color: colors.primary, fontSize: 16 },
  title: { color: colors.textPrimary, fontSize: 17, fontWeight: '600' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32
  },
  emptyTitle: { color: colors.textPrimary, fontSize: 18, fontWeight: '600', marginBottom: 6 },
  emptySub: { color: colors.textSecondary, fontSize: 14, textAlign: 'center' }
})
