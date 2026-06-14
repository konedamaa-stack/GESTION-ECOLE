import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://isktjjgmyayargjvyfdt.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlza3RqamdteWF5YXJnanZ5ZmR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4MDAyMTIsImV4cCI6MjA5NTM3NjIxMn0.r3GjiYgDm2z2qL_WNwpNjZVzgxtwvwlX6uz9aVkrTXA";
const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanDuplicates() {
  console.log('Fetching evaluations...');
  const { data: evals, error } = await supabase.from('evaluations').select('*').eq('type', 'Moyenne Globale');
  if (error) {
    console.error(error);
    return;
  }

  const seen = new Set();
  const toDelete = [];

  for (const ev of evals) {
    const key = `${ev.class_id}-${ev.period}-${ev.subject}`;
    if (seen.has(key)) {
      toDelete.push(ev.id);
    } else {
      seen.add(key);
    }
  }

  console.log(`Found ${toDelete.length} duplicates.`);

  if (toDelete.length > 0) {
    console.log('Deleting duplicates...');
    for (const id of toDelete) {
      await supabase.from('evaluations').delete().eq('id', id);
    }
    console.log('Done deleting.');
  } else {
    console.log('No duplicates found.');
  }
}

cleanDuplicates();
