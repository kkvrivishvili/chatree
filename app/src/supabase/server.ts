import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Importamos directamente el tipo de la base de datos
import type { Database } from '@/types/supabase';

/**
 * Crea un cliente Supabase para usar en el servidor (RSC, Server Actions, API Routes)
 * Este cliente está optimizado para componentes del lado del servidor
 * @returns Cliente de Supabase con tipado completo para el servidor
 */
export const createSupabaseServerClient = async () => {
  const cookieStore = cookies();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url) {
    console.error('🚨 URL de Supabase no configurada para el servidor');
    throw new Error('NEXT_PUBLIC_SUPABASE_URL no está definida');
  }

  if (!anonKey) {
    console.error('🚨 Clave Anónima de Supabase no configurada para el servidor');
    throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY no está definida');
  }

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: any) {
        try {
          cookieStore.set({ name, value, ...options });
        } catch (error) {
          console.error('Error al establecer cookie:', error);
        }
      },
      remove(name: string, options: any) {
        try {
          cookieStore.delete({ name, ...options });
        } catch (error) {
          console.error('Error al eliminar cookie:', error);
        }
      },
    },
  });
};

/**
 * Función de utilidad para obtener la sesión actual desde el servidor
 * @returns La sesión actual o null si no hay sesión
 */
export async function getSession() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  } catch (error) {
    console.error('Error al obtener la sesión:', error);
    return null;
  }
}

/**
 * Función de utilidad para obtener el usuario actual desde el servidor
 * @returns El usuario actual o null si no hay usuario autenticado
 */
export async function getUser() {
  try {
    const session = await getSession();
    return session?.user || null;
  } catch (error) {
    console.error('Error al obtener el usuario:', error);
    return null;
  }
}