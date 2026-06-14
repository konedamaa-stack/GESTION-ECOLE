import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://isktjjgmyayargjvyfdt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlza3RqamdteWF5YXJnanZ5ZmR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4MDAyMTIsImV4cCI6MjA5NTM3NjIxMn0.r3GjiYgDm2z2qL_WNwpNjZVzgxtwvwlX6uz9aVkrTXA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDelete() {
  const { data: students, error: err1 } = await supabase.from('students').select('id').limit(1);
  if (err1 || !students || students.length === 0) {
    console.log('No students found or error:', err1);
    return;
  }
  const id = students[0].id;
  console.log('Testing delete for student:', id);

  try {
    const res1 = await supabase.from('student_parents').delete().eq('student_id', id);
    if (res1.error) console.log('Err student_parents:', res1.error);
    const res2 = await supabase.from('invoices').delete().eq('student_id', id);
    if (res2.error) console.log('Err invoices:', res2.error);
    const res3 = await supabase.from('absences').delete().eq('student_id', id);
    if (res3.error) console.log('Err absences:', res3.error);
    const res4 = await supabase.from('grades').delete().eq('student_id', id);
    if (res4.error) console.log('Err grades:', res4.error);
    const res5 = await supabase.from('student_documents').delete().eq('student_id', id);
    if (res5.error) console.log('Err student_documents:', res5.error);

    const { data, error } = await supabase.from('students').delete().eq('id', id);
    if (error) {
      console.log('ERROR deleting student:', error);
    } else {
      console.log('Success deleting student');
    }
  } catch (e) {
    console.log('Exception:', e);
  }
}

testDelete();
