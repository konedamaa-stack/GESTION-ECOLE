const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://isktjjgmyayargjvyfdt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlza3RqamdteWF5YXJnanZ5ZmR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4MDAyMTIsImV4cCI6MjA5NTM3NjIxMn0.r3GjiYgDm2z2qL_WNwpNjZVzgxtwvwlX6uz9aVkrTXA';
const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanStudentParents() {
  const { error } = await supabase.from('student_parents').delete().neq('student_id', '00000000-0000-0000-0000-000000000000');
  if (error) {
    console.error('Erreur lors du nettoyage de student_parents:', error.message);
  } else {
    console.log('Table student_parents nettoyée avec succès.');
  }
}

cleanStudentParents();
