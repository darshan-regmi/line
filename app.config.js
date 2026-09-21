const fs = require('fs')
const path = require('path')

// EAS Build only uploads git-tracked files, and google-services.json is
// gitignored. Inject it from the GOOGLE_SERVICES_JSON secret (created via
// `eas secret:create`) so prebuild can copy it into the Android project.
const raw = process.env.GOOGLE_SERVICES_JSON
if (raw) {
  fs.writeFileSync(path.join(__dirname, 'google-services.json'), raw)
}

module.exports = {
  expo: {
    name: 'line',
    slug: 'line',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    scheme: 'com.googleusercontent.apps.64050944992-h6dkldbpobrhcqg75suo8714lea4b6db',
    userInterfaceStyle: 'dark',
    newArchEnabled: true,
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#0F0F0F'
    },
    ios: {
      supportsTablet: true
    },
    android: {
      package: 'com.darshan.line',
      googleServicesFile: './google-services.json',
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#0F0F0F'
      },
      predictiveBackGestureEnabled: false
    },
    web: {
      favicon: './assets/favicon.png'
    },
    plugins: [
      'expo-web-browser',
      'expo-status-bar',
      'expo-font',
      [
        'expo-notifications',
        {
          color: '#00D9FF',
          defaultChannel: 'default'
        }
      ]
    ],
    extra: {
      eas: {
        projectId: '98132828-dee3-47e6-8945-dfae4ccd83c5'
      }
    },
    owner: 'darshan_regmi'
  }
}
