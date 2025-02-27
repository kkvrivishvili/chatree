'use client';
import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/supabase';

// Almacenamos el cliente como un singleton
let browserClient: ReturnType<typeof createBrowserClient<Database>> | null = null;

/**
 * Crea un cliente Supabase para usar en el navegador (componentes del lado del cliente)
 * Este cliente está optimizado para su uso en componentes 'use client'
 * @returns Cliente de Supabase con tipado completo
 */
export const createClient = () => {
  // Si estamos en el servidor, mostramos una advertencia y devolvemos null
  if (typeof window === 'undefined') {
    console.warn('createClient solo debe usarse en componentes del cliente');
    return null;
  }
  
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Registro detallado para depuración
  console.log('🔍 URL de Supabase:', url);
  console.log('🔑 Clave Anónima presente:', !!anonKey);

  // Validación explícita de las variables de entorno
  if (!url) {
    console.error('🚨 La URL de Supabase es requerida. Verifica tus variables de entorno.');
    return null;
  }

  if (!anonKey) {
    console.error('🚨 La Clave Anónima de Supabase es requerida. Verifica tus variables de entorno.');
    return null;
  }
  
  // Singleton para evitar múltiples instancias
  if (!browserClient) {
    try {
      browserClient = createBrowserClient<Database>(url, anonKey);
      console.log('✅ Cliente Supabase creado exitosamente');
    } catch (error) {
      console.error('🚨 Error al crear el cliente de Supabase:', error);
      return null;
    }
  }

  return browserClient;
};