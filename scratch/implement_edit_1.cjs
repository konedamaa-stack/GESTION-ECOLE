const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '../src/App.tsx');
let content = fs.readFileSync(file, 'utf8');

// 1. Add states
content = content.replace(
  "const [settingsData, setSettingsData] = useState<any | null>(null);",
  "const [settingsData, setSettingsData] = useState<any | null>(null);\n  const [editEntity, setEditEntity] = useState<any>(null);\n  const [parentsData, setParentsData] = useState<any[]>([]);"
);

// 2. Add fetchParents
const fetchParentsStr = `
  const fetchParents = async () => {
    const { data, error } = await supabase.from('parents').select('*').order('last_name', { ascending: true });
    if (data) setParentsData(data);
  };
`;
content = content.replace("const fetchData = async () => {", fetchParentsStr + "\n  const fetchData = async () => {");

// 3. Call fetchParents
content = content.replace("fetchTeachers();\n      fetchEmployees();", "fetchTeachers();\n      fetchEmployees();\n      fetchParents();");

// 4. Update closeModal
content = content.replace(
  "const closeModal = () => {\n    setActiveModal(null);\n  };",
  "const closeModal = () => {\n    setActiveModal(null);\n    setEditEntity(null);\n  };"
);

// 5. Update handleFormSubmit for student
const studentInsertStr = "if (activeModal === 'student') {";
const studentUpdateStr = `if (activeModal === 'student') {
        if (editEntity) {
          const studentUpdate: any = {
            first_name: formData.get('first_name'),
            last_name: formData.get('last_name'),
            class_id: formData.get('class_id'),
            birth_date: formData.get('birth_date')
          };
          if (formData.get('password')) studentUpdate.password = formData.get('password');
          const { error } = await supabase.from('students').update(studentUpdate).eq('id', editEntity.id);
          if (error) throw error;
          alert("Élève mis à jour !");
          fetchStudents();
          closeModal();
          return;
        }`;
content = content.replace(studentInsertStr, studentUpdateStr);

// 6. Update handleFormSubmit for teacher
const teacherInsertStr = "else if (activeModal === 'teacher') {";
const teacherUpdateStr = `else if (activeModal === 'teacher') {
        if (editEntity) {
          const teacherUpdate: any = {
            first_name: formData.get('first_name'),
            last_name: formData.get('last_name'),
            subject: formData.get('subject'),
            phone: formData.get('phone'),
            email: formData.get('email')
          };
          if (formData.get('password')) teacherUpdate.password = formData.get('password');
          const { error } = await supabase.from('teachers').update(teacherUpdate).eq('id', editEntity.id);
          if (error) throw error;
          alert("Professeur mis à jour !");
          fetchTeachers();
          closeModal();
          return;
        }`;
content = content.replace(teacherInsertStr, teacherUpdateStr);

// 7. Update handleFormSubmit for parent
const parentInsertStr = `else if (activeModal === 'parent') {
        alert("Le parent a été ajouté avec succès !");
      }`;
const parentUpdateStr = `else if (activeModal === 'parent') {
        const parentData = {
          first_name: formData.get('first_name'),
          last_name: formData.get('last_name'),
          phone: formData.get('phone'),
          email: formData.get('email')
        };
        if (editEntity) {
          const { error } = await supabase.from('parents').update(parentData).eq('id', editEntity.id);
          if (error) throw error;
          alert("Parent mis à jour avec succès !");
        } else {
          const { error } = await supabase.from('parents').insert([parentData]);
          if (error) throw error;
          alert("Le parent a été ajouté avec succès !");
        }
        fetchParents();
      }`;
content = content.replace(parentInsertStr, parentUpdateStr);

fs.writeFileSync(file, content);
console.log('Script 1 done');
