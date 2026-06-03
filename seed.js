import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://isktjjgmyayargjvyfdt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlza3RqamdteWF5YXJnanZ5ZmR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4MDAyMTIsImV4cCI6MjA5NTM3NjIxMn0.r3GjiYgDm2z2qL_WNwpNjZVzgxtwvwlX6uz9aVkrTXA';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function seed() {
  console.log('Seeding started...');
  
  // Get classes
  const { data: classes, error: classesError } = await supabase.from('classes').select('*');
  if (classesError) return console.error('Error fetching classes:', classesError);
  
  if (!classes || classes.length === 0) {
      console.log('No classes found in DB. Make sure initial migrations are applied.');
      return;
  }
  
  // Get existing students
  let { data: students, error: studentsError } = await supabase.from('students').select('*');
  if (studentsError) return console.error('Error fetching students:', studentsError);
  
  // Insert students if none exist
  if (!students || students.length < 3) {
      console.log('Inserting mock students...');
      const newStudents = [
          { first_name: 'Karim', last_name: 'N\'Diaye', matricule: 'ELV-2026-1001', class_id: classes[0].id, birth_date: '2008-05-12' },
          { first_name: 'Aïssatou', last_name: 'Fall', matricule: 'ELV-2026-1002', class_id: classes[0].id, birth_date: '2009-02-23' },
          { first_name: 'Thomas', last_name: 'Dubois', matricule: 'ELV-2026-1003', class_id: classes[1].id, birth_date: '2010-11-05' }
      ];
      const { error: insertError } = await supabase.from('students').insert(newStudents);
      if (insertError) return console.error('Error inserting students:', insertError);
      
      const { data: refreshedStudents } = await supabase.from('students').select('*');
      students = refreshedStudents;
  }
  
  // Insert absences
  console.log('Inserting mock absences...');
  const newAbsences = [
      { student_id: students[0].id, absence_date: new Date().toISOString().split('T')[0], duration: 'Journée entière', motif: 'Non justifié', comments: 'Alerte décrochage' },
      { student_id: students[1].id, absence_date: new Date().toISOString().split('T')[0], duration: 'Matinée', motif: 'Maladie', comments: 'Certificat à fournir' },
      { student_id: students[2].id, absence_date: new Date().toISOString().split('T')[0], duration: '1 heure (Retard)', motif: 'Retard de transport', comments: 'Panne de bus' }
  ];
  
  const { error: absError } = await supabase.from('absences').insert(newAbsences);
  if (absError) return console.error('Error inserting absences:', absError);
  
  console.log('Seeding completed successfully!');
}

seed();
