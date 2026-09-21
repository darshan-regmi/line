/** @type {import('jest').Config} */
const path = require('path')

const config = {
  preset: 'jest-expo',
  setupFilesAfterEnv: [path.join(__dirname, 'setup-testing.js')],
  transform: {
    '^.+\\.(js|ts|tsx|jsx)$': 'babel-jest',
    '^.+\\.mjs$': 'babel-jest'
  },
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|firebase|@firebase)'
  ],
  moduleDirectories: ['node_modules', '<rootDir>']
}

module.exports = config
