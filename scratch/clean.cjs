const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://isktjjgmyayargjvyfdt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlza3RqamdteWF5YXJnanZ5ZmR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4MDAyMTIsImV4cCI6MjA5NTM3NjIxMn0.r3GjiYgDm2z2qL_WNwpNjZVzgxtwvwlX6uz9aVkrTXA';
const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanDB() {
  const tables = [
    'grades',
    'evaluations',
    'absences',
    'invoices',
    'transactions',
    'student_documents',
    'schedules',
    'student_parents',
    'parents',
    'students',
    'employees',
    'teachers'
  ];

  console.log('Début du nettoyage de la base de données...');

  for (const table of tables) {
    console.log(`Nettoyage de la table ${table}...`);
    // Delete all records where created_at is not null (which is true for all records)
    const { data, error } = await supabase.from(table).delete().neq('created_at', '1970-01-01T00:00:00Z');
    
    if (error) {
      console.error(`Erreur lors du nettoyage de ${table}:`, error.message);
    } else {
      console.log(`Table ${table} nettoyée avec succès.`);
    }
  }

  console.log('Nettoyage terminé.');
}

cleanDB();
