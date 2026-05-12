import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import ClosetCard from '../components/ClosetCard';
import { EmptyState, ErrorState, LoadingState } from '../components/ScreenState';
import { useCloset } from '../context/ClosetContext';

const trailerIdFromLink = (link?: string) => (link ? link.slice(-11) : undefined);

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const { closets, recentlyViewedClosets, loading, error, authUser, toggleSaved, trackViewed } = useCloset();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Closet Home</Text>
      {loading ? <LoadingState /> : null}
      {!loading && error ? <ErrorState message={error} /> : null}
      {!loading && !error && !closets.length ? <EmptyState message="No closets found yet." /> : null}

      {!loading && !error
        ? closets.map((item) => {
            const trailerId = trailerIdFromLink(item.trailerLink);
            return (
              <ClosetCard
                key={item.id}
                closet={item}
                isSaved={authUser?.favoriteClosetIds?.includes(item.id)}
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
                disableSave={!authUser}
              />
            );
          })
        : null}

      <View style={styles.section}>
        <Text style={styles.subheading}>Continue browsing</Text>
        {!recentlyViewedClosets.length ? <EmptyState message="Your recently viewed closets appear here." /> : null}
        {recentlyViewedClosets.map((item) => {
          const trailerId = trailerIdFromLink(item.trailerLink);
          return (
            <ClosetCard
              key={`recent-${item.id}`}
              closet={item}
              isSaved={authUser?.favoriteClosetIds?.includes(item.id)}
              onPressDetails={() => navigation.navigate('ClosetDetail', { closetId: item.id })}
              onPressCoats={() => navigation.navigate('Coats', { closetId: item.id })}
              onPressTrailer={trailerId ? () => navigation.navigate('Trailer', { ytTrailerId: trailerId }) : undefined}
              onToggleSaved={() => toggleSaved(item.id)}
              disableSave={!authUser}
            />
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
  },
  heading: {
    color: 'white',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
  },
  section: {
    marginTop: 16,
  },
  subheading: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
});
