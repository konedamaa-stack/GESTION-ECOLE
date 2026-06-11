const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function check() {
  const { data, error } = await supabase.from('schools').select('*').limit(1);
  if (error) {
    console.error('Error fetching schools:', error);
  } else {
    console.log('Schools columns:', data && data.length ? Object.keys(data[0]) : 'No data');
  }

  const { data: sData, error: sError } = await supabase.from('school_settings').select('*').limit(1);
  if (sError) {
    console.error('Error fetching settings:', sError);
  } else {
    console.log('Settings columns:', sData && sData.length ? Object.keys(sData[0]) : 'No data');
  }
}

check();
