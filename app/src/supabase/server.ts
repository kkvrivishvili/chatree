import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { type Database } from './types';

/**
 * Crea un cliente Supabase para usar en el servidor (RSC, Server Actions, API Routes)
 * Este cliente está optimizado para componentes del lado del servidor
 * @returns Cliente de Supabase con tipado completo para el servidor
 */
export const createClient = async () => {
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
 * Función de utilidad para obtener la sesión actual desde el servidor
 * @returns La sesión actual o null si no hay sesión
 */
export async function getServerSession() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

/**
 * Función de utilidad para obtener el usuario actual desde el servidor
 * @returns El usuario actual o null si no hay usuario autenticado
 */
export async function getServerUser() {
  const session = await getServerSession();
  return session?.user || null;
}
