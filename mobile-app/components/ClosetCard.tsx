import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Closet } from '../types/models';

type Props = {
  closet: Closet;
  isSaved?: boolean;
  onPressDetails: () => void;
  onPressCoats: () => void;
  onPressTrailer?: () => void;
  onToggleSaved?: () => void;
  disableSave?: boolean;
};

export default function ClosetCard({
  closet,
  isSaved,
  onPressDetails,
  onPressCoats,
  onPressTrailer,
  onToggleSaved,
  disableSave,
}: Props) {
  return (
    <View style={styles.card}>
      {closet.poster ? <Image source={{ uri: closet.poster }} style={styles.image} /> : null}
      <Text style={styles.title}>{closet.name || 'Closet'}</Text>
      <Text style={styles.description}>{closet.description || 'No description yet.'}</Text>
      <View style={styles.actions}>
        <ActionButton label="Details" onPress={onPressDetails} />
        <ActionButton label="Items" onPress={onPressCoats} />
        {onPressTrailer ? <ActionButton label="Lookbook" onPress={onPressTrailer} /> : null}
        {onToggleSaved ? (
          <ActionButton label={isSaved ? 'Saved' : 'Save'} onPress={onToggleSaved} disabled={disableSave} />
        ) : null}
      </View>
    </View>
  );
}

function ActionButton({ label, onPress, disabled }: { label: string; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable onPress={onPress} disabled={disabled} style={[styles.button, disabled ? styles.buttonDisabled : null]}>
      <Text style={styles.buttonText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1f1f1f',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    gap: 8,
  },
  image: {
    width: '100%',
    height: 180,
    borderRadius: 8,
  },
  title: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  description: {
    color: '#e2e2e2',
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  button: {
    borderWidth: 1,
    borderColor: '#3ea6ff',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonText: {
    color: '#bfe6ff',
  },
});
