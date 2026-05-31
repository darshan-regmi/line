import * as Device from 'expo-device'
import * as Notifications from 'expo-notifications'
import { arrayRemove, arrayUnion, doc, updateDoc } from 'firebase/firestore'
import { Platform } from 'react-native'

import { db } from '../config/firebase'

import { getUser } from './userService'

/**
 * Push notifications via Expo's HTTP push API. Free on the Firebase Spark
 * plan (no Cloud Functions required). The actor's client triggers the push
 * directly to the recipient's Expo push tokens, fetched from the recipient's
 * user doc.
 *
 * Caveats:
 * - iOS push requires a development build (Expo Go does not support it).
 * - Android push works in Expo Go via Expo's default FCM credentials.
 * - Tokens can be sniffed from a user doc by anyone signed-in (rules allow
 *   user-doc reads). For an MVP this is acceptable; production hardening
 *   would move sends behind a server.
 *
 * Reference: https://docs.expo.dev/push-notifications/sending-notifications
 */

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send'

export type PushData = {
  type: 'like' | 'comment' | 'follow' | 'dm'
  postId?: string
  commentId?: string
  actorUid?: string
  threadOtherUid?: string
}

// Configure how notifications behave when received with the app open
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false
  })
})

/**
 * Asks the user for permission and returns their Expo push token, or null
 * if denied / running on a simulator / unsupported environment.
 */
export const registerForPushAsync = async (): Promise<string | null> => {
  if (!Device.isDevice) return null

  // Android requires a channel before notifications fire
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#00D9FF'
    })
  }

  const { status: existing } = await Notifications.getPermissionsAsync()
  let status = existing
  if (existing !== 'granted') {
    const { status: requested } = await Notifications.requestPermissionsAsync()
    status = requested
  }
  if (status !== 'granted') return null

  try {
    const tokenResponse = await Notifications.getExpoPushTokenAsync()
    return tokenResponse.data ?? null
  } catch {
    return null
  }
}

/** Adds a token to the user's `expoPushTokens` array (arrayUnion dedupes). */
export const savePushToken = async (uid: string, token: string): Promise<void> => {
  try {
    await updateDoc(doc(db, 'users', uid), {
      expoPushTokens: arrayUnion(token)
    })
  } catch {
    /* best-effort */
  }
}

/** Removes a token (called on explicit sign-out, etc.) */
export const removePushToken = async (uid: string, token: string): Promise<void> => {
  try {
    await updateDoc(doc(db, 'users', uid), {
      expoPushTokens: arrayRemove(token)
    })
  } catch {
    /* best-effort */
  }
}

/**
 * Fires a push to one or more Expo tokens via Expo's HTTPS API.
 * Silent on failure — push is fire-and-forget.
 */
export const sendPushToTokens = async (
  tokens: string[],
  title: string,
  body: string,
  data: PushData
): Promise<void> => {
  const valid = tokens.filter((t) => t && t.startsWith('ExponentPushToken'))
  if (valid.length === 0) return

  try {
    await fetch(EXPO_PUSH_URL, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-Encoding': 'gzip, deflate',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(
        valid.map((to) => ({
          to,
          title,
          body,
          data,
          sound: 'default'
        }))
      )
    })
  } catch {
    /* best-effort; push failures never block the underlying action */
  }
}

/**
 * Convenience: fetch the recipient's tokens from their user doc, then push.
 * Caller is whichever service writes the corresponding in-app notification.
 */
export const sendPushToUser = async (
  recipientUid: string,
  title: string,
  body: string,
  data: PushData
): Promise<void> => {
  const profile = await getUser(recipientUid)
  if (!profile) return
  const tokens = profile.expoPushTokens ?? []
  if (tokens.length === 0) return
  await sendPushToTokens(tokens, title, body, data)
}
