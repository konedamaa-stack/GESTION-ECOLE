const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const appPath = path.join(__dirname, '../src/App.tsx');

// 1. Restore App.tsx
execSync('git restore src/App.tsx', { cwd: path.join(__dirname, '..') });

let content = fs.readFileSync(appPath, 'utf8');

// 2. Add TrendingDown Icon
content = content.replace(
  `TrendingUp: () => <svg className="stat-icon" style={{color: 'var(--accent-color)', background: 'rgba(16, 185, 129, 0.1)'}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" strokeLinecap="round" strokeLinejoin="round"/><polyline points="17 6 23 6 23 12" strokeLinecap="round" strokeLinejoin="round"/></svg>,`,
  `TrendingUp: () => <svg className="stat-icon" style={{color: 'var(--accent-color)', background: 'rgba(16, 185, 129, 0.1)'}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" strokeLinecap="round" strokeLinejoin="round"/><polyline points="17 6 23 6 23 12" strokeLinecap="round" strokeLinejoin="round"/></svg>,\n  TrendingDown: () => <svg className="stat-icon" style={{color: 'var(--danger-color, #ef4444)', background: 'rgba(239, 68, 68, 0.1)'}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6" strokeLinecap="round" strokeLinejoin="round"/><polyline points="17 18 23 18 23 12" strokeLinecap="round" strokeLinejoin="round"/></svg>,`
);

// 3. Fix teacher subject array join (update both places)
content = content.replace(
  `subject: formData.get('subject'),\n            phone: formData.get('phone'),\n            email: formData.get('email')\n          };`,
  `subject: formData.getAll('subject').join(', '),\n            phone: formData.get('phone'),\n            email: formData.get('email')\n          };`
);
content = content.replace(
  `subject: formData.get('subject'),\n          phone: formData.get('phone'),\n          email: formData.get('email'),\n          matricule: teacherMatricule,`,
  `subject: formData.getAll('subject').join(', '),\n          phone: formData.get('phone'),\n          email: formData.get('email'),\n          matricule: teacherMatricule,`
);

// 4. Add Total Dépenses Stat Card
content = content.replace(
  `        <div className="stat-card delay-400">
          <div className="stat-header">
            <span className="stat-label">Solde Caisse</span>`,
  `        <div className="stat-card delay-350">
          <div className="stat-header">
            <span className="stat-label">Total Dépenses</span>
            <Icons.TrendingDown />
          </div>
          <div className="stat-value" style={{color: '#ef4444'}}>
            {formatNum(
              (expensesData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0) +
              (teacherPaymentsData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0) +
              (employeePaymentsData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0)
            )}
          </div>
          <div className="stat-trend trend-down">
            F
          </div>
        </div>

        <div className="stat-card delay-400">
          <div className="stat-header">
            <span className="stat-label">Solde Caisse</span>`
);

// 5. Inject Photo Upload Logic in handleFormSubmit
content = content.replace(
  `      if (activeModal === 'student') {
        if (editEntity) {
          const studentUpdate: any = {
            first_name: formData.get('first_name'),
            last_name: formData.get('last_name'),
            class_id: formData.get('class_id'),
            birth_date: formData.get('birth_date'),
            status: formData.get('status') || 'Inscrit',
            tuition_fee: formData.get('tuition_fee') ? parseInt(formData.get('tuition_fee') as string) : null
          };`,
  `      if (activeModal === 'student') {
        let uploadedPhotoUrl = editEntity?.photo_url || null;
        const photoFile = formData.get('photo') as File | null;
        if (photoFile && photoFile.size > 0) {
          const fileExt = photoFile.name.split('.').pop();
          const fileName = \`\${Math.random().toString(36).substring(2)}.\${fileExt}\`;
          const { error: uploadError } = await supabase.storage.from('photos_eleves').upload(\`public/\${fileName}\`, photoFile);
          if (!uploadError) {
            const { data: { publicUrl } } = supabase.storage.from('photos_eleves').getPublicUrl(\`public/\${fileName}\`);
            uploadedPhotoUrl = publicUrl;
          }
        }

        if (editEntity) {
          const studentUpdate: any = {
            first_name: formData.get('first_name'),
            last_name: formData.get('last_name'),
            class_id: formData.get('class_id'),
            birth_date: formData.get('birth_date'),
            status: formData.get('status') || 'Inscrit',
            photo_url: uploadedPhotoUrl,
            tuition_fee: formData.get('tuition_fee') ? parseInt(formData.get('tuition_fee') as string) : null
          };`
);

content = content.replace(
  `          birth_date: formData.get('birth_date'),
          email: formData.get('email'),
          password: password,
          tuition_fee: formData.get('tuition_fee') ? parseInt(formData.get('tuition_fee') as string) : null
        };
        const { data: studentData, error: studentError } = await supabase.from('students').insert([{...student, school_id: currentSchoolId}]).select();`,
  `          birth_date: formData.get('birth_date'),
          email: formData.get('email'),
          password: password,
          photo_url: uploadedPhotoUrl,
          tuition_fee: formData.get('tuition_fee') ? parseInt(formData.get('tuition_fee') as string) : null
        };
        const { data: studentData, error: studentError } = await supabase.from('students').insert([{...student, school_id: currentSchoolId}]).select();`
);

// 6. Inject the Photo Input in the form UI
content = content.replace(
  `                  <div className="form-grid">
                    <div className="form-group">
                      <label>Matricule (optionnel)</label>`,
  `                  <div className="form-grid">
                    <div className="form-group">
                      <label>{t('admin.modals.photo', 'Photo de profil')}</label>
                      <input type="file" name="photo" accept="image/*" className="form-input" />
                    </div>
                  </div>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Matricule (optionnel)</label>`
);

fs.writeFileSync(appPath, content);
console.log("App.tsx fixed successfully!");
