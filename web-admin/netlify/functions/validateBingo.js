const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

exports.handler = async function(event) {
  try {
    const body = JSON.parse(event.body || '{}');
    const { card_snapshot, called_numbers_snapshot } = body;
    if (!card_snapshot) return { statusCode: 400, body: 'Missing card_snapshot' };

    // call RPC
    const { data, error } = await supabase.rpc('verify_bingo', { card_snapshot: card_snapshot, called_numbers_snapshot: called_numbers_snapshot || [] });
    if (error) throw error;

    return { statusCode: 200, body: JSON.stringify({ verified: data }) };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: String(err.message) };
  }
};
