'use client';
import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/supabase';

// Mejora del manejo de cliente Supabase
export function createSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Validación temprana de variables de entorno
  if (!url || !anonKey) {
    throw new Error('Las variables de entorno de Supabase no están configuradas correctamente');
  }

  // Usar entorno de desarrollo para depuración
  if (process.env.NODE_ENV === 'development') {
    console.info('Inicializando cliente Supabase:', { url });
  }

  try {
    return createBrowserClient<Database>(url, anonKey);
  } catch (error) {
    console.error('Error al crear cliente Supabase:', error);
    throw error;
  }
}

// Singleton para evitar múltiples instancias
let browserClient: ReturnType<typeof createBrowserClient<Database>> | undefined;

export function getSupabaseBrowserClient() {
  // Verificar que solo se ejecute en el navegador
  if (typeof window === 'undefined') {
    throw new Error('Este cliente solo puede usarse en el navegador');
  }

  // Crear cliente solo una vez
  if (!browserClient) {
    browserClient = createSupabaseClient();
  }

  return browserClient;
}