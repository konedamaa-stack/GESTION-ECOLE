const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Update fetchParents to include students
content = content.replace(
  "const { data } = await supabase.from('parents').select('*').eq('school_id', currentSchoolId || '');",
  "const { data } = await supabase.from('parents').select('*, student_parents(students(first_name, last_name))').eq('school_id', currentSchoolId || '');"
);

// 2. Update Parents table to show children
const oldParentTableChild = "<td style={{padding: '16px 0'}}>-</td>";
const newParentTableChild = "<td style={{padding: '16px 0'}}>{row.student_parents?.map((sp: any) => sp.students?.first_name + ' ' + sp.students?.last_name).filter(Boolean).join(', ') || '-'}</td>";
content = content.replace(oldParentTableChild, newParentTableChild);

// 3. Update student creation logic to use existing parent if phone matches
const oldParentCreation = `
        if (formData.get('parent_first_name') && formData.get('parent_last_name')) {
          const parent = {
            first_name: formData.get('parent_first_name'),
            last_name: formData.get('parent_last_name'),
            phone: formData.get('parent_phone'),
            email: formData.get('parent_email'),
          };
          const { data: parentData, error: parentError } = await supabase.from('parents').insert([{...parent, school_id: currentSchoolId}]).select();
          if (!parentError && parentData && parentData.length > 0) {
            await supabase.from('student_parents').insert([{
              student_id: newStudentId,
              parent_id: parentData[0].id,
              relation_type: 'Parent'
            }]);
          }
        }`;

const newParentCreation = `
        if (formData.get('parent_first_name') && formData.get('parent_last_name')) {
          const parentPhone = formData.get('parent_phone');
          let finalParentId = null;

          if (parentPhone) {
            const { data: existingParents } = await supabase.from('parents')
              .select('id')
              .eq('phone', parentPhone)
              .eq('school_id', currentSchoolId || '');
            if (existingParents && existingParents.length > 0) {
              finalParentId = existingParents[0].id;
            }
          }

          if (!finalParentId) {
            const parent = {
              first_name: formData.get('parent_first_name'),
              last_name: formData.get('parent_last_name'),
              phone: formData.get('parent_phone'),
              email: formData.get('parent_email'),
            };
            const { data: parentData, error: parentError } = await supabase.from('parents').insert([{...parent, school_id: currentSchoolId}]).select();
            if (!parentError && parentData && parentData.length > 0) {
              finalParentId = parentData[0].id;
            }
          }

          if (finalParentId) {
            await supabase.from('student_parents').insert([{
              student_id: newStudentId,
              parent_id: finalParentId,
              relation_type: 'Parent'
            }]);
          }
        }`;

content = content.replace(oldParentCreation, newParentCreation);

fs.writeFileSync('src/App.tsx', content);
console.log('App.tsx patched to support multiple students per parent.');
