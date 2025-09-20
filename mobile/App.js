import React, { useEffect, useState } from 'react';
import { View, Text, Button, TextInput, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { createClient } from '@supabase/supabase-js';

// IMPORTANT: Set these via environment or runtime config. Do not hardcode in repo.
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://your-supabase-url.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'public-anon-key';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default function App() {
  const [email, setEmail] = useState('');
  const [user, setUser] = useState(null);
  const [games, setGames] = useState([]);
  const [currentScreen, setCurrentScreen] = useState('auth'); // auth, lobby, game

  useEffect(() => {
    const session = supabase.auth.getSession().then(res => {
      if (res?.data?.session?.user) {
        setUser(res.data.session.user);
        setCurrentScreen('lobby');
        fetchGames();
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setCurrentScreen('lobby');
        fetchGames();
      } else {
        setCurrentScreen('auth');
      }
    });

    return () => listener?.subscription?.unsubscribe?.();
  }, []);

  const fetchGames = async () => {
    const { data, error } = await supabase.from('games').select('*').eq('status', 'waiting');
    if (!error) setGames(data || []);
  };

  const signIn = async () => {
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) alert(error.message);
    else alert('Check your email for a magic link to sign in');
  };

  const createGame = async () => {
    const { data, error } = await supabase.from('games').insert([{ title: 'New Game', host: user.id }]).select().single();
    if (!error) {
      setGames([...games, data]);
    }
  };

  const joinGame = async (gameId) => {
    const { error } = await supabase.from('players').insert([{ game_id: gameId, user_id: user.id }]);
    if (!error) {
      setCurrentScreen('game');
      // TODO: Implement game screen
    }
  };

  if (currentScreen === 'auth') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Bingo Nights</Text>
        <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.input} />
        <Button title="Sign in / Register (magic link)" onPress={signIn} />
      </View>
    );
  }

  if (currentScreen === 'lobby') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Lobby</Text>
        <Text>Welcome {user.email}</Text>
        <Button title="Create Game" onPress={createGame} />
        <Text style={styles.subtitle}>Available Games:</Text>
        <FlatList
          data={games}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.gameItem} onPress={() => joinGame(item.id)}>
              <Text>{item.title}</Text>
            </TouchableOpacity>
          )}
        />
        <Button title="Sign Out" onPress={() => supabase.auth.signOut()} />
      </View>
    );
  }

  if (currentScreen === 'game') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Game Screen</Text>
        <Text>Game in progress...</Text>
        <Button title="Back to Lobby" onPress={() => setCurrentScreen('lobby')} />
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 },
  title: { fontSize: 28, marginBottom: 16 },
  input: { width: '100%', borderWidth: 1, borderColor: '#ccc', padding: 8, marginBottom: 12 },
  subtitle: { fontSize: 18, marginVertical: 16 },
  gameItem: { padding: 10, marginVertical: 5, backgroundColor: '#f0f0f0', width: '100%', alignItems: 'center' },
});
