import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ClosetProvider } from './context/ClosetContext';
import AppNavigator from './navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <ClosetProvider>
        <StatusBar style="light" />
        <AppNavigator />
      </ClosetProvider>
    </SafeAreaProvider>
  );
}
