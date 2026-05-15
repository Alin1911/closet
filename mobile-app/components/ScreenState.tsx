import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

export function LoadingState() {
  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color="#3ea6ff" />
    </View>
  );
}

export function ErrorState({
  message,
  onRetry,
  retryLabel = 'Retry',
}: {
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
}) {
  return (
    <View style={styles.center}>
      <Text style={styles.error}>{message}</Text>
      {onRetry ? (
        <Pressable onPress={onRetry} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>{retryLabel}</Text>
        </Pressable>
      ) : null}
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
  retryButton: {
    marginTop: 10,
    borderColor: '#4eb8ff',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  retryButtonText: {
    color: '#cceeff',
    fontWeight: '600',
  },
  empty: {
    color: '#bdbdbd',
  },
});
