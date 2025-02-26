import { createSupabaseServerClient } from './server';
import { NextResponse, type NextRequest } from 'next/server';
import { redirect } from 'next/navigation';
import type { Session } from '@supabase/supabase-js';

/**
 * Verifica si un usuario está autenticado en rutas del servidor
 * Redirige al usuario a la página de inicio de sesión si no está autenticado
 * 
 * @param redirectTo - URL a la que redirigir si no hay sesión
 * @returns La sesión del usuario
 * 
 * @example
 * // En páginas del servidor:
 * export default async function ProtectedPage() {
 *   const session = await requireAuth();
 *   return <div>Página protegida. Usuario: {session.user.email}</div>;
 * }
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
 * 
 * @example
 * // En rutas de API:
 * export async function GET(request: NextRequest) {
 *   return withAuth(request, async (session) => {
 *     // Lógica de la API
 *     return NextResponse.json({ message: 'Datos protegidos' });
 *   });
 * }
 */
export async function withAuth<T>(
  request: NextRequest,
  handler: (session: Session) => Promise<T>
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
 * 
 * @example
 * // En rutas de API que requieren permisos específicos:
 * export async function POST(request: NextRequest) {
 *   return withRoles(request, ['admin'], async (session) => {
 *     // Lógica solo para administradores
 *     return NextResponse.json({ message: 'Operación administrativa realizada' });
 *   });
 * }
 */
export async function withRoles<T>(
  request: NextRequest,
  roles: string[],
  handler: (session: Session) => Promise<T>
) {
  return withAuth(request, async (session) => {
    // Implementación de verificación de roles
    const userRoles = session.user.app_metadata?.roles || [];
    const hasRequiredRole = roles.some(role => userRoles.includes(role));
    
    if (!hasRequiredRole) {
      return NextResponse.json(
        { error: 'Acceso denegado', message: 'No tienes los permisos necesarios' },
        { status: 403 }
      ) as any;
    }
    
    return handler(session);
  });
}