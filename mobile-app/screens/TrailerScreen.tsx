import { RouteProp, useRoute } from '@react-navigation/native';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { RootStackParamList } from '../navigation/AppNavigator';

export default function TrailerScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'Trailer'>>();
  const { ytTrailerId } = route.params;

  return (
    <View style={styles.container}>
      <WebView source={{ uri: `https://www.youtube.com/embed/${ytTrailerId}` }} allowsFullscreenVideo />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
