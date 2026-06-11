const fs = require('fs');
const path = require('path');
let appTsx = fs.readFileSync(path.join(__dirname, '../src/App.tsx'), 'utf8');

// fix logo text
appTsx = appTsx.replace(
  /\{adminSchools\.find\(s => s\.id === currentSchoolId\)\?.name \|\| 'SGES Pro'\}/,
  "{settingsData?.school_name || 'SGES Pro'}"
);

// fix saveSettings
appTsx = appTsx.replace(/if \(!currentSchoolId\) return;\n/, '');
appTsx = appTsx.replace(/school_id: currentSchoolId,\n\s*/, '');
appTsx = appTsx.replace(/const \{ data: existing \} = await supabase\.from\('school_settings'\)\.select\('id'\)\.eq\('school_id', currentSchoolId\)\.single\(\);\n/, "const { data: existing } = await supabase.from('school_settings').select('id').single();\n");
appTsx = appTsx.replace(/\.eq\('school_id', currentSchoolId\)/g, '');
appTsx = appTsx.replace(/fetchSettings\(currentSchoolId\)/g, 'fetchSettings()');

// remove school selector
const selectorRegex = /\{adminSchools\.length > 1 && \([\s\S]*?\}\)\}/m;
appTsx = appTsx.replace(selectorRegex, '');

fs.writeFileSync(path.join(__dirname, '../src/App.tsx'), appTsx);
