import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Detecta si las credenciales son válidas y no son los marcadores de posición predeterminados
export const isSupabaseConfigured = 
  !!(supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('reemplaza-con-') && 
  !supabaseAnonKey.includes('reemplaza-con-'));

if (!isSupabaseConfigured) {
  console.warn("⚠️ Supabase no está configurado. La aplicación utilizará el almacenamiento local (localStorage) como fallback.");
}

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
