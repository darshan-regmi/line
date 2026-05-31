import React, { memo, ReactElement } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

import { colors } from '../utils/colorScheme'
import { pluralize } from '../utils/formatters'

import { Collection } from '../types'

type Props = {
  collection: Collection
  onPress: () => void
}

const CollectionCardComponent = ({ collection, onPress }: Props): ReactElement => (
  <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}>
    <View style={styles.row}>
      <Text style={styles.title} numberOfLines={1}>
        {collection.title || 'Untitled collection'}
      </Text>
      {!collection.isPublic ? (
        <View style={styles.privateBadge}>
          <Text style={styles.privateBadgeText}>Private</Text>
        </View>
      ) : null}
    </View>
    {collection.description ? (
      <Text style={styles.description} numberOfLines={2}>
        {collection.description}
      </Text>
    ) : null}
    <Text style={styles.count}>{pluralize(collection.postCount, 'poem')}</Text>
  </Pressable>
)

export const CollectionCard = memo(CollectionCardComponent)

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    marginRight: 12,
    width: 220,
    borderWidth: 1,
    borderColor: colors.border
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 4
  },
  title: { color: colors.textPrimary, fontSize: 15, fontWeight: '700', flex: 1 },
  privateBadge: {
    backgroundColor: colors.background,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: colors.border
  },
  privateBadgeText: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5
  },
  description: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2
  },
  count: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 10
  }
})
