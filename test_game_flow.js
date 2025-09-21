// Test script for automated bingo game functionality
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://oluqgthjdyqffrrbnrls.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sdXFndGhqZHlxZmZycmJucmxzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzNjU1OTksImV4cCI6MjA3Mzk0MTU5OX0.sfYjHwq9zLb3u8wpX-TiA596q3z0tGRLu66hFJ_cUj4';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testGameFlow() {
  console.log('🧪 Testing Automated Bingo Game Flow...\n');

  try {
    // 1. Test creating a game (without host constraint for testing)
    console.log('1️⃣ Creating a test game...');
    const { data: game, error: gameError } = await supabase
      .from('games')
      .insert([{ title: 'Test Game' }])  // Remove host constraint for testing
      .select()
      .single();

    if (gameError) throw gameError;
    console.log('✅ Game created:', game.id);

    // 2. Test automated number calling
    console.log('\n2️⃣ Testing automated number calling...');
    try {
      const { data: numberResult, error: numberError } = await supabase.functions.invoke('autoCallNumber', {
        body: { game_id: game.id }
      });

      if (numberError) {
        console.error('Function error details:', JSON.stringify(numberError, null, 2));
        throw numberError;
      }
      console.log('✅ Number called:', numberResult.number_called);
    } catch (error) {
      console.error('Function call failed:', error.message);
      // Try to get more details from the error
      if (error.context && error.context.body) {
        try {
          const body = await error.context.body.getReader().read();
          const errorText = new TextDecoder().decode(body.value);
          console.error('Response body:', errorText);
        } catch (e) {
          console.error('Could not read response body');
        }
      }
      throw error;
    }

    // 3. Test calling another number
    console.log('\n3️⃣ Calling second number...');
    const { data: numberResult2, error: numberError2 } = await supabase.functions.invoke('autoCallNumber', {
      body: { game_id: game.id }
    });

    if (numberError2) throw numberError2;
    console.log('✅ Second number called:', numberResult2.number_called);

    // 4. Test calling a third number
    console.log('\n4️⃣ Calling third number...');
    const { data: numberResult3, error: numberError3 } = await supabase.functions.invoke('autoCallNumber', {
      body: { game_id: game.id }
    });

    if (numberError3) throw numberError3;
    console.log('✅ Third number called:', numberResult3.number_called);

    // 5. Test that numbers are unique
    console.log('\n5️⃣ Verifying number uniqueness...');
    const { data: calledNumbers, error: calledError } = await supabase
      .from('called_numbers')
      .select('number')
      .eq('game_id', game.id);

    if (calledError) throw calledError;

    const numbers = calledNumbers.map(cn => cn.number);
    const uniqueNumbers = [...new Set(numbers)];

    if (numbers.length === uniqueNumbers.length) {
      console.log('✅ All called numbers are unique:', numbers);
    } else {
      throw new Error('Duplicate numbers detected!');
    }

    console.log('\n🎉 All automated calling tests passed!');

    // Cleanup
    console.log('\n🧹 Cleaning up test data...');
    await supabase.from('called_numbers').delete().eq('game_id', game.id);
    await supabase.from('games').delete().eq('id', game.id);
    console.log('✅ Test data cleaned up.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testGameFlow();