const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf8');
const SUPABASE_URL = envFile.match(/VITE_SUPABASE_URL=(.*)/)[1].trim();
const SUPABASE_ANON_KEY = envFile.match(/VITE_SUPABASE_ANON_KEY=(.*)/)[1].trim();

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function check() {
  const { data: admins } = await supabase.from('school_admins').select('email, schools(name, id)');
  console.log(admins);
}

check();
