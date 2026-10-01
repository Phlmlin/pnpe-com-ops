const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// We need Service Role Key to bypass email confirmation if needed.
// But we'll try with Anon key first. If it requires confirmation, we'll tell the user.
// Or we can try to use standard signup.
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seedAdmin() {
  const adminEmail = 'greenmoundounga@gmail.com';
  const adminPassword = 'phlmlingreen@1992';

  console.log('Création du compte administrateur racine...');

  // 1. Sign up the user (or create using admin API if available)
  // We use admin API if we have service key to auto-confirm
  let user;
  
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.log('Utilisation de la clé Service Role pour auto-confirmer l\'email...');
      const { data, error } = await supabase.auth.admin.createUser({
          email: adminEmail,
          password: adminPassword,
          email_confirm: true,
          user_metadata: {
              nom: 'Moundounga',
              prenom: 'Green'
          }
      });
      if (error) {
        if (error.message.includes('already exists')) {
          console.log('Utilisateur déjà existant dans Auth. Récupération...');
          const { data: listData } = await supabase.auth.admin.listUsers();
          user = listData.users.find(u => u.email === adminEmail);
        } else {
          console.error('Erreur Auth Admin:', error);
          process.exit(1);
        }
      } else {
        user = data.user;
      }
  } else {
      console.log('Utilisation de la clé publique (Anon Key)... Attention, confirmation email potentiellement requise.');
      const { data, error } = await supabase.auth.signUp({
          email: adminEmail,
          password: adminPassword,
          options: {
              data: {
                  nom: 'Moundounga',
                  prenom: 'Green'
              }
          }
      });
      if (error) {
          if (error.message.includes('already registered')) {
              console.log('Utilisateur déjà existant.');
          } else if (error.status === 429) {
              console.log('Rate limit atteint, on suppose que l\'utilisateur existe.');
          } else {
              console.error('Erreur d\'inscription:', error);
              process.exit(1);
          }
      }
      user = data?.user || true;
  }

  // 2. Insert into `utilisateurs` table
  if (user || true) { // We force it if user already exists
      console.log('Insertion dans la table utilisateurs...');
      
      // try to fetch first
      const { data: existingUser } = await supabase.from('utilisateurs').select('id').eq('email', adminEmail).single();

      if (existingUser) {
          console.log('Utilisateur déjà présent dans la table. Mise à jour de ses droits...');
          const { error: updateError } = await supabase.from('utilisateurs').update({
              role: 'admin_directeur'
          }).eq('email', adminEmail);
          
          if (updateError) console.error('Erreur MAJ:', updateError);
          else console.log('Profil mis à jour avec succès !');
      } else {
          const { error: insertError } = await supabase.from('utilisateurs').insert([{
              nom: 'Moundounga',
              prenom: 'Green',
              email: adminEmail,
              role: 'admin_directeur'
          }]);

          if (insertError) {
              console.error('Erreur insertion DB:', insertError);
          } else {
              console.log('Profil créé avec succès dans la base de données !');
          }
      }
  }
  
  console.log('✅ Seeding terminé.');
  process.exit(0);
}

seedAdmin();
