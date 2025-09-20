// Simple test for verify_bingo function
// Run with: node test_verify_bingo.js

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://oluqgthjdyqffrrbnrls.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'your-anon-key';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testVerifyBingo() {
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
    const { data, error } = await supabase.rpc('verify_bingo', {
      card_snapshot: cardSnapshot,
      called_numbers_snapshot: calledNumbers
    });

    if (error) {
      console.error('Error:', error);
    } else {
      console.log('Bingo verified:', data); // Should be true
    }
  } catch (err) {
    console.error('Test failed:', err);
  }
}

testVerifyBingo();