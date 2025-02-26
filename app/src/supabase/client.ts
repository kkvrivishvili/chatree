import { createBrowserClient } from '@supabase/ssr';

// Importamos directamente el tipo de la base de datos
import type { Database } from '@/types/supabase';

/**
 * Crea un cliente Supabase para usar en el navegador (componentes del lado del cliente)
 * Este cliente está optimizado para su uso en componentes 'use client'
 * @returns Cliente de Supabase con tipado completo
 */
export const createClient = () => {
  if (typeof window === 'undefined') {
    throw new Error('createClient debe ser usado solo en componentes del cliente');
  }
  
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
};