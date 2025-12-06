import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './context/AuthContext';
import AppNavigator from './navigation/AppNavigator';
import config from './config';

export default function App() {

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="auto" backgroundColor={config.colors.background} />
        <AppNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
