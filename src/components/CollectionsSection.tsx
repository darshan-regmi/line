import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import React, { ReactElement } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'

import { useUserCollections } from '../hooks/useUserCollections'
import { MainStackParamList } from '../navigation/MainStack'
import { colors } from '../utils/colorScheme'

import { CollectionCard } from './CollectionCard'

type Nav = NativeStackNavigationProp<MainStackParamList>

type Props = {
  ownerUid: string
  viewerUid: string | null | undefined
}

/**
 * Horizontal collections strip shown on a profile screen.
 * Hides when there's nothing visible to the viewer; renders a "+ New"
 * card when the viewer is the owner.
 */
export const CollectionsSection = ({ ownerUid, viewerUid }: Props): ReactElement | null => {
  const nav = useNavigation<Nav>()
  const { collections, isSelf } = useUserCollections(ownerUid, viewerUid)

  // Hide the whole section when there's nothing to show AND viewer isn't owner
  if (!isSelf && collections.length === 0) return null

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionLabel}>Collections</Text>
        {isSelf ? (
          <Pressable onPress={() => nav.navigate('EditCollection')} hitSlop={6}>
            <Text style={styles.newBtn}>+ New</Text>
          </Pressable>
        ) : null}
      </View>

      {collections.length === 0 ? (
        <Text style={styles.empty}>No collections yet. Tap “+ New” to start one.</Text>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
        >
          {collections.map((c) => (
            <CollectionCard
              key={c.collectionId}
              collection={c}
              onPress={() => nav.navigate('CollectionDetail', { collectionId: c.collectionId })}
            />
          ))}
        </ScrollView>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { marginBottom: 20 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10
  },
  sectionLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  newBtn: { color: colors.primary, fontSize: 13, fontWeight: '600' },
  scroll: { paddingRight: 16 },
  empty: {
    color: colors.textSecondary,
    fontSize: 13,
    paddingVertical: 8
  }
})
