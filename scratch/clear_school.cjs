
const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://isktjjgmyayargjvyfdt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlza3RqamdteWF5YXJnanZ5ZmR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4MDAyMTIsImV4cCI6MjA5NTM3NjIxMn0.r3GjiYgDm2z2qL_WNwpNjZVzgxtwvwlX6uz9aVkrTXA';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: admins, error } = await supabase.from('admin_users').select('*').eq('email', 'solution.netlibanais@gmail.com');
  if (error) { console.error('Error:', error); return; }
  console.log('Admins:', admins);
}
run();
