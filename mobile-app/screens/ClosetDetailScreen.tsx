import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useMemo } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { EmptyState } from '../components/ScreenState';
import { useCloset } from '../context/ClosetContext';
import { RootStackParamList } from '../navigation/AppNavigator';

const trailerIdFromLink = (link?: string) => (link ? link.slice(-11) : undefined);

export default function ClosetDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<RootStackParamList, 'ClosetDetail'>>();
  const { closetId } = route.params;
  const { closets, authUser, toggleSaved, trackViewed } = useCloset();

  const closet = useMemo(() => closets.find((item) => item.id === closetId), [closetId, closets]);

  useEffect(() => {
    trackViewed(closetId);
  }, [closetId, trackViewed]);

  if (!closet) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <EmptyState message="Closet not found." />
      </ScrollView>
    );
  }

  const trailerId = trailerIdFromLink(closet.trailerLink);
  const related = closets.filter((item) => item.id !== closet.id && item.style && item.style === closet.style).slice(0, 3);
  const isSaved = authUser?.favoriteClosetIds?.includes(closet.id);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {closet.poster ? <Image source={{ uri: closet.poster }} style={styles.poster} /> : null}
      <Text style={styles.heading}>{closet.name || 'Closet'}</Text>
      <Text style={styles.description}>{closet.description || 'No description yet.'}</Text>
      <View style={styles.tags}>
        {[closet.style, closet.season, closet.color].filter(Boolean).map((tag) => (
          <View key={tag} style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
      </View>

      <View style={styles.row}>
        <ActionButton label="View items" onPress={() => navigation.navigate('Coats', { closetId: closet.id })} />
        {trailerId ? <ActionButton label="Watch lookbook" onPress={() => navigation.navigate('Trailer', { ytTrailerId: trailerId })} /> : null}
        <ActionButton label={isSaved ? 'Saved' : 'Save'} onPress={() => toggleSaved(closet.id)} disabled={!authUser} />
      </View>

      <Text style={styles.relatedHeading}>Related closets</Text>
      {!related.length ? <EmptyState message="No related closets available." /> : null}
      {related.map((item) => (
        <Pressable key={item.id} onPress={() => navigation.push('ClosetDetail', { closetId: item.id })} style={styles.relatedCard}>
          <Text style={styles.relatedText}>{item.name || 'Closet'}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

function ActionButton({ label, onPress, disabled }: { label: string; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable onPress={onPress} disabled={disabled} style={[styles.button, disabled ? { opacity: 0.4 } : null]}>
      <Text style={styles.buttonText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { padding: 12, gap: 8 },
  poster: { width: '100%', height: 260, borderRadius: 10 },
  heading: { color: 'white', fontSize: 24, fontWeight: '700' },
  description: { color: '#dfdfdf' },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { backgroundColor: '#313131', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 },
  tagText: { color: '#ddd' },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  button: { borderWidth: 1, borderColor: '#4eb8ff', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 7 },
  buttonText: { color: '#c9ebff' },
  relatedHeading: { color: 'white', fontSize: 20, marginTop: 10 },
  relatedCard: { backgroundColor: '#1f1f1f', borderRadius: 8, padding: 10 },
  relatedText: { color: '#fff' },
});
