const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://isktjjgmyayargjvyfdt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlza3RqamdteWF5YXJnanZ5ZmR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4MDAyMTIsImV4cCI6MjA5NTM3NjIxMn0.r3GjiYgDm2z2qL_WNwpNjZVzgxtwvwlX6uz9aVkrTXA';
const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanClasses() {
  console.log('Suppression des classes...');
  
  // class_subjects depends on classes, so we might need to delete class_subjects first if there is no cascade
  console.log('Suppression préalable de class_subjects (coefficients)...');
  await supabase.from('class_subjects').delete().neq('created_at', '1970-01-01T00:00:00Z');

  const { error } = await supabase.from('classes').delete().neq('created_at', '1970-01-01T00:00:00Z');
  
  if (error) {
    console.error('Erreur lors du nettoyage de classes:', error.message);
  } else {
    console.log('Table classes nettoyée avec succès.');
  }
}

cleanClasses();
