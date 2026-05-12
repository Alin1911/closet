import { useNavigation } from '@react-navigation/native';
import React, { useEffect } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import ClosetCard from '../components/ClosetCard';
import { EmptyState, ErrorState, LoadingState } from '../components/ScreenState';
import { useCloset } from '../context/ClosetContext';

const trailerIdFromLink = (link?: string) => (link ? link.slice(-11) : undefined);

export default function SavedScreen() {
  const navigation = useNavigation<any>();
  const { authUser, savedClosets, savedError, savedLoading, loadSaved, toggleSaved, trackViewed } = useCloset();

  useEffect(() => {
    loadSaved();
  }, [loadSaved]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Saved closets</Text>
      {!authUser ? <EmptyState message="Sign in from Profile to save closets." /> : null}
      {authUser && savedLoading ? <LoadingState /> : null}
      {authUser && !savedLoading && savedError ? <ErrorState message={savedError} /> : null}
      {authUser && !savedLoading && !savedError && !savedClosets.length ? <EmptyState message="No saved closets yet." /> : null}
      {authUser && !savedLoading && !savedError
        ? savedClosets.map((item) => {
            const trailerId = trailerIdFromLink(item.trailerLink);
            return (
              <ClosetCard
                key={item.id}
                closet={item}
                isSaved
                onPressDetails={() => {
                  trackViewed(item.id);
                  navigation.navigate('ClosetDetail', { closetId: item.id });
                }}
                onPressCoats={() => {
                  trackViewed(item.id);
                  navigation.navigate('Coats', { closetId: item.id });
                }}
                onPressTrailer={trailerId ? () => navigation.navigate('Trailer', { ytTrailerId: trailerId }) : undefined}
                onToggleSaved={() => toggleSaved(item.id)}
              />
            );
          })
        : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 12 },
  heading: { color: 'white', fontSize: 24, fontWeight: '700', marginBottom: 12 },
});
