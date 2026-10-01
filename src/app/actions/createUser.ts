'use server'

import { createClient } from '@supabase/supabase-js'

// We create a fresh client WITHOUT SSR cookie management, 
// so signing up a new user DOES NOT log out the current admin.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export async function createUserAuth(email: string, password: string, nom: string, prenom: string) {
  // Try to use Service Role if available to bypass email confirmation and auto-confirm
  const keyToUse = supabaseServiceKey || supabaseAnonKey;
  const supabase = createClient(supabaseUrl, keyToUse, {
    auth: {
      autoRefreshToken: false,
      persistSession: false, // Critical to avoid interfering with current session
    }
  });

  if (supabaseServiceKey) {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { nom, prenom }
    });
    if (error) return { error: error.message };
    return { success: true, user: data.user };
  } else {
    // Standard signup (might require email confirmation if enabled in Supabase)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { nom, prenom }
      }
    });
    if (error) return { error: error.message };
    return { success: true, user: data.user };
  }
}
