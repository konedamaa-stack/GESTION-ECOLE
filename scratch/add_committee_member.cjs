const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const dotenv = require('dotenv');

const envConfig = dotenv.parse(fs.readFileSync('.env.local'));
const supabase = createClient(envConfig.VITE_SUPABASE_URL, envConfig.VITE_SUPABASE_ANON_KEY);

async function addCommittee() {
  const { data: school, error: schoolErr } = await supabase.from('school_settings').select('id').limit(1).single();
  if (schoolErr || !school) {
    console.error('Error fetching school', schoolErr);
    return;
  }

  const { data, error } = await supabase.from('committee_members').insert([
    {
      school_id: school.id,
      email: 'comite@etablissement.com',
      password: 'password123',
      name: 'Membre du Comité 1'
    }
  ]);

  if (error) {
    console.error('Error adding committee member:', error);
  } else {
    console.log('Successfully added committee member: comite@etablissement.com / password123');
  }
}

addCommittee();
