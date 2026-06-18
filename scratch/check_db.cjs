require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function check() {
    const { data: settings, error: err1 } = await supabase.from('school_settings').select('*');
    console.log("Settings:", settings, "Error:", err1);
}
check();
