import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Client navigateur compatible SSR : la session est lue dans les cookies,
// posés par le login côté serveur (actions.ts) et rafraîchis par le middleware.
// L'ancien client supabase-js classique utilisait le localStorage et ne voyait
// jamais cette session -> un utilisateur connecté apparaissait comme déconnecté
// (currentUser null, redirections intempestives).
// Le garde-fou évite le crash au prerendering si les variables sont absentes.
export const supabase = supabaseUrl && supabaseAnonKey
  ? createBrowserClient(supabaseUrl, supabaseAnonKey)
  : ({} as any);
