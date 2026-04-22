import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

export function LoadingState() {
  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color="#3ea6ff" />
    </View>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <View style={styles.center}>
      <Text style={styles.error}>{message}</Text>
    </View>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <View style={styles.center}>
      <Text style={styles.empty}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  error: {
    color: '#ff6f6f',
  },
  empty: {
    color: '#bdbdbd',
  },
});
