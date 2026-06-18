const fs = require('fs');
const path = require('path');

const targetFile = path.resolve(__dirname, '../src/App.tsx');
let content = fs.readFileSync(targetFile, 'utf8');
let changed = false;

// 1. Prevent double submit in handleFormSubmit
const findHandleSubmit = "  const handleFormSubmit = async (e: any) => {\n    e.preventDefault();\n    const formData = new FormData(e.target);\n    \n    try {";
if (content.includes(findHandleSubmit)) {
  const replaceHandleSubmit = `  const handleFormSubmit = async (e: any) => {
    e.preventDefault();
    const submitBtn = e.nativeEvent?.submitter;
    let originalText = '';
    if (submitBtn) {
      if (submitBtn.disabled) return;
      submitBtn.disabled = true;
      originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = 'Patientez...';
    }
    const formData = new FormData(e.target);
    
    try {`;
  content = content.replace(findHandleSubmit, replaceHandleSubmit);
  
  // also replace the end of it
  const findCatchEnd = "    } catch (error: any) {\n      alert(\"Erreur: \" + error.message);\n    }\n  };";
  const replaceCatchEnd = `    } catch (error: any) {
      alert("Erreur: " + error.message);
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }
    }
  };`;
  content = content.replace(findCatchEnd, replaceCatchEnd);
  changed = true;
  console.log("Patched handleFormSubmit");
}

// 2. Allow matricule modification in student update
const findStudentUpdate = "            birth_date: formData.get('birth_date'),\n            status: formData.get('status') || 'Inscrit',\n            tuition_fee: formData.get('tuition_fee') ? parseInt(formData.get('tuition_fee') as string) : null\n          };";
if (content.includes(findStudentUpdate)) {
  const replaceStudentUpdate = `            birth_date: formData.get('birth_date'),
            status: formData.get('status') || 'Inscrit',
            tuition_fee: formData.get('tuition_fee') ? parseInt(formData.get('tuition_fee') as string) : null
          };
          if (formData.get('matricule')) studentUpdate.matricule = formData.get('matricule');`;
  content = content.replace(findStudentUpdate, replaceStudentUpdate);
  changed = true;
  console.log("Patched student update");
}

// 3. Use input matricule in student insert
const findStudentInsert = "        const matricule = 'ELV' + new Date().getFullYear() + Math.floor(Math.random() * 10000);\n        const password = formData.get('password') || 'passer123';";
if (content.includes(findStudentInsert)) {
  const replaceStudentInsert = "        const matricule = formData.get('matricule') || 'ELV' + new Date().getFullYear() + Math.floor(Math.random() * 10000);\n        const password = formData.get('password') || 'passer123';";
  content = content.replace(findStudentInsert, replaceStudentInsert);
  changed = true;
  console.log("Patched student insert");
}

// 4. Add matricule input to the student form HTML
const findFormHtml = `                    <div className="form-group">
                      <label>{t('admin.modals.first_name', 'Prénom(s)')}</label>
                      <input type="text" name="first_name" className="form-input" required defaultValue={editEntity?.first_name || ""} />
                    </div>
                  </div>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>{t('admin.modals.birth_date', 'Date de Naissance')}</label>`;
if (content.includes(findFormHtml)) {
  const replaceFormHtml = `                    <div className="form-group">
                      <label>{t('admin.modals.first_name', 'Prénom(s)')}</label>
                      <input type="text" name="first_name" className="form-input" required defaultValue={editEntity?.first_name || ""} />
                    </div>
                  </div>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Matricule (optionnel)</label>
                      <input type="text" name="matricule" className="form-input" placeholder="Généré auto si vide" defaultValue={editEntity?.matricule || ""} />
                    </div>
                    <div className="form-group">
                      <label>{t('admin.modals.birth_date', 'Date de Naissance')}</label>`;
  content = content.replace(findFormHtml, replaceFormHtml);
  changed = true;
  console.log("Patched student form HTML");
} else {
  console.log("Could not find student form HTML");
}

if (changed) {
  fs.writeFileSync(targetFile, content);
  console.log("App.tsx saved successfully!");
}
