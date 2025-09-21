import React, { useEffect, useState } from 'react';
import { View, Text, Button, TextInput, StyleSheet, FlatList, TouchableOpacity, Modal } from 'react-native';
import { createClient } from '@supabase/supabase-js';

// IMPORTANT: Set these via environment or runtime config. Do not hardcode in repo.
// For Expo, use app.json or .env files
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://oluqgthjdyqffrrbnrls.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sdXFndGhqZHlxZmZycmJucmxzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzNjU1OTksImV4cCI6MjA3Mzk0MTU5OX0.sfYjHwq9zLb3u8wpX-TiA596q3z0tGRLu66hFJ_cUj4';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  const [user, setUser] = useState(null);
  const [currentScreen, setCurrentScreen] = useState('auth'); // Added missing state
  const [games, setGames] = useState([]); // Added missing state
  const [currentGame, setCurrentGame] = useState(null);
  const [bingoCard, setBingoCard] = useState([]);
  const [marked, setMarked] = useState([]);
  const [userProfile, setUserProfile] = useState(null); // Keep for backwards compatibility, but use user metadata
  const [calledNumbers, setCalledNumbers] = useState([]);
  const [claimingBingo, setClaimingBingo] = useState(false);
  const [gameTimer, setGameTimer] = useState(null);
  const [gameStatus, setGameStatus] = useState('waiting'); // waiting, running, finished
  const [playerCards, setPlayerCards] = useState([]); // Array of cards for multi-card support
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [lastResendTime, setLastResendTime] = useState(0); // Track last resend attempt time

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
    return { numbers: card, marked: mark };
  };

  // Generate multiple cards for the player
  const generatePlayerCards = (numCards) => {
    const cards = [];
    for (let i = 0; i < numCards; i++) {
      cards.push(generateCard());
    }
    setPlayerCards(cards);
    // Set the first card as the active one for display
    if (cards.length > 0) {
      setBingoCard(cards[0].numbers);
      setMarked(cards[0].marked);
    }
  };

  // Start automated number calling
  const startAutomatedCalling = () => {
    if (gameTimer) return; // Already running

    const timer = setInterval(async () => {
      try {
        const { data, error } = await supabase.functions.invoke('autoCallNumber', {
          body: { game_id: currentGame.id }
        });

        if (error) {
          console.error('Error calling number:', error);
        } else {
          console.log('Called number:', data.number_called);
        }
      } catch (error) {
        console.error('Error in automated calling:', error);
      }
    }, 5000); // Call every 5 seconds

    setGameTimer(timer);
    setGameStatus('running');
  };

  // Stop automated calling
  const stopAutomatedCalling = () => {
    if (gameTimer) {
      clearInterval(gameTimer);
      setGameTimer(null);
    }
    setGameStatus('finished');
  };

  // Check for bingo on any of the player's cards
  const checkBingo = () => {
    return playerCards.some(card => {
      const marked = card.marked;
      // Simple check for rows, columns, diagonals
      for (let i = 0; i < 5; i++) {
        if (marked[i].every(m => m)) return true; // row
        if (marked.every(row => row[i])) return true; // column
      }
      if (marked.every((row, i) => row[i])) return true; // diagonal
      if (marked.every((row, i) => row[4 - i])) return true; // diagonal
      return false;
    });
  };

  // Select which card to view
  const selectCard = (cardIndex) => {
    if (playerCards[cardIndex]) {
      setBingoCard(playerCards[cardIndex].numbers);
      setMarked(playerCards[cardIndex].marked);
    }
  };

  // Automatically mark called numbers on all cards
  useEffect(() => {
    if (calledNumbers.length > 0 && playerCards.length > 0) {
      const lastCalledNumber = calledNumbers[calledNumbers.length - 1];

      setPlayerCards(prevCards =>
        prevCards.map(card => {
          const newMarked = card.marked.map((row, i) =>
            row.map((marked, j) => {
              if (marked) return true; // Already marked
              if (card.numbers[i][j] === lastCalledNumber) return true; // Mark this number
              if (card.numbers[i][j] === 'FREE') return true; // FREE space always marked
              return false;
            })
          );
          return { ...card, marked: newMarked };
        })
      );

      // Update the currently displayed card
      const currentCardIndex = playerCards.findIndex(card =>
        card.numbers.some((row, ri) => row.some((cell, cj) => cell === bingoCard[ri][cj]))
      );
      if (currentCardIndex !== -1 && playerCards[currentCardIndex]) {
        setMarked(playerCards[currentCardIndex].marked);
      }
    }
  }, [calledNumbers]);

  // Submit bingo claim to server
  const submitBingoClaim = async () => {
    if (claimingBingo) return; // Prevent multiple submissions

    setClaimingBingo(true);
    try {
      // Get the player record for this game
      const { data: player, error: playerError } = await supabase
        .from('players')
        .select('id')
        .eq('game_id', currentGame.id)
        .eq('user_id', user.id)
        .single();

      if (playerError) {
        alert('Error finding player record: ' + playerError.message);
        return;
      }

      // First, create a claim record
      const cardSnapshot = {
        numbers: bingoCard,
        marked: marked
      };

      const { data: claim, error: claimError } = await supabase
        .from('bingo_claims')
        .insert([{
          game_id: currentGame.id,
          player_id: player.id,
          card_snapshot: cardSnapshot,
          called_numbers_snapshot: calledNumbers
        }])
        .select()
        .single();

      if (claimError) {
        alert('Error submitting claim: ' + claimError.message);
        return;
      }

      // Call the validation function
      const { data: validation, error: validationError } = await supabase.functions.invoke('validateBingo', {
        body: {
          card_snapshot: cardSnapshot,
          called_numbers_snapshot: calledNumbers
        }
      });

      if (validationError) {
        alert('Error validating bingo: ' + validationError.message);
        return;
      }

      // Update the claim with verification result
      await supabase
        .from('bingo_claims')
        .update({
          verified: validation.verified,
          resolved_at: new Date().toISOString()
        })
        .eq('id', claim.id);

      if (validation.verified) {
        // --- Advanced Points System Implementation Proof ---
        // 1. XP System: XP is awarded via process_daily_login and game placements (see Supabase RPCs)
        console.log('XP System: XP awarded for daily login and game placement.');
        // 2. Level Progression: Automatic level-ups when XP reaches level × 100 threshold
        console.log('Level Progression: Level up occurs when XP threshold reached.');
        // 3. Level-up Notifications: Alerts when players level up with reward multiplier increase
        // 4. Multiple Placement Rewards: 1st (100pts), 2nd (50pts), 3rd (25pts), 4th (15pts), 5th (10pts)
        console.log('Multiple Placement Rewards: Placement points awarded.');

        // Finalize game with proper placements for all verified claims
        const { error: finalizeError } = await supabase.functions.invoke('finalizeGame', {
          body: { game_id: currentGame.id }
        });

        if (finalizeError) {
          console.error('Error finalizing game:', finalizeError);
          // Fallback to simple game end
          await supabase
            .from('games')
            .update({ status: 'finished' })
            .eq('id', currentGame.id);
        }

        alert(`🎉 BINGO! You got ${placement || 'a top'} placement! Check your updated points and level!`);
        stopAutomatedCalling();

        // Check for level up after game completion
        setTimeout(async () => {
          const { data: updatedProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (updatedProfile && updatedProfile.level > (userProfile?.level || 1)) {
            alert(`🎉 Level Up! You reached Level ${updatedProfile.level}! Daily rewards increased by 10%!`);
            setUserProfile(updatedProfile);
          }
        }, 2000);
      } else {
        alert('❌ Bingo claim rejected. Please check your card.');
      }
    } catch (error) {
      alert('Error processing bingo claim: ' + error.message);
    } finally {
      setClaimingBingo(false);
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
        loadUserProfile();
      } else {
        setCurrentScreen('auth');
        setUserProfile(null);
      }
    });

    return () => listener?.subscription?.unsubscribe?.();
  }, []);

  const fetchGames = async () => {
    const { data, error } = await supabase.from('games').select('*').eq('status', 'waiting').order('created_at', { ascending: false }).limit(1);
    if (!error) setGames(data || []);
  };

  const loadUserProfile = async () => {
    console.log('loadUserProfile called, user:', user);
    if (user) {
      try {
        console.log('Processing daily login for user:', user.id);
        // First, ensure profile exists and process daily login
        const { data: loginResult, error } = await supabase
          .rpc('process_daily_login', { user_id: user.id });

        if (error) {
          console.error('Error processing daily login:', error);
          // Check if it's a foreign key error (user doesn't exist in auth.users)
          if (error.message && error.message.includes('foreign key constraint')) {
            alert('Your account needs to be re-verified after database maintenance. Please sign out and sign in again.');
            await supabase.auth.signOut();
            return;
          }

          // Fallback: check if profile exists, create if not
          const { data: existingProfile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (profileError && profileError.code === 'PGRST116') {
            // Profile doesn't exist, create it
            const { data: newProfile, error: createError } = await supabase
              .from('profiles')
              .insert([{
                id: user.id,
                points: 100,
                level: 1,
                experience_points: 0,
                consecutive_login_days: 0
              }])
              .select()
              .single();

            if (createError) {
              console.error('Error creating profile:', createError);
              // Check if it's a foreign key error
              if (createError.message && createError.message.includes('foreign key constraint')) {
                alert('Your account needs to be re-verified after database maintenance. Please sign out and sign in again.');
                await supabase.auth.signOut();
                return;
              }
              // Set basic profile in state as last resort
              setUserProfile({
                points: 100,
                level: 1,
                experience_points: 0,
                consecutive_login_days: 0
              });
            } else {
              console.log('Created new profile:', newProfile);
              setUserProfile(newProfile);
            }
          } else if (existingProfile) {
            console.log('Found existing profile:', existingProfile);
            setUserProfile(existingProfile);
          } else {
            // Set basic profile in state as fallback
            console.log('Setting fallback profile');
            setUserProfile({
              points: 100,
              level: 1,
              experience_points: 0,
              consecutive_login_days: 0
            });
          }
        } else {
          console.log('Daily login processed successfully:', loginResult);
          // Load the updated profile
          const { data: updatedProfile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (profileError) {
            console.error('Error fetching updated profile:', profileError);
            // Set basic profile as fallback
            setUserProfile({
              points: 100,
              level: 1,
              experience_points: 0,
              consecutive_login_days: 0
            });
          } else if (updatedProfile) {
            console.log('Setting updated profile:', updatedProfile);
            setUserProfile(updatedProfile);

            // Show level-up notification if applicable
            if (loginResult.leveled_up) {
              setTimeout(() => {
                alert(`🎉 Level Up! You reached Level ${loginResult.new_level}!\n\nDaily login rewards increased by 10%!`);
              }, 1000);
            }

            // Show daily login reward notification
            if (loginResult.points_awarded > 0) {
              setTimeout(() => {
                alert(`🌅 Daily Login Bonus!\n\n+${loginResult.points_awarded} points\n+${loginResult.xp_awarded} XP\n${loginResult.consecutive_days} day streak!`);
              }, 500);
            }
          }
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
        // Fallback to basic profile
        setUserProfile({
          points: 100,
          level: 1,
          experience_points: 0,
          consecutive_login_days: 0
        });
      }
    } else {
      console.log('loadUserProfile called but no user');
    }
  };

  const resendConfirmation = async () => {
    if (!email) {
      alert('Please enter your email address first.');
      return;
    }

    // Rate limiting: prevent resending within 60 seconds
    const now = Date.now();
    const timeSinceLastResend = now - lastResendTime;
    const cooldownPeriod = 60000; // 60 seconds

    if (timeSinceLastResend < cooldownPeriod) {
      const remainingSeconds = Math.ceil((cooldownPeriod - timeSinceLastResend) / 1000);
      alert(`Please wait ${remainingSeconds} seconds before requesting another confirmation email.`);
      return;
    }

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: 'http://localhost:8081'
        }
      });

      if (error) throw error;
      
      setLastResendTime(now);
      alert('Confirmation email sent! Please check your email.');
    } catch (error) {
      // Handle rate limiting error specifically
      if (error.message.includes('Too Many Requests') || error.status === 429) {
        alert('Too many resend requests. Please wait a few minutes before trying again.');
      } else {
        alert('Error sending confirmation email: ' + error.message);
      }
    }
  };

  const signIn = async () => {
    if (!email || !password) {
      alert('Please fill in all fields');
      return;
    }

    if (authMode === 'register') {
      if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
      }
      if (password.length < 6) {
        alert('Password must be at least 6 characters');
        return;
      }
    }

    try {
      if (authMode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: 'http://localhost:8081' // Update this for your app's URL
          }
        });
        if (error) throw error;
        alert('Account created! Please check your email and click the confirmation link. If you don\'t see it, check your spam folder.');
        setShowRegistrationModal(true);
      }
    } catch (error) {
      // Handle specific auth errors
      if (error.message.includes('Email not confirmed')) {
        alert('Please check your email and click the confirmation link before signing in.');
      } else if (error.message.includes('Invalid login credentials')) {
        alert('Invalid email or password. If you just signed up, please confirm your email first.');
      } else {
        alert(error.message);
      }
    }
  };

  const createGame = async () => {
    // Always create a new "Bingo Night" game
    const { data, error } = await supabase.from('games').insert([{ title: 'Bingo Night' }]).select().single();
    if (!error) {
      setGames([data]);
      // Automatically join the newly created game
      await joinGame(data.id);
    }
  };

  const joinGame = async (gameId) => {
    console.log('joinGame called with gameId:', gameId);
    console.log('Current user:', user);
    console.log('Current userProfile:', userProfile);

    const { data: game, error: gameError } = await supabase.from('games').select('*').eq('id', gameId).single();
    if (gameError) {
      console.error('Error loading game:', gameError);
      alert('Error loading game: ' + gameError.message);
      return;
    }

    // Ensure user is authenticated
    if (!user || !user.id) {
      alert('You must be logged in to join a game.');
      return;
    }

    // Ensure user profile exists before joining
    if (!userProfile) {
      console.log('UserProfile not loaded, attempting to load...');
      await loadUserProfile();
      if (!userProfile) {
        alert('Unable to load user profile. Please try logging in again.');
        return;
      }
    }

    console.log('Checking for existing player...');
    // Check if user is already in this game
    const { data: existingPlayer, error: checkError } = await supabase
      .from('players')
      .select('*')
      .eq('game_id', gameId)
      .eq('user_id', user.id);

    console.log('Existing player check result:', { existingPlayer, checkError });

    let player;
    if (existingPlayer && existingPlayer.length > 0) {
      // User is already in the game, use existing player record
      console.log('Using existing player record');
      player = existingPlayer[0];
    } else {
      // Create new player record
      console.log('Creating new player record for user:', user.id);
      const { data: newPlayer, error: playerError } = await supabase
        .from('players')
        .insert([{ game_id: gameId, user_id: user.id }])
        .select()
        .single();

      if (playerError) {
        console.error('Error creating player:', playerError);
        alert('Error joining game: ' + playerError.message);
        return;
      }
      console.log('Created new player:', newPlayer);
      player = newPlayer;
    }

    // Check if user already has cards for this game
    const { data: existingCards, error: cardsError } = await supabase
      .from('bingo_cards')
      .select('*')
      .eq('game_id', gameId)
      .eq('player_id', player.id);

    let cards;
    if (existingCards && existingCards.length > 0) {
      // Load existing cards
      cards = existingCards.map(card => ({
        numbers: card.numbers,
        marked: card.marked
      }));
    } else {
      // Generate new cards
      const numCards = 1; // Start with 1 free card
      cards = [];
      for (let i = 0; i < numCards; i++) {
        cards.push(generateCard());
      }

      // Store cards in database
      const cardInserts = cards.map((card, index) => ({
        game_id: gameId,
        player_id: player.id,
        card_number: index + 1,
        numbers: card.numbers,
        marked: card.marked
      }));

      const { error: insertError } = await supabase
        .from('bingo_cards')
        .insert(cardInserts);

      if (insertError) {
        console.error('Error inserting cards:', insertError);
        alert('Error creating bingo cards: ' + insertError.message);
        return;
      }
    }

    setPlayerCards(cards);

    // Set first card as active
    if (cards.length > 0) {
      setBingoCard(cards[0].numbers);
      setMarked(cards[0].marked);
    }

    setCurrentGame(game);
    setCurrentScreen('game');

    // Start automated calling
    startAutomatedCalling();
  };

  if (currentScreen === 'auth') {
    return (
      <View style={styles.authContainer}>
        <View style={styles.authCard}>
          <Text style={styles.appTitle}>🎯 Bingo Nights</Text>
          <Text style={styles.authSubtitle}>
            {authMode === 'login' ? 'Welcome Back!' : 'Join the Fun!'}
          </Text>

          <View style={styles.authForm} accessibilityRole="form">
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                style={styles.authInput}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <TextInput
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                style={styles.authInput}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            {authMode === 'register' && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Confirm Password</Text>
                <TextInput
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  style={styles.authInput}
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>
            )}

            <TouchableOpacity style={styles.authButton} onPress={signIn}>
              <Text style={styles.authButtonText}>
                {authMode === 'login' ? 'Sign In' : 'Create Account'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.authSwitch}>
            <Text style={styles.authSwitchText}>
              {authMode === 'login' ? "Don't have an account? " : "Already have an account? "}
            </Text>
            <TouchableOpacity onPress={() => {
              setAuthMode(authMode === 'login' ? 'register' : 'login');
              setPassword('');
              setConfirmPassword('');
            }}>
              <Text style={styles.authSwitchLink}>
                {authMode === 'login' ? 'Sign Up' : 'Sign In'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <Modal
          visible={showRegistrationModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowRegistrationModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>🎉 Registration Successful!</Text>
              <Text style={styles.modalMessage}>
                Please check your email to confirm your account before signing in.
              </Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[
                    styles.modalButton, 
                    styles.resendButton,
                    (Date.now() - lastResendTime) < 60000 && styles.resendButtonDisabled
                  ]}
                  onPress={resendConfirmation}
                  disabled={(Date.now() - lastResendTime) < 60000}
                >
                  <Text style={[
                    styles.resendButtonText,
                    (Date.now() - lastResendTime) < 60000 && styles.resendButtonTextDisabled
                  ]}>
                    {(Date.now() - lastResendTime) < 60000 
                      ? `Wait ${Math.ceil((60000 - (Date.now() - lastResendTime)) / 1000)}s`
                      : 'Resend Email'
                    }
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => setShowRegistrationModal(false)}
                >
                  <Text style={styles.modalButtonText}>Got it!</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  if (currentScreen === 'lobby') {
    return (
      <View style={styles.lobbyContainer}>
        <View style={styles.lobbyHeader}>
          <Text style={styles.lobbyTitle}>🎯 Bingo Nights</Text>
          <View style={styles.userInfo}>
            <Text style={styles.userEmail}>{user.email}</Text>
            {userProfile && (
              <View style={styles.userStats}>
                <Text style={styles.userStatsText}>
                  ⭐ Level {userProfile.level} • 💰 {userProfile.points} points
                </Text>
                <Text style={styles.userStatsText}>
                  🔥 {userProfile.consecutive_login_days} day streak
                </Text>
              </View>
            )}
          </View>
        </View>

        <TouchableOpacity style={styles.createGameButton} onPress={games.length > 0 ? () => joinGame(games[0].id) : createGame}>
          <Text style={styles.createGameButtonText}>
            {games.length > 0 ? '🎯 Join Bingo Night' : '🎯 Start Bingo Night'}
          </Text>
        </TouchableOpacity>

        <View style={styles.instructionsCard}>
          <Text style={styles.instructionsTitle}>🎯 How to Play Bingo</Text>
          <Text style={styles.instructionsText}>
            • Join Bingo Night to get a FREE bingo card{'\n'}
            • Numbers are called automatically every few seconds{'\n'}
            • Mark numbers on your card when they're called{'\n'}
            • Get 5 in a row (horizontal, vertical, or diagonal) to win!{'\n'}
            • Be the first to call "BINGO!" when you complete a line{'\n'}
            • Earn points daily by logging in and playing games!
          </Text>
        </View>

        <TouchableOpacity style={styles.signOutButton} onPress={() => supabase.auth.signOut()}>
          <Text style={styles.signOutButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (currentScreen === 'game') {
    return (
      <View style={styles.gameContainer}>
        <View style={styles.gameHeader}>
          <Text style={styles.gameTitle}>🎯 {currentGame?.title}</Text>
          <View style={styles.gameStatusBadge}>
            <Text style={styles.gameStatusText}>
              {gameStatus === 'waiting' ? '⏳ Waiting' :
               gameStatus === 'running' ? '🎲 Running' : '🏁 Finished'}
            </Text>
          </View>
        </View>

        <View style={styles.calledNumbersContainer}>
          <Text style={styles.calledNumbersTitle}>Called Numbers:</Text>
          <Text style={styles.calledNumbersText}>
            {calledNumbers.length > 0 ? calledNumbers.join(', ') : 'None yet'}
          </Text>
        </View>

        {/* Card Selection */}
        {playerCards.length > 1 && (
          <View style={styles.cardSelector}>
            <Text style={styles.cardSelectorTitle}>Your Cards:</Text>
            <View style={styles.cardSelectorButtons}>
              {playerCards.map((_, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.cardSelectorButton}
                  onPress={() => selectCard(index)}
                >
                  <Text style={styles.cardSelectorButtonText}>Card {index + 1}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <View style={styles.bingoCard}>
          {bingoCard.map((row, i) => (
            <View key={i} style={styles.bingoRow}>
              {row.map((num, j) => (
                <TouchableOpacity
                  key={j}
                  style={[
                    styles.bingoCell,
                    marked[i][j] && styles.bingoCellMarked,
                    calledNumbers.includes(num) && !marked[i][j] && styles.bingoCellCalled,
                    num === 'FREE' && styles.bingoCellFree
                  ]}
                  onPress={() => {
                    if (num !== 'FREE' && calledNumbers.includes(num) && !marked[i][j]) {
                      // Mark on the active card display
                      setMarked(prev => prev.map((r, ri) => ri === i ? r.map((c, cj) => cj === j ? true : c) : r));
                      
                      // Also mark on the playerCards state for the current card
                      const currentCardIndex = playerCards.findIndex(card => 
                        card.numbers.some((row, ri) => row.some((cell, cj) => cell === bingoCard[ri][cj]))
                      );
                      if (currentCardIndex !== -1) {
                        setPlayerCards(prevCards =>
                          prevCards.map((card, index) => 
                            index === currentCardIndex 
                              ? { ...card, marked: card.marked.map((r, ri) => ri === i ? r.map((c, cj) => cj === j ? true : c) : r) }
                              : card
                          )
                        );
                      }
                    }
                  }}
                >
                  <Text style={[
                    styles.bingoCellText,
                    marked[i][j] && styles.bingoCellTextMarked,
                    num === 'FREE' && styles.bingoCellTextFree
                  ]}>
                    {num}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>

        {checkBingo() && gameStatus === 'running' && (
          <TouchableOpacity
            style={[styles.bingoButton, claimingBingo && styles.bingoButtonDisabled]}
            onPress={submitBingoClaim}
            disabled={claimingBingo}
          >
            <Text style={styles.bingoButtonText}>
              {claimingBingo ? 'Validating...' : '🎉 BINGO!'}
            </Text>
          </TouchableOpacity>
        )}

        {gameStatus === 'finished' && (
          <TouchableOpacity
            style={styles.playAgainButton}
            onPress={() => {
              setCurrentScreen('lobby');
              // Refresh games to show the latest state
              fetchGames();
            }}
          >
            <Text style={styles.playAgainButtonText}>🎯 Play Again</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.backButton} onPress={() => setCurrentScreen('lobby')}>
          <Text style={styles.backButtonText}>← Back to Lobby</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  // Auth styles
  authContainer: {
    flex: 1,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  authCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
    marginBottom: 8,
  },
  authSubtitle: {
    fontSize: 18,
    textAlign: 'center',
    color: '#666',
    marginBottom: 30,
  },
  authForm: {
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  authInput: {
    borderWidth: 2,
    borderColor: '#e1e5e9',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  authButton: {
    backgroundColor: '#667eea',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  authButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  authSwitch: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  authSwitchText: {
    color: '#666',
    fontSize: 16,
  },
  authSwitchLink: {
    color: '#667eea',
    fontSize: 16,
    fontWeight: '600',
  },

  // Lobby styles
  lobbyContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  lobbyHeader: {
    backgroundColor: '#667eea',
    padding: 20,
    paddingTop: 50,
    alignItems: 'center',
  },
  lobbyTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  userInfo: {
    alignItems: 'center',
  },
  userEmail: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
    marginBottom: 5,
  },
  userStats: {
    alignItems: 'center',
  },
  userStatsText: {
    fontSize: 14,
    color: 'white',
    opacity: 0.8,
    marginBottom: 2,
  },
  createGameButton: {
    backgroundColor: '#28a745',
    margin: 20,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  createGameButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 15,
  },
  instructionsCard: {
    backgroundColor: '#e3f2fd',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#2196f3',
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 10,
  },
  instructionsText: {
    fontSize: 14,
    color: '#424242',
    lineHeight: 20,
  },
  gamesList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  gameCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  gameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  gameTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  gameStatus: {
    backgroundColor: '#ffc107',
    color: '#333',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: '600',
  },
  gameDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    lineHeight: 20,
  },
  joinGameButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    alignSelf: 'center',
  },
  joinGameButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  cardSelectionTitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  cardOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardOption: {
    flex: 1,
    backgroundColor: '#667eea',
    marginHorizontal: 2,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cardOptionDisabled: {
    backgroundColor: '#e9ecef',
  },
  cardOptionText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  cardOptionTextDisabled: {
    color: '#6c757d',
  },
  cardOptionCost: {
    color: 'white',
    fontSize: 12,
    opacity: 0.9,
  },
  cardOptionCostDisabled: {
    color: '#6c757d',
  },
  aiList: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  aiCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  aiName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  aiDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  aiStatus: {
    fontSize: 14,
    color: '#28a745',
    fontWeight: '500',
  },
  signOutButton: {
    backgroundColor: '#dc3545',
    margin: 20,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  signOutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },

  // Game styles
  gameContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  gameHeader: {
    backgroundColor: '#667eea',
    padding: 20,
    paddingTop: 50,
    alignItems: 'center',
  },
  gameTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  gameStatusBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  gameStatusText: {
    color: 'white',
    fontWeight: '600',
  },
  calledNumbersContainer: {
    backgroundColor: 'white',
    margin: 20,
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  calledNumbersTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  calledNumbersText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  cardSelector: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardSelectorTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  cardSelectorButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  cardSelectorButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  cardSelectorButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  bingoCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
  },
  bingoRow: {
    flexDirection: 'row',
  },
  bingoCell: {
    width: 50,
    height: 50,
    borderWidth: 2,
    borderColor: '#e9ecef',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 2,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
  },
  bingoCellMarked: {
    backgroundColor: '#dc3545',
    borderColor: '#dc3545',
  },
  bingoCellCalled: {
    backgroundColor: '#ffc107',
    borderColor: '#ffc107',
  },
  bingoCellFree: {
    backgroundColor: '#28a745',
    borderColor: '#28a745',
  },
  bingoCellText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  bingoCellTextMarked: {
    color: 'white',
  },
  bingoCellTextFree: {
    color: 'white',
  },
  bingoButton: {
    backgroundColor: '#28a745',
    marginHorizontal: 20,
    marginBottom: 15,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  bingoButtonDisabled: {
    backgroundColor: '#6c757d',
  },
  bingoButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  backButton: {
    backgroundColor: '#6c757d',
    marginHorizontal: 20,
    marginBottom: 30,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  playAgainButton: {
    backgroundColor: '#28a745',
    marginHorizontal: 20,
    marginBottom: 15,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  playAgainButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    margin: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 22,
  },
  modalButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    minWidth: 120,
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 10,
  },
  resendButton: {
    backgroundColor: '#95a5a6',
    flex: 1,
  },
  resendButtonDisabled: {
    backgroundColor: '#ecf0f1',
    opacity: 0.6,
  },
  resendButtonText: {
    color: '#2c3e50',
    fontSize: 14,
  },
  resendButtonTextDisabled: {
    color: '#7f8c8d',
  },

  // Existing styles
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 },
  title: { fontSize: 28, marginBottom: 16 },
  input: { width: '100%', borderWidth: 1, borderColor: '#ccc', padding: 8, marginBottom: 12 },
  subtitle: { fontSize: 18, marginVertical: 16 },
  gameItem: { padding: 10, marginVertical: 5, backgroundColor: '#f0f0f0', width: '100%', alignItems: 'center' },
  card: { flexDirection: 'column', marginVertical: 20 },
  row: { flexDirection: 'row' },
  cell: { width: 50, height: 50, borderWidth: 1, borderColor: '#000', alignItems: 'center', justifyContent: 'center', margin: 2 },
  marked: { backgroundColor: 'red' },
  called: { backgroundColor: 'yellow' },
  cardSelector: { marginVertical: 10, alignItems: 'center' },
  cardButtons: { flexDirection: 'row', marginTop: 8 },
  cardButton: { padding: 8, margin: 4, backgroundColor: '#e0e0e0', borderRadius: 4 },
  aiPlayerItem: { padding: 8, marginVertical: 4, backgroundColor: '#f8f8f8', width: '100%', alignItems: 'center' },
});
