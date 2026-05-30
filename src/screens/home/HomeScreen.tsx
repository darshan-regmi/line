import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import React, { ReactElement, useCallback } from 'react'
import {
  ActivityIndicator,
  FlatList,
  ListRenderItem,
  RefreshControl,
  StyleSheet,
  Text,
  View
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { PostCard } from '../../components/PostCard'
import { useFeed } from '../../hooks/useFeed'
import { MainStackParamList } from '../../navigation/MainStack'
import { Post } from '../../types'
import { colors } from '../../utils/colorScheme'

type Nav = NativeStackNavigationProp<MainStackParamList>

export const HomeScreen = (): ReactElement => {
  const nav = useNavigation<Nav>()
  const { posts, loading, refreshing, hasMore, error, refresh, loadMore, replacePost } = useFeed()

  const renderItem: ListRenderItem<Post> = useCallback(
    ({ item }) => (
      <PostCard
        post={item}
        onPress={() => nav.navigate('PostDetail', { postId: item.postId })}
        onLikeToggled={replacePost}
      />
    ),
    [nav, replacePost]
  )

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.heading}>Line</Text>
      </View>

      {loading && posts.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.postId}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          onEndReached={loadMore}
          onEndReachedThreshold={0.4}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>No poems yet</Text>
              <Text style={styles.emptySub}>
                {error ?? 'Tap the + tab to share the first verse.'}
              </Text>
            </View>
          }
          ListFooterComponent={
            hasMore && posts.length > 0 ? (
              <View style={styles.footer}>
                <ActivityIndicator color={colors.textSecondary} />
              </View>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border
  },
  heading: { color: colors.textPrimary, fontSize: 26, fontWeight: '700' },
  list: { padding: 16, paddingBottom: 32 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32
  },
  emptyTitle: { color: colors.textPrimary, fontSize: 18, fontWeight: '600', marginBottom: 6 },
  emptySub: { color: colors.textSecondary, fontSize: 14, textAlign: 'center' },
  footer: { paddingVertical: 16 }
})
