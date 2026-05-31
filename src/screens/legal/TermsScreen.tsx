/* eslint-disable react/no-unescaped-entities */
import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import React, { ReactElement } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { colors } from '../../utils/colorScheme'
import { useContentStyle } from '../../utils/responsive'

export const TermsScreen = (): ReactElement => {
  const nav = useNavigation()
  const contentStyle = useContentStyle()

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={[styles.header, contentStyle]}>
        <Pressable onPress={() => nav.goBack()} hitSlop={10} style={styles.iconBtn}>
          <Ionicons name="chevron-back" size={26} color={colors.primary} />
        </Pressable>
        <Text style={styles.title}>Terms of Service</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.body, contentStyle]}>
        <Text style={styles.effective}>Effective: May 2026</Text>

        <Text style={styles.p}>
          By creating an account or using Line, you agree to these terms. Line is a personal project
          by Darshan Regmi, distributed as an Android APK and as a web app at the operator's
          discretion.
        </Text>

        <Text style={styles.h2}>Who can use Line</Text>
        <Text style={styles.p}>
          You must be at least 13 years old. You agree to provide accurate information when creating
          your account and to keep your password secure. One person, one account — don't impersonate
          others.
        </Text>

        <Text style={styles.h2}>Your content</Text>
        <Text style={styles.p}>
          You own everything you write on Line — your poems, your comments, your messages. By
          posting publicly (poems, comments) you grant Line a non-exclusive license to display that
          content within the app so other users can read it. Nothing more.
        </Text>

        <Text style={styles.h2}>Acceptable use</Text>
        <Text style={styles.p}>
          Don't post or send content that is illegal, harassing, hateful, sexually explicit, or that
          promotes self-harm. Don't post content you don't have the rights to publish (e.g.,
          copyrighted material that isn't yours and isn't fair use). Don't use the app to spam,
          scrape, or target individuals. Reports are reviewed at the operator's discretion; accounts
          that violate these rules may be suspended or removed without prior warning.
        </Text>

        <Text style={styles.h2}>Blocking and reporting</Text>
        <Text style={styles.p}>
          You can block any user from the action menu on their profile, on any of their poems, or on
          a comment they wrote. You can report poems, comments, or accounts via the same menus.
          Reports are private — the person being reported is not notified.
        </Text>

        <Text style={styles.h2}>Account deletion</Text>
        <Text style={styles.p}>
          You can delete your account at any time from Profile → Edit profile → Delete account.
          Deletion is immediate and irreversible: your user record, bookmarks, blocked list,
          notifications, and follow relationships are removed, and your published poems are
          unpublished. Messages you sent may remain visible to the other participant.
        </Text>

        <Text style={styles.h2}>Service availability</Text>
        <Text style={styles.p}>
          Line is provided as-is, without warranties. The service may be unavailable, change, or be
          discontinued at any time. Back up anything you'd be sad to lose. We use Firebase as the
          backend and depend on their uptime.
        </Text>

        <Text style={styles.h2}>Limitation of liability</Text>
        <Text style={styles.p}>
          To the maximum extent permitted by law, Line and Darshan Regmi are not liable for any
          indirect, incidental, or consequential damages arising from your use of the app. Maximum
          total liability is capped at zero dollars (the price you paid for Line).
        </Text>

        <Text style={styles.h2}>Changes</Text>
        <Text style={styles.p}>
          If these terms change meaningfully, the effective date at the top of this screen will
          update. Continued use after a change means you accept the revised terms.
        </Text>

        <Text style={styles.h2}>Contact</Text>
        <Text style={styles.p}>For questions or disputes: regmidarshan545@gmail.com.</Text>
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
