const fs = require('fs');
const path = require('path');

const targetFile = path.resolve(__dirname, '../src/App.tsx');
let content = fs.readFileSync(targetFile, 'utf8');
content = content.replace(/\r\n/g, '\n');
let changed = false;

// Fix handleYearTransition
const findYearTransition = `        const { data: existing } = await supabase.from('school_settings').select('id').eq('school_id', currentSchoolId as string).maybeSingle();
        if (existing) {
          const { error: setErr } = await supabase.from('school_settings').update({ academic_year: nextYear }).eq('school_id', currentSchoolId as string);
          if (setErr) throw setErr;
        } else {
          const { error: setErr } = await supabase.from('school_settings').insert([{ academic_year: nextYear, school_id: currentSchoolId as string }]);
          if (setErr) throw setErr;
        }`;

if (content.includes(findYearTransition)) {
    const replaceYearTransition = `        let { data: existing } = await supabase.from('school_settings').select('id').eq('school_id', currentSchoolId as string).maybeSingle();
        
        if (!existing) {
            const { data: orphaned } = await supabase.from('school_settings').select('id').is('school_id', null).maybeSingle();
            if (orphaned) {
                await supabase.from('school_settings').update({ school_id: currentSchoolId as string }).eq('id', orphaned.id);
                existing = orphaned;
            }
        }

        if (existing) {
          const { error: setErr } = await supabase.from('school_settings').update({ academic_year: nextYear }).eq('id', existing.id);
          if (setErr) throw setErr;
        } else {
          const randomId = Math.floor(Math.random() * 1000000) + 1000;
          const { error: setErr } = await supabase.from('school_settings').insert([{ id: randomId, academic_year: nextYear, school_id: currentSchoolId as string }]);
          if (setErr) throw setErr;
        }`;
    content = content.replace(findYearTransition, replaceYearTransition);
    changed = true;
    console.log("Fixed handleYearTransition");
}

// Fix saveSettings
const findSaveSettings = `    const { data: existing } = await supabase.from('school_settings').select('id').eq('school_id', currentSchoolId as string).maybeSingle();
    let error;
    if (existing) {
      const { error: err } = await supabase.from('school_settings').update(settingsObj).eq('school_id', currentSchoolId as string);
      error = err;
    } else {
      const { error: err } = await supabase.from('school_settings').insert([settingsObj]);
      error = err;
    }`;

if (content.includes(findSaveSettings)) {
    const replaceSaveSettings = `    let { data: existing } = await supabase.from('school_settings').select('id').eq('school_id', currentSchoolId as string).maybeSingle();
    
    if (!existing) {
        const { data: orphaned } = await supabase.from('school_settings').select('id').is('school_id', null).maybeSingle();
        if (orphaned) {
            await supabase.from('school_settings').update({ school_id: currentSchoolId as string }).eq('id', orphaned.id);
            existing = orphaned;
        }
    }

    let error;
    if (existing) {
      const { error: err } = await supabase.from('school_settings').update(settingsObj).eq('id', existing.id);
      error = err;
    } else {
      settingsObj.id = Math.floor(Math.random() * 1000000) + 1000;
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
