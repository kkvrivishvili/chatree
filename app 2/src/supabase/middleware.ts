import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  // Preparar respuesta base
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Validación estricta de variables
  if (!url || !anonKey) {
    console.error('⚠️ Configuración de Supabase incompleta');
    return response;
  }

  try {
    const supabase = createServerClient(url, anonKey, {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          // Asegurar que solo se establecen cookies seguras
          response.cookies.set({
            name,
            value,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            ...options,
          });
        },
        remove(name: string, options: any) {
          response.cookies.set({
            name,
            value: '',
            expires: new Date(0),
            ...options,
          });
        },
      },
    });

    // Renovar sesión de manera segura
    const { data: { user } } = await supabase.auth.getUser();
    
    // Log solo en desarrollo
    if (process.env.NODE_ENV === 'development' && user) {
      console.info('✅ Sesión de usuario renovada');
    }

  } catch (error) {
    // Manejo de errores más robusto
    console.error('❌ Error en middleware de sesión:', error);
    
    // Opcionalmente, podrías invalidar la sesión en caso de error
    response.cookies.delete('sb-access-token');
    response.cookies.delete('sb-refresh-token');
  }

  return response;
}