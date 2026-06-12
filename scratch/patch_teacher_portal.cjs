const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/components/TeacherPortal.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Fix 1: Filter fetches by school_id
content = content.replace(
  "const { data: classes } = await supabase.from('classes').select('*');",
  "const { data: classes } = await supabase.from('classes').select('*').eq('school_id', session.school_id);"
);
content = content.replace(
  ".eq('subject', session.subject);",
  ".eq('subject', session.subject).eq('school_id', session.school_id);"
);
content = content.replace(
  "const { data: students } = await supabase.from('students').select('*');",
  "const { data: students } = await supabase.from('students').select('*').eq('school_id', session.school_id);"
);
content = content.replace(
  "const { data: grades } = await supabase.from('grades').select('*');",
  "const { data: grades } = await supabase.from('grades').select('*').eq('school_id', session.school_id);"
);

// Fix 2: Add type input to the form
const typeSelectHtml = `                <div className="form-group">
                  <label>{t('admin.modals.eval_type', "Type d'évaluation")}</label>
                  <select name="type" className="input-field" required>
                    <option value="Devoir de classe">Devoir de classe</option>
                    <option value="Devoir à la maison">Devoir à la maison</option>
                    <option value="Composition">Composition</option>
                    <option value="Examen blanc">Examen blanc</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>{t('teacher.date', "Date")}</label>`;
                  
content = content.replace(
  /<div className="form-group">\s*<label>\{t\('teacher\.date', "Date"\)\}<\/label>/,
  typeSelectHtml
);

// Fix 3: Insert logic
const insertLogic = `    const newEval = {
      name: formData.get('name'),
      subject: session.subject,
      class_id: formData.get('class_id'),
      date: formData.get('date'),
      period: formData.get('period'),
      type: formData.get('type'),
      school_id: session.school_id,
    };`;
    
content = content.replace(
  /const newEval = \{[\s\S]*?period: formData\.get\('period'\),\s*\};/,
  insertLogic
);

fs.writeFileSync(filePath, content);
console.log("TeacherPortal patched successfully.");
