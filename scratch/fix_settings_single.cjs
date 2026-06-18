const fs = require('fs');
const path = require('path');

const targetFile = path.resolve(__dirname, '../src/App.tsx');
let content = fs.readFileSync(targetFile, 'utf8');
content = content.replace(/\r\n/g, '\n');
let changed = false;

// Fix handleYearTransition
const findYearTransition = `        const { data: existing } = await supabase.from('school_settings').select('id').eq('school_id', currentSchoolId as string).single();`;
if (content.includes(findYearTransition)) {
    const replaceYearTransition = `        const { data: existing } = await supabase.from('school_settings').select('id').eq('school_id', currentSchoolId as string).maybeSingle();`;
    content = content.replace(findYearTransition, replaceYearTransition);
    changed = true;
    console.log("Fixed handleYearTransition");
}

// Fix saveSettings
const findSaveSettings = `    const settingsObj = {
      school_name: formData.get('school_name'),
      address: formData.get('address'),
      phone: formData.get('phone'),
      email: formData.get('email'),
      director_name: formData.get('director_name'),
    };
    
    const { data: existing } = await supabase.from('school_settings').select('id').single();
    let error;
    if (existing) {
      const { error: err } = await supabase.from('school_settings').update(settingsObj);
      error = err;
    } else {
      const { error: err } = await supabase.from('school_settings').insert([settingsObj]);
      error = err;
    }`;

if (content.includes(findSaveSettings)) {
    const replaceSaveSettings = `    const settingsObj: any = {
      school_name: formData.get('school_name'),
      address: formData.get('address'),
      phone: formData.get('phone'),
      email: formData.get('email'),
      director_name: formData.get('director_name'),
    };
    if (currentSchoolId) settingsObj.school_id = currentSchoolId;
    
    const { data: existing } = await supabase.from('school_settings').select('id').eq('school_id', currentSchoolId as string).maybeSingle();
    let error;
    if (existing) {
      const { error: err } = await supabase.from('school_settings').update(settingsObj).eq('school_id', currentSchoolId as string);
      error = err;
    } else {
      const { error: err } = await supabase.from('school_settings').insert([settingsObj]);
      error = err;
    }`;
    content = content.replace(findSaveSettings, replaceSaveSettings);
    changed = true;
    console.log("Fixed saveSettings");
}

if (changed) {
    fs.writeFileSync(targetFile, content);
    console.log("App.tsx saved!");
} else {
    console.log("Nothing changed");
}
