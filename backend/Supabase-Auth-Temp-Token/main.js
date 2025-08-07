import { createClient } from '@supabase/supabase-js';

// load from your env
const supabaseUrl = "https://ikzofffjwkqpiwrqsttb.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlrem9mZmZqd2txcGl3cnFzdHRiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTc0OTI3MCwiZXhwIjoyMDY3MzI1MjcwfQ.AATlPU2JEX5tmpfeu-muw25XiX07l680g-aDZ-2pOzg";

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