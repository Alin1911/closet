import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import ClosetCard from '../components/ClosetCard';
import { EmptyState, ErrorState, LoadingState } from '../components/ScreenState';
import { useCloset } from '../context/ClosetContext';

const trailerIdFromLink = (link?: string) => (link ? link.slice(-11) : undefined);

export default function BrowseScreen() {
  const navigation = useNavigation<any>();
  const { browseItems, browseLoading, browseError, authUser, loadBrowse, toggleSaved, trackViewed } = useCloset();
  const [q, setQ] = useState('');
  const [style, setStyle] = useState('');
  const [season, setSeason] = useState('');
  const [color, setColor] = useState('');
  const [sort, setSort] = useState<'newest' | 'name'>('newest');

  const apply = useCallback(() => loadBrowse({ q, style, season, color, sort, page: 0, size: 12 }), [color, loadBrowse, q, season, sort, style]);

  useEffect(() => {
    apply();
  }, [apply]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Browse closets</Text>
      <TextInput style={styles.input} value={q} onChangeText={setQ} placeholder="Search" placeholderTextColor="#999" />
      <TextInput style={styles.input} value={style} onChangeText={setStyle} placeholder="Style" placeholderTextColor="#999" />
      <TextInput style={styles.input} value={season} onChangeText={setSeason} placeholder="Season" placeholderTextColor="#999" />
      <TextInput style={styles.input} value={color} onChangeText={setColor} placeholder="Color" placeholderTextColor="#999" />
      <View style={styles.row}>
        <FilterButton label="Newest" active={sort === 'newest'} onPress={() => setSort('newest')} />
        <FilterButton label="Name" active={sort === 'name'} onPress={() => setSort('name')} />
        <FilterButton label="Apply" active onPress={apply} />
      </View>

      {browseLoading ? <LoadingState /> : null}
      {!browseLoading && browseError ? <ErrorState message={browseError} /> : null}
      {!browseLoading && !browseError && !browseItems.length ? <EmptyState message="No closets found for selected filters." /> : null}

      {!browseLoading && !browseError
        ? browseItems.map((item) => {
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
    </ScrollView>
  );
}

function FilterButton({ label, active, onPress }: { label: string; active?: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.filterButton, active ? styles.filterButtonActive : null]}>
      <Text style={styles.filterButtonLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { padding: 12 },
  heading: { color: 'white', fontSize: 24, fontWeight: '700', marginBottom: 12 },
  input: {
    borderColor: '#3a3a3a',
    borderWidth: 1,
    color: 'white',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 8,
  },
  row: { flexDirection: 'row', gap: 8, marginBottom: 10, flexWrap: 'wrap' },
  filterButton: {
    borderColor: '#4eb8ff',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  filterButtonActive: { backgroundColor: '#163853' },
  filterButtonLabel: { color: '#cceeff' },
});
