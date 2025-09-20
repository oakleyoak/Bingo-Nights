const { createClient } = require('@supabase/supabase-js');

// This example Netlify function shows how a server-side action (calling a number) might be performed.
// Configure SUPABASE_SERVICE_ROLE_KEY in your Netlify environment variables (never commit it).

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

exports.handler = async function(event) {
  try {
    const { game_id, number, called_by } = JSON.parse(event.body);
    if (!game_id || !number) return { statusCode: 400, body: 'Missing game_id or number' };

    // Insert called number (authoritative)
    const { data, error } = await supabase.from('called_numbers').insert([{ game_id, number, called_by }]);
    if (error) throw error;

    // Optionally update game state
    await supabase.from('games').update({ status: 'running' }).eq('id', game_id);

    return { statusCode: 200, body: JSON.stringify({ ok: true, data }) };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: String(err.message) };
  }
};
