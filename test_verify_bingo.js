// Simple test for verify_bingo function
// Run with: node test_verify_bingo.js
//
// Required environment variables:
// SUPABASE_URL - Your Supabase project URL
// SUPABASE_ANON_KEY - Your Supabase anon/public key

require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');

// Get environment variables
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

// Validate required environment variables
if (!SUPABASE_URL) {
  console.error('❌ Error: SUPABASE_URL environment variable is required');
  console.error('Set it with: export SUPABASE_URL=https://your-project.supabase.co');
  console.error('Or create a .env file with: SUPABASE_URL=https://your-project.supabase.co');
  process.exit(1);
}

if (!SUPABASE_ANON_KEY) {
  console.error('❌ Error: SUPABASE_ANON_KEY environment variable is required');
  console.error('Get your anon key from: https://supabase.com/dashboard/project/YOUR_PROJECT/settings/api');
  console.error('Or create a .env file with: SUPABASE_ANON_KEY=your-key');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testVerifyBingo() {
  console.log('🧪 Testing verify_bingo database function...');
  console.log('📍 Supabase URL:', SUPABASE_URL);

  const cardSnapshot = {
    numbers: [
      [1, 2, 3, 4, 5],
      [6, 7, 8, 9, 10],
      [11, 12, 'FREE', 13, 14],
      [15, 16, 17, 18, 19],
      [20, 21, 22, 23, 24]
    ],
    marked: [
      [true, true, true, true, true], // row bingo
      [false, false, false, false, false],
      [false, false, true, false, false],
      [false, false, false, false, false],
      [false, false, false, false, false]
    ]
  };

  const calledNumbers = [1, 2, 3, 4, 5];

  try {
    console.log('📤 Calling verify_bingo RPC function...');
    const { data, error } = await supabase.rpc('verify_bingo', {
      card_snapshot: cardSnapshot,
      called_numbers_snapshot: calledNumbers
    });

    if (error) {
      console.error('❌ Database error:', error);
      return;
    }

    console.log('✅ Bingo verification result:', data);
    if (data === true) {
      console.log('🎉 Test passed! Bingo correctly detected.');
    } else {
      console.log('⚠️  Test result unexpected. Expected true, got:', data);
    }
  } catch (err) {
    console.error('❌ Test failed with exception:', err.message);
  }
}

testVerifyBingo();