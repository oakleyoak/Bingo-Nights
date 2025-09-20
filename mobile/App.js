import React, { useEffect, useState } from 'react';
import { View, Text, Button, TextInput, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { createClient } from '@supabase/supabase-js';

// IMPORTANT: Set these via environment or runtime config. Do not hardcode in repo.
const SUPABASE_URL = 'https://oluqgthjdyqffrrbnrls.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sdXFndGhqZHlxZmZycmJucmxzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzNjU1OTksImV4cCI6MjA3Mzk0MTU5OX0.sfYjHwq9zLb3u8wpX-TiA596q3z0tGRLu66hFJ_cUj4';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default function App() {
  const [email, setEmail] = useState('');
  const [user, setUser] = useState(null);
  const [currentGame, setCurrentGame] = useState(null);
  const [bingoCard, setBingoCard] = useState([]);
  const [marked, setMarked] = useState([]);
  const [calledNumbers, setCalledNumbers] = useState([]);

  // Generate a random bingo card
  const generateCard = () => {
    const card = [];
    const mark = [];
    for (let i = 0; i < 5; i++) {
      card[i] = [];
      mark[i] = [];
      for (let j = 0; j < 5; j++) {
        if (i === 2 && j === 2) {
          card[i][j] = 'FREE';
          mark[i][j] = true;
        } else {
          card[i][j] = Math.floor(Math.random() * 75) + 1;
          mark[i][j] = false;
        }
      }
    }
    setBingoCard(card);
    setMarked(mark);
  };

  // Subscribe to called numbers
  useEffect(() => {
    if (currentGame) {
      const channel = supabase
        .channel('called_numbers')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'called_numbers', filter: `game_id=eq.${currentGame.id}` }, (payload) => {
          setCalledNumbers(prev => [...prev, payload.new.number]);
          // Mark the card if the number is on it
          setMarked(prev => prev.map((row, i) => row.map((cell, j) => cell || bingoCard[i][j] === payload.new.number)));
        })
        .subscribe();

      return () => supabase.removeChannel(channel);
    }
  }, [currentGame, bingoCard]);

  // Check for bingo
  const checkBingo = () => {
    // Simple check for rows, columns, diagonals
    for (let i = 0; i < 5; i++) {
      if (marked[i].every(m => m)) return true; // row
      if (marked.every(row => row[i])) return true; // column
    }
    if (marked.every((row, i) => row[i])) return true; // diagonal
    if (marked.every((row, i) => row[4 - i])) return true; // diagonal
    return false;
  };

  const joinGame = async (gameId) => {
    const { data: game, error: gameError } = await supabase.from('games').select('*').eq('id', gameId).single();
    if (gameError) return;
    const { error } = await supabase.from('players').insert([{ game_id: gameId, user_id: user.id }]);
    if (!error) {
      setCurrentGame(game);
      generateCard();
      setCurrentScreen('game');
    }
  };

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
    const { data: game, error: gameError } = await supabase.from('games').select('*').eq('id', gameId).single();
    if (gameError) return;
    const { error } = await supabase.from('players').insert([{ game_id: gameId, user_id: user.id }]);
    if (!error) {
      setCurrentGame(game);
      generateCard();
      setCurrentScreen('game');
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
        <Text style={styles.title}>Game: {currentGame?.title}</Text>
        <Text>Called Numbers: {calledNumbers.join(', ')}</Text>
        <View style={styles.card}>
          {bingoCard.map((row, i) => (
            <View key={i} style={styles.row}>
              {row.map((num, j) => (
                <TouchableOpacity
                  key={j}
                  style={[styles.cell, marked[i][j] && styles.marked]}
                  onPress={() => {
                    if (num !== 'FREE' && calledNumbers.includes(num)) {
                      setMarked(prev => prev.map((r, ri) => ri === i ? r.map((c, cj) => cj === j ? true : c) : r));
                    }
                  }}
                >
                  <Text>{num}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>
        {checkBingo() && <Button title="BINGO!" onPress={() => alert('Bingo claimed!')} />}
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
  card: { flexDirection: 'column', marginVertical: 20 },
  row: { flexDirection: 'row' },
  cell: { width: 50, height: 50, borderWidth: 1, borderColor: '#000', alignItems: 'center', justifyContent: 'center', margin: 2 },
  marked: { backgroundColor: 'red' },
});
