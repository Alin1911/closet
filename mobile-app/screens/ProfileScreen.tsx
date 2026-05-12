import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useCloset } from '../context/ClosetContext';

export default function ProfileScreen() {
  const { authUser, login, register, saveProfile, signOut } = useCloset();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState(authUser?.displayName || '');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const submitAuth = async () => {
    setError('');
    setMessage('');
    try {
      const responseMessage = mode === 'login'
        ? await login({ email, password })
        : await register({ email, password, displayName });
      setMessage(responseMessage);
      setPassword('');
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Authentication failed.');
    }
  };

  const submitProfile = async () => {
    setError('');
    setMessage('');
    try {
      const responseMessage = await saveProfile({ displayName, password: password || undefined });
      setMessage(responseMessage);
      setPassword('');
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Profile update failed.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Profile</Text>
      {authUser ? (
        <View style={styles.card}>
          <Text style={styles.title}>{authUser.displayName}</Text>
          <Text style={styles.subtitle}>{authUser.email}</Text>
          <Text style={styles.subtitle}>Saved closets: {authUser.favoriteClosetIds?.length || 0}</Text>
          <TextInput style={styles.input} value={displayName} onChangeText={setDisplayName} placeholder="Display name" placeholderTextColor="#888" />
          <TextInput style={styles.input} secureTextEntry value={password} onChangeText={setPassword} placeholder="New password (optional)" placeholderTextColor="#888" />
          <ActionButton label="Update profile" onPress={submitProfile} />
          <ActionButton label="Logout" onPress={signOut} />
        </View>
      ) : (
        <View style={styles.card}>
          <View style={styles.row}>
            <ActionButton label="Login" onPress={() => setMode('login')} active={mode === 'login'} />
            <ActionButton label="Register" onPress={() => setMode('register')} active={mode === 'register'} />
          </View>
          {mode === 'register' ? (
            <TextInput style={styles.input} value={displayName} onChangeText={setDisplayName} placeholder="Display name" placeholderTextColor="#888" />
          ) : null}
          <TextInput style={styles.input} autoCapitalize="none" value={email} onChangeText={setEmail} placeholder="Email" placeholderTextColor="#888" />
          <TextInput style={styles.input} secureTextEntry value={password} onChangeText={setPassword} placeholder="Password" placeholderTextColor="#888" />
          <ActionButton label={mode === 'login' ? 'Login' : 'Register'} onPress={submitAuth} active />
        </View>
      )}
      {message ? <Text style={styles.success}>{message}</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </ScrollView>
  );
}

function ActionButton({ label, onPress, active }: { label: string; onPress: () => void | Promise<void>; active?: boolean }) {
  return (
    <Pressable onPress={() => onPress()} style={[styles.button, active ? styles.buttonActive : null]}>
      <Text style={styles.buttonText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { padding: 12 },
  heading: { color: 'white', fontSize: 24, fontWeight: '700', marginBottom: 12 },
  card: { backgroundColor: '#1f1f1f', borderRadius: 10, padding: 12, gap: 8 },
  title: { color: 'white', fontSize: 18, fontWeight: '600' },
  subtitle: { color: '#d6d6d6' },
  input: {
    borderWidth: 1,
    borderColor: '#3a3a3a',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: 'white',
  },
  row: { flexDirection: 'row', gap: 8 },
  button: {
    borderWidth: 1,
    borderColor: '#4eb8ff',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginTop: 2,
  },
  buttonActive: { backgroundColor: '#173f5c' },
  buttonText: { color: '#caebff' },
  success: { color: '#8dff99', marginTop: 10 },
  error: { color: '#ff7b7b', marginTop: 10 },
});
