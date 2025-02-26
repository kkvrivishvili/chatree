import { createClient } from '@supabase/supabase-js';
import type { Database } from '../../app/src/supabase/types';

/**
 * Crea un cliente Supabase para usar en el servidor
 * Este cliente se usa para operaciones de administración y configuración
 * @returns Cliente Supabase con tipado completo
 */
export function createSupabaseServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Faltan variables de entorno para Supabase');
  }
  
  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}
