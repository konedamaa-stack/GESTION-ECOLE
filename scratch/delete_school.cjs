const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf8');
const SUPABASE_URL = envFile.match(/VITE_SUPABASE_URL=(.*)/)[1].trim();
const SUPABASE_ANON_KEY = envFile.match(/VITE_SUPABASE_ANON_KEY=(.*)/)[1].trim();

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function findAndDelete() {
  // Try to find the school where an admin has this email
  const { data: adminData } = await supabase.from('school_admins').select('*, schools(*)').eq('email', 'solution.netlibanais@gmail.com');
  
  if (!adminData || adminData.length === 0) {
    console.log("Admin not found with this email.");
    return;
  }
  
  const schoolId = adminData[0].school_id;
  const schoolName = adminData[0].schools?.name;
  console.log(`Found school: ${schoolName} (${schoolId})`);

  // To delete it via client, we must delete everything referencing it.
  const tables = [
    'admin_invitations',
    'school_admins',
    'employee_payments',
    'teacher_payments',
    'loans',
    'expenses',
    'invoices',
    'attendance',
    'grades',
    'student_parents',
    'students',
    'teacher_subjects',
    'teachers',
    'subjects',
    'classes',
    'settings'
  ];

  for (const table of tables) {
    if (table === 'student_parents') {
      const { data: students } = await supabase.from('students').select('id').eq('school_id', schoolId);
      if (students && students.length > 0) {
        const studentIds = students.map(s => s.id);
        const { error } = await supabase.from('student_parents').delete().in('student_id', studentIds);
        console.log(`Deleted student_parents: ${error ? error.message : 'OK'}`);
      }
    } else {
      const { error } = await supabase.from(table).delete().eq('school_id', schoolId);
      console.log(`Deleted ${table}: ${error ? error.message : 'OK'}`);
    }
  }

  // Delete school
  const { error } = await supabase.from('schools').delete().eq('id', schoolId);
  console.log(`Deleted school: ${error ? error.message : 'OK'}`);
}

findAndDelete();
