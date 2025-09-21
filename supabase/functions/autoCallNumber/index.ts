import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { game_id } = await req.json()

    if (!game_id) {
      return new Response(JSON.stringify({ error: 'Missing game_id' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Get a random unused number for this game
    // First get all called numbers for this game
    const { data: calledNumbers, error: calledError } = await supabaseClient
      .from('called_numbers')
      .select('number')
      .eq('game_id', game_id);

    if (calledError) throw calledError;

    // Get all possible numbers 1-75
    const allNumbers = Array.from({ length: 75 }, (_, i) => i + 1);
    const calledNums = calledNumbers.map(cn => cn.number);
    
    // Filter out called numbers
    const availableNumbers = allNumbers.filter(num => !calledNums.includes(num));
    
    if (availableNumbers.length === 0) {
      return new Response(JSON.stringify({ error: 'No numbers available' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Pick random number from available numbers
    const randomIndex = Math.floor(Math.random() * availableNumbers.length);
    const randomNumber = availableNumbers[randomIndex];

    // Call the number using the existing callNumber logic
    const { data, error } = await supabaseClient
      .from('called_numbers')
      .insert([{
        game_id,
        number: randomNumber,
        called_by: null // Automated call
      }])

    if (error) throw error

    // Update game status to running
    await supabaseClient
      .from('games')
      .update({ status: 'running' })
      .eq('id', game_id)

    return new Response(JSON.stringify({
      ok: true,
      number_called: randomNumber,
      data
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})