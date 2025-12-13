import React, { ReactElement } from 'react'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import { AuthScreen } from 'src/screens/auth/LoginScreen'

const App = (): ReactElement => {
  return (
    <SafeAreaProvider>
      <AuthScreen />
    </SafeAreaProvider>
  )
}

export default App
