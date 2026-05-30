import { signOut as firebaseSignOut, User } from 'firebase/auth'
import React, { createContext, ReactElement, ReactNode, useContext, useMemo } from 'react'

import { auth } from '../config/firebase'
import { useAuthListener } from '../hooks/useAuthListener'

type AuthContextValue = {
  user: User | null
  initializing: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }): ReactElement => {
  const { user, initializing } = useAuthListener()

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      initializing,
      signOut: () => firebaseSignOut(auth)
    }),
    [user, initializing]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return ctx
}
