import { createClient } from '@supabase/supabase-js';

// load from your env
const supabaseUrl = "https://ikzofffjwkqpiwrqsttb.supabase.co";
const supabaseKey = "";

const supabase = createClient(supabaseUrl, supabaseKey);

async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google'
  });

  if (error) {
    console.error('Error:', error.message);
    return;
  }

  console.log('Visit this URL to authenticate with Google:');
  console.log(data.url);
}

signInWithGoogle();