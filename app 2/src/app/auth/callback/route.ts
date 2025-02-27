import { createSupabaseServerClient } from '@/supabase/server';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Maneja el callback de autenticación de Supabase
 * Esta ruta se llama después de que el usuario se autentica con un proveedor OAuth
 * o cuando confirma su correo electrónico
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  
  if (code) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  // URL a la que redirigir después de la autenticación exitosa
  return NextResponse.redirect(new URL('/dashboard', request.url));
}