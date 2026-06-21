const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf8');
const urlMatch = env.match(/VITE_SUPABASE_URL=(.*)/);
const keyMatch = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/);

const supabase = createClient(urlMatch[1].trim(), keyMatch[1].trim());

async function test() {
  const { data: students } = await supabase.from('students').select('*').limit(1);
  if (!students || students.length === 0) return console.log("No students");
  const studentId = students[0].id;
  const classId = students[0].class_id;
  const schoolId = students[0].school_id;

  // 1. Insert evaluation
  const { data: evals, error: evalErr } = await supabase.from('evaluations').insert([{
    class_id: classId,
    subject: "Mathématiques",
    period: "1er Trimestre",
    name: "Moyenne Globale",
    type: "Moyenne Globale",
    date: new Date().toISOString().split('T')[0],
    max_score: 20,
    school_id: schoolId
  }]).select();

  if (evalErr) {
    console.error("EVAL ERROR:", evalErr);
    return;
  }
  
  const evId = evals[0].id;
  console.log("Created Eval:", evId);

  // 2. Upsert grade
  const { error: gradeErr } = await supabase.from('grades').upsert([{
    evaluation_id: evId,
    student_id: studentId,
    score: 15.5,
    school_id: schoolId
  }], { onConflict: 'evaluation_id,student_id' });

  if (gradeErr) {
    console.error("GRADE ERROR:", gradeErr);
  } else {
    console.log("GRADE UPSERT SUCCESS!");
  }
}

test();
