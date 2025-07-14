import { createClient } from '@supabase/supabase-js';

// load from your env
const supabaseUrl = "https://ikzofffjwkqpiwrqsttb.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlrem9mZmZqd2txcGl3cnFzdHRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3NDkyNzAsImV4cCI6MjA2NzMyNTI3MH0.dHR1DlUQQ4W4pQHkxsw5MmI2f1QOgcCRnZ4UkC0DHyE";

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