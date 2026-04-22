import { RouteProp, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { EmptyState, ErrorState, LoadingState } from '../components/ScreenState';
import { useCloset } from '../context/ClosetContext';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Coat } from '../types/models';

export default function CoatsScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'Coats'>>();
  const { closetId } = route.params;
  const { coats, currentCloset, coatsLoading, coatsError, loadClosetAndCoats, addCoatNote, saveCoatNote, removeCoatNote } = useCloset();

  const [newNote, setNewNote] = useState('');
  const [editingId, setEditingId] = useState('');
  const [editingText, setEditingText] = useState('');
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    loadClosetAndCoats(closetId);
  }, [closetId, loadClosetAndCoats]);

  const submitNew = async () => {
    if (!newNote.trim()) {
      return;
    }
    setActionError('');
    try {
      await addCoatNote(closetId, newNote.trim());
      setNewNote('');
    } catch (err: any) {
      setActionError(err?.response?.data?.message || err?.message || 'Could not add note.');
    }
  };

  const saveEdit = async (coat: Coat) => {
    if (!editingText.trim()) {
      return;
    }
    setActionError('');
    try {
      await saveCoatNote(closetId, coat, editingText.trim());
      setEditingId('');
      setEditingText('');
    } catch (err: any) {
      setActionError(err?.response?.data?.message || err?.message || 'Could not update note.');
    }
  };

  const removeNote = async (coatId: string) => {
    setActionError('');
    try {
      await removeCoatNote(closetId, coatId);
    } catch (err: any) {
      setActionError(err?.response?.data?.message || err?.message || 'Could not delete note.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Items for {currentCloset?.name || 'Closet'}</Text>
      <TextInput
        style={styles.input}
        multiline
        value={newNote}
        onChangeText={setNewNote}
        placeholder="Add item note"
        placeholderTextColor="#888"
      />
      <ActionButton label="Add note" onPress={submitNew} />
      {actionError ? <ErrorState message={actionError} /> : null}

      {coatsLoading ? <LoadingState /> : null}
      {!coatsLoading && coatsError ? <ErrorState message={coatsError} /> : null}
      {!coatsLoading && !coatsError && !coats.length ? <EmptyState message="No item notes yet." /> : null}

      {!coatsLoading && !coatsError
        ? coats.map((coat) => (
            <View key={coat.id} style={styles.noteCard}>
              {editingId === coat.id ? (
                <>
                  <TextInput style={styles.input} multiline value={editingText} onChangeText={setEditingText} placeholderTextColor="#888" />
                  <View style={styles.row}>
                    <ActionButton label="Save" onPress={() => saveEdit(coat)} />
                    <ActionButton label="Cancel" onPress={() => setEditingId('')} />
                  </View>
                </>
              ) : (
                <>
                  <Text style={styles.noteText}>{coat.description || 'No note text'}</Text>
                  <View style={styles.row}>
                    <ActionButton
                      label="Edit"
                      onPress={() => {
                        setEditingId(coat.id);
                        setEditingText(coat.description || '');
                      }}
                    />
                    <ActionButton label="Delete" onPress={() => removeNote(coat.id)} />
                  </View>
                </>
              )}
            </View>
          ))
        : null}
    </ScrollView>
  );
}

function ActionButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.button}>
      <Text style={styles.buttonText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { padding: 12, gap: 10 },
  heading: { color: 'white', fontSize: 22, fontWeight: '700' },
  input: {
    borderWidth: 1,
    borderColor: '#3a3a3a',
    borderRadius: 8,
    color: 'white',
    paddingHorizontal: 10,
    paddingVertical: 8,
    minHeight: 44,
  },
  noteCard: { backgroundColor: '#1f1f1f', borderRadius: 8, padding: 10, gap: 8 },
  noteText: { color: '#f2f2f2' },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  button: { borderWidth: 1, borderColor: '#4eb8ff', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 7 },
  buttonText: { color: '#c6eaff' },
});
