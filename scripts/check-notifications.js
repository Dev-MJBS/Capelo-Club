const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey || supabaseKey);

async function checkNotifications() {
  console.log('Checking notifications table...');
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .limit(1);

  if (error) {
    console.log('Error (Table likely missing):', error.message);
  } else {
    console.log('Notifications Table exists.');
  }
}

checkNotifications();
