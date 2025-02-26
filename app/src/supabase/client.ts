import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/supabase';

// Almacenamos el cliente como un singleton
let browserClient: ReturnType<typeof createBrowserClient<Database>> | undefined;

/**
 * Crea un cliente Supabase para usar en el navegador (componentes del lado del cliente)
 * Este cliente está optimizado para su uso en componentes 'use client'
 * @returns Cliente de Supabase con tipado completo
 */
export const createClient = () => {
  // Si estamos en el servidor, mostramos una advertencia y devolvemos undefined
  if (typeof window === 'undefined') {
    if (process.env.NODE_ENV === 'development') {
      console.warn('createClient fue llamado en el servidor. Este cliente solo debe usarse en componentes del cliente.');
    }
    return undefined;
  }
  
  // Singleton para evitar múltiples instancias
  if (!browserClient) {
    browserClient = createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  
  return browserClient;
};