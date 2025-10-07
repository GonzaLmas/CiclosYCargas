import { createClient } from "@supabase/supabase-js";
import type { Database } from "./Supabase";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Error: Variables de entorno de Supabase no encontradas");

  throw new Error(
    "Faltan las variables de entorno de Supabase. Por favor verifica tu archivo .env"
  );
}

const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: false,
    detectSessionInUrl: true,
  },
});

export default supabase;
