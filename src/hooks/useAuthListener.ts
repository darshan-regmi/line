import { onAuthStateChanged, User } from 'firebase/auth'
import { useEffect, useState } from 'react'

import { auth } from '../config/firebase'
import { ensureUserDoc } from '../services/userService'

export type AuthState = {
  user: User | null
  initializing: boolean
}

export const useAuthListener = (): AuthState => {
  const [user, setUser] = useState<User | null>(null)
  const [initializing, setInitializing] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      if (nextUser) {
        try {
          await ensureUserDoc(nextUser)
        } catch {
          // Non-fatal: profile doc will be re-attempted on next sign-in
        }
      }
      setUser(nextUser)
      setInitializing(false)
    })

    return unsubscribe
  }, [])

  return { user, initializing }
}
