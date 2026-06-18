require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function fixDB() {
    console.log("Fetching schools...");
    const { data: schools, error: schoolErr } = await supabase.from('schools').select('id');
    if (schoolErr) {
        console.error("Error fetching schools:", schoolErr);
        return;
    }
    
    if (!schools || schools.length === 0) {
        console.log("No schools found. DB is empty.");
        return;
    }

    const firstSchoolId = schools[0].id;
    console.log("Found school ID:", firstSchoolId);

    console.log("Fetching settings...");
    const { data: settings, error: setErr } = await supabase.from('school_settings').select('*');
    if (setErr) {
        console.error("Error fetching settings:", setErr);
        return;
    }
    
    console.log("Settings found:", settings);
    
    const orphaned = settings.find(s => s.school_id === null);
    if (orphaned) {
        console.log("Found orphaned setting with id =", orphaned.id, ". Updating school_id to", firstSchoolId);
        const { error: updateErr } = await supabase.from('school_settings')
            .update({ school_id: firstSchoolId })
            .eq('id', orphaned.id);
            
        if (updateErr) {
            console.error("Error updating setting:", updateErr);
        } else {
            console.log("Successfully fixed the database!");
        }
    } else {
        console.log("No orphaned settings found. Trying to see if id=1 is taken by another school.");
    }
}

fixDB();
