require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function restore() {
  const { data, error } = await supabase.auth.signUp({
    email: 'konedamaa@gmail.com',
    password: 'Madouu1966',
  });

  if (error) {
    console.error("Erreur lors de la création :", error.message);
  } else {
    console.log("Succès ! Compte recréé.");
    console.log("Email : konedamaa@gmail.com");
    console.log("Mot de passe : Madouu1966");
  }
}

restore();
