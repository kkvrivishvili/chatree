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

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          cookieStore.delete({ name, ...options });
        },
      },
    }
  );
};

/**
 * Cliente de Supabase con la clave de rol de servicio para operaciones administrativas
 * SOLO DEBE USARSE EN SERVER COMPONENTS O API ROUTES
 */
export const createSupabaseServerAdminClient = async () => {
  const cookieStore = cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          cookieStore.delete({ name, ...options });
        },
      },
    }
  );
};

/**
 * Función de utilidad para obtener la sesión actual desde el servidor
 * @returns La sesión actual o null si no hay sesión
 */
export async function getSession() {
  const supabase = await createSupabaseServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

/**
 * Función de utilidad para obtener el usuario actual desde el servidor
 * @returns El usuario actual o null si no hay usuario autenticado
 */
export async function getUser() {
  const session = await getSession();
  return session?.user || null;
}