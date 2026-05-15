import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import ClosetCard from '../components/ClosetCard';
import { EmptyState, ErrorState, LoadingState } from '../components/ScreenState';
import { useCloset } from '../context/ClosetContext';

const trailerIdFromLink = (link?: string) => (link ? link.slice(-11) : undefined);

export default function BrowseScreen() {
  const navigation = useNavigation<any>();
  const { browseItems, browseMeta, browseLoading, browseError, authUser, loadBrowse, toggleSaved, trackViewed } = useCloset();
  const [q, setQ] = useState('');
  const [style, setStyle] = useState('');
  const [season, setSeason] = useState('');
  const [color, setColor] = useState('');
  const [sort, setSort] = useState<'newest' | 'name'>('newest');
  const [page, setPage] = useState(0);
  const [size] = useState(12);

  const apply = useCallback(() => loadBrowse({ q, style, season, color, sort, page, size }), [color, loadBrowse, page, q, season, size, sort, style]);
  const applyFromStart = useCallback(() => {
    const firstPage = 0;
    setPage(firstPage);
    return loadBrowse({ q, style, season, color, sort, page: firstPage, size });
  }, [color, loadBrowse, q, season, size, sort, style]);

  useEffect(() => {
    apply();
  }, [apply]);

  useEffect(() => {
    if (browseMeta.page !== page) {
      setPage(browseMeta.page);
    }
  }, [browseMeta.page, page]);

  const topFacetSummary = [
    ['Styles', browseMeta.styleCounts],
    ['Seasons', browseMeta.seasonCounts],
    ['Colors', browseMeta.colorCounts],
  ]
    .map(([label, counts]) => {
      const top = Object.entries(counts as Record<string, number>)
        .sort((left, right) => right[1] - left[1])
        .slice(0, 3)
        .map(([name, count]) => `${name} (${count})`)
        .join(', ');
      return top ? `${label}: ${top}` : '';
    })
    .filter(Boolean);

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
        <FilterButton label="Apply filters" active onPress={applyFromStart} />
      </View>
      {!browseLoading && !browseError ? (
        <Text style={styles.metaText}>
          Showing {browseItems.length} of {browseMeta.totalCount} • Page {browseMeta.page + 1}
          {browseMeta.totalPages ? `/${browseMeta.totalPages}` : ''}
        </Text>
      ) : null}
      {topFacetSummary.map((line) => (
        <Text key={line} style={styles.metaText}>{line}</Text>
      ))}

      {browseLoading ? <LoadingState /> : null}
      {!browseLoading && browseError ? <ErrorState message={browseError} onRetry={apply} /> : null}
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
      {!browseLoading && !browseError && browseMeta.totalPages > 1 ? (
        <View style={styles.row}>
          <FilterButton
            label="Prev"
            active={false}
            disabled={page <= 0}
            onPress={() => setPage((previous) => previous - 1)}
          />
          <FilterButton
            label="Next"
            active={false}
            disabled={page + 1 >= browseMeta.totalPages}
            onPress={() => setPage((previous) => previous + 1)}
          />
        </View>
      ) : null}
    </ScrollView>
  );
}

function FilterButton({ label, active, onPress, disabled }: { label: string; active?: boolean; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable disabled={disabled} onPress={onPress} style={[styles.filterButton, active ? styles.filterButtonActive : null, disabled ? styles.filterButtonDisabled : null]}>
      <Text style={[styles.filterButtonLabel, disabled ? styles.filterButtonLabelDisabled : null]}>{label}</Text>
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
  metaText: { color: '#afafaf', marginBottom: 4 },
  filterButton: {
    borderColor: '#4eb8ff',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  filterButtonActive: { backgroundColor: '#163853' },
  filterButtonDisabled: { borderColor: '#4a4a4a', backgroundColor: '#222' },
  filterButtonLabel: { color: '#cceeff' },
  filterButtonLabelDisabled: { color: '#777' },
});
