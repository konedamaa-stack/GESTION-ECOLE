const fs = require('fs');
const path = require('path');

function replaceInFile(filePath, replacements) {
  const fullPath = path.join(__dirname, '../', filePath);
  if (!fs.existsSync(fullPath)) return;
  
  let content = fs.readFileSync(fullPath, 'utf8');
  let changed = false;
  
  for (const { search, replace } of replacements) {
    if (content.includes(search)) {
      content = content.replace(search, replace);
      changed = true;
    }
  }
  
  if (changed) {
    fs.writeFileSync(fullPath, content);
    console.log(`Updated ${filePath}`);
  }
}

// 1. App.tsx (PDFs and Reports)
replaceInFile('src/App.tsx', [
  { search: 'BULLETINS SGES PRO', replace: 'BULLETINS ${settingsData?.school_name?.toUpperCase() || \'ÉTABLISSEMENT\'}' },
  { search: 'RAPPORT GLOBAL SGES PRO', replace: 'RAPPORT GLOBAL ${settingsData?.school_name?.toUpperCase() || \'ÉTABLISSEMENT\'}' },
  // Insert Logo Upload input
  {
    search: `<label style={{fontSize: '0.9rem', color: 'var(--text-secondary)'}}>{t('admin.settings.gen_name', "Nom de l'établissement")}</label>`,
    replace: `<label style={{fontSize: '0.9rem', color: 'var(--text-secondary)'}}>Logo de l'établissement (Image, Max 2Mo)</label>\n                  <input type="file" name="logo_file" accept="image/*" className="form-input" style={{marginBottom: '10px'}} />\n                  <label style={{fontSize: '0.9rem', color: 'var(--text-secondary)'}}>{t('admin.settings.gen_name', "Nom de l'établissement")}</label>`
  },
  // Update sidebar logo
  {
    search: `<div className="logo-icon">{(adminSchools?.find((s: any) => s.id === currentSchoolId)?.name || settingsData?.school_name || 'É').charAt(0).toUpperCase()}</div>`,
    replace: `{(adminSchools?.find((s: any) => s.id === currentSchoolId) as any)?.logo_url ? (\n            <img src={(adminSchools?.find((s: any) => s.id === currentSchoolId) as any).logo_url} alt="Logo" style={{ width: '32px', height: '32px', borderRadius: '8px', objectFit: 'cover' }} />\n          ) : (\n            <div className="logo-icon">{(adminSchools?.find((s: any) => s.id === currentSchoolId)?.name || settingsData?.school_name || 'É').charAt(0).toUpperCase()}</div>\n          )}`
  }
]);

// Inject logo upload logic in saveSettings
const appPath = path.join(__dirname, '../src/App.tsx');
let appContent = fs.readFileSync(appPath, 'utf8');

const uploadLogic = `
    const logoFile = formData.get('logo_file') as File;
    if (logoFile && logoFile.size > 0 && currentSchoolId) {
      if (logoFile.size > 2 * 1024 * 1024) {
        window.alert('Le logo est trop volumineux. Maximum 2 Mo.');
        return;
      }
      const fileExt = logoFile.name.split('.').pop();
      const fileName = \`\${currentSchoolId}-\${Math.random()}.\${fileExt}\`;
      const { data: uploadData, error: uploadError } = await supabase.storage.from('logos').upload(fileName, logoFile);
      if (!uploadError && uploadData) {
         const { data: urlData } = supabase.storage.from('logos').getPublicUrl(fileName);
         if (urlData) {
           await supabase.from('schools').update({ logo_url: urlData.publicUrl }).eq('id', currentSchoolId);
         }
      }
    }
`;
if (!appContent.includes("const logoFile = formData.get('logo_file')")) {
  appContent = appContent.replace(
    "const settingsObj = {",
    uploadLogic + "\n    const settingsObj = {"
  );
  fs.writeFileSync(appPath, appContent);
  console.log("Injected logo upload logic in App.tsx");
}


// 2. Auth.tsx
replaceInFile('src/components/Auth.tsx', [
  { search: "Rejoignez SGES Pro dès aujourd'hui", replace: "Rejoignez-nous dès aujourd'hui" }
]);

// 3. TeacherPortal.tsx
replaceInFile('src/components/TeacherPortal.tsx', [
  { search: "SGES Pro", replace: "Établissement" }
]);

// 4. StudentPortal.tsx
replaceInFile('src/components/StudentPortal.tsx', [
  { search: 'settings?.school_name || "SGES Pro"', replace: 'settings?.school_name || "Établissement"' }
]);

console.log("SGES Pro cleanup and logo injection complete.");
