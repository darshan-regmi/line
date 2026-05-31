/* eslint-disable react/no-unescaped-entities */
import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import React, { ReactElement } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { colors } from '../../utils/colorScheme'
import { useContentStyle } from '../../utils/responsive'

export const PrivacyScreen = (): ReactElement => {
  const nav = useNavigation()
  const contentStyle = useContentStyle()

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={[styles.header, contentStyle]}>
        <Pressable onPress={() => nav.goBack()} hitSlop={10} style={styles.iconBtn}>
          <Ionicons name="chevron-back" size={26} color={colors.primary} />
        </Pressable>
        <Text style={styles.title}>Privacy Policy</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.body, contentStyle]}>
        <Text style={styles.effective}>Effective: May 2026</Text>

        <Text style={styles.p}>
          Line is a poetry-focused social app built by Darshan Regmi. This document explains what
          data we collect, how we use it, and the choices you have. It is written in plain English
          deliberately — we'd rather you read it than skim it.
        </Text>

        <Text style={styles.h2}>What we collect</Text>
        <Text style={styles.p}>
          When you sign up we store: your email address, a display name, a username, and an
          auto-generated avatar seed (your user id). Optionally, a bio. When you use the app, we
          additionally store: the poems you publish, the comments you write, the posts you like, the
          users you follow, the bookmarks you save, the collections you curate, the reports you
          submit, the users you block, and the direct messages you exchange. We also store an Expo
          push token for each device you sign in on, so notifications can reach you.
        </Text>

        <Text style={styles.h2}>How we use it</Text>
        <Text style={styles.p}>
          The data exists to make the app work — to show you your feed, deliver your notifications,
          render your profile to other users, and route messages to the right inbox. We do not sell
          your data. We do not run advertising. We do not share it with third parties for marketing.
        </Text>

        <Text style={styles.h2}>Who else processes your data</Text>
        <Text style={styles.p}>
          Line uses Google Firebase (Authentication, Firestore, Cloud Messaging) as the backend.
          Your data sits in Google's infrastructure, encrypted at rest by Google's standards.
          Google's privacy terms apply to that storage layer.
        </Text>
        <Text style={styles.p}>
          We use DiceBear (dicebear.com) to generate avatar portraits from your user id. Only your
          user id is shared with DiceBear; no email or name.
        </Text>
        <Text style={styles.p}>
          We use Expo's push notification service (exp.host) to deliver banners to your device. Your
          push token is shared with Expo, plus the notification title and short body when one is
          fired.
        </Text>

        <Text style={styles.h2}>Direct messages: not end-to-end encrypted</Text>
        <Text style={styles.p}>
          Messages you send via Line are stored in Firestore in plaintext. This matches the privacy
          posture of most mainstream social apps (Instagram, Twitter DMs) but is different from
          purpose-built E2EE apps like Signal. In practice: an administrator with access to the
          Firebase project could read message content. If that is unacceptable for your use case,
          please don't use Line's DMs for sensitive material.
        </Text>

        <Text style={styles.h2}>Children</Text>
        <Text style={styles.p}>
          Line is not directed at children under 13. If you are under 13, please don't use the app.
        </Text>

        <Text style={styles.h2}>Your rights</Text>
        <Text style={styles.p}>
          You can edit your display name and bio at any time from Profile → Edit profile. You can
          delete your account at any time from Profile → Edit profile → Delete account; this removes
          your user record, comments subcollections, bookmarks, blocked list, notifications, and
          follow relationships, and unpublishes your posts. Direct messages may remain visible to
          the other participant after deletion, consistent with standard messaging app behaviour.
        </Text>

        <Text style={styles.h2}>Changes</Text>
        <Text style={styles.p}>
          If this policy changes meaningfully, we'll update the effective date at the top of this
          screen.
        </Text>

        <Text style={styles.h2}>Contact</Text>
        <Text style={styles.p}>
          Reach out at regmidarshan545@gmail.com for any privacy question.
        </Text>
      </ScrollView>
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
  body: { padding: 20, paddingBottom: 60 },
  effective: { color: colors.textSecondary, fontSize: 12, marginBottom: 16 },
  h2: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: '700',
    marginTop: 24,
    marginBottom: 8
  },
  p: { color: colors.textPrimary, fontSize: 15, lineHeight: 24, marginBottom: 8 }
})
