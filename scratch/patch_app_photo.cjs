const fs = require('fs');

let appTsx = fs.readFileSync('c:/Users/koned/Mon Drive/SaaS/ETABLISEMENT/src/App.tsx', 'utf8');

// 1. Add file upload logic in handleFormSubmit
const uploadLogic = `
        let uploadedPhotoUrl = editEntity?.photo_url || null;
        const photoFile = formData.get('photo');
        if (photoFile && photoFile.size > 0) {
          const fileExt = photoFile.name.split('.').pop();
          const fileName = \`\${Math.random().toString(36).substring(2)}.\${fileExt}\`;
          const { error: uploadError } = await supabase.storage.from('photos_eleves').upload(\`public/\${fileName}\`, photoFile);
          if (!uploadError) {
            const { data: { publicUrl } } = supabase.storage.from('photos_eleves').getPublicUrl(\`public/\${fileName}\`);
            uploadedPhotoUrl = publicUrl;
          }
        }
`;

appTsx = appTsx.replace(
  `if (activeModal === 'student') {\n        if (editEntity) {`,
  `if (activeModal === 'student') {\n${uploadLogic}\n        if (editEntity) {`
);

appTsx = appTsx.replace(
  `status: formData.get('status') || 'Inscrit',`,
  `status: formData.get('status') || 'Inscrit',\n            photo_url: uploadedPhotoUrl,`
);

appTsx = appTsx.replace(
  `password: password,`,
  `password: password,\n          photo_url: uploadedPhotoUrl,`
);

// 2. Add input file in student form
const photoInput = `
                    <div className="form-group">
                      <label>{t('admin.modals.photo', 'Photo de profil')}</label>
                      <input type="file" name="photo" accept="image/*" className="form-input" />
                    </div>
`;

appTsx = appTsx.replace(
  `<div className="form-grid">
                    <div className="form-group">
                      <label>Matricule (optionnel)</label>`,
  `${photoInput}
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Matricule (optionnel)</label>`
);

// 3. Update table rendering
const newTd = `<td style={{padding: '16px 0', fontWeight: 600}}>
                  <div style={{cursor: 'pointer', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: '12px'}} onClick={() => { setSelectedStudent(row); setActiveModal('studentDossier'); }}>
                    {row.photo_url ? <img src={row.photo_url} alt="" style={{width: 32, height: 32, borderRadius: '50%', objectFit: 'cover'}} /> : <div style={{width: 32, height: 32, borderRadius: '50%', background: '#e9ecef', color: '#6c757d', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'}}>{row.first_name.charAt(0)}{row.last_name.charAt(0)}</div>}
                    <span>{row.first_name} {row.last_name}</span>
                  </div>
                </td>`;

appTsx = appTsx.replace(
  `<td style={{padding: '16px 0', fontWeight: 600}}>
                  <div style={{cursor: 'pointer', color: 'var(--primary-color)'}} onClick={() => { setSelectedStudent(row); setActiveModal('studentDossier'); }}>
                    {row.first_name} {row.last_name}
                  </div>
                </td>`,
  newTd
);

fs.writeFileSync('c:/Users/koned/Mon Drive/SaaS/ETABLISEMENT/src/App.tsx', appTsx, 'utf8');
console.log('App.tsx patched successfully.');
