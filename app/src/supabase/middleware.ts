import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Actualiza la sesión de Supabase en cada solicitud HTTP
 * Maneja las cookies necesarias para la autenticación
 * @param request - La solicitud entrante
 * @returns Respuesta con cookies actualizadas
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Validación de variables de entorno
  if (!url || !anonKey) {
    console.error('Configuración de Supabase incompleta');
    return response;
  }

  try {
    const supabase = createServerClient(url, anonKey, {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: any) {
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    });

    // Renovar la sesión si está expirada
    await supabase.auth.getUser();
  } catch (error) {
    console.error('Error en la actualización de sesión del middleware:', error);
  }

  return response;
}