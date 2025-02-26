import { createSupabaseServerClient } from './server';
import { NextResponse, type NextRequest } from 'next/server';
import { redirect } from 'next/navigation';

/**
 * Verifica si un usuario está autenticado en rutas del servidor
 * Redirige al usuario a la página de inicio de sesión si no está autenticado
 * 
 * @param redirectTo - URL a la que redirigir si no hay sesión
 * @returns La sesión del usuario
 */
export async function requireAuth(redirectTo: string = '/') {
  const supabase = await createSupabaseServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    redirect(redirectTo);
  }
  
  return session;
}

/**
 * Manejador para endpoints API protegidos
 * Verifica si el usuario está autenticado antes de procesar la solicitud
 * 
 * @param request - La solicitud HTTP
 * @param handler - Función a ejecutar si el usuario está autenticado
 * @returns Respuesta del manejador o error 401
 */
export async function withAuth<T>(
  request: NextRequest,
  handler: (session: any) => Promise<T>
) {
  const supabase = await createSupabaseServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return NextResponse.json(
      { error: 'No autorizado', message: 'Debes iniciar sesión para acceder a este recurso' },
      { status: 401 }
    );
  }
  
  return handler(session);
}

/**
 * Verifica si el usuario tiene roles/permisos específicos
 * 
 * @param request - La solicitud HTTP
 * @param roles - Roles requeridos
 * @param handler - Función a ejecutar si el usuario tiene los permisos
 * @returns Respuesta del manejador o error 403
 */
export async function withRoles<T>(
  request: NextRequest,
  roles: string[],
  handler: (session: any) => Promise<T>
) {
  return withAuth(request, async (session) => {
    // Aquí iría la lógica para verificar roles
    // Esto es un ejemplo básico, deberías adaptarlo a tu esquema de permisos
    const userRoles = session.user.app_metadata?.roles || [];
    const hasRequiredRole = roles.some(role => userRoles.includes(role));
    
    if (!hasRequiredRole) {
      return NextResponse.json(
        { error: 'Acceso denegado', message: 'No tienes los permisos necesarios' },
        { status: 403 }
      );
    }
    
    return handler(session);
  });
}