import React, { ReactElement } from 'react'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import { AuthProvider } from 'src/context/AuthContext'
import { AppNavigator } from 'src/navigation/AppNavigator'

const App = (): ReactElement => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <AppNavigator />
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}

export default App
