import { createClient } from './server';
import { NextResponse, type NextRequest } from 'next/server';
import { redirect } from 'next/navigation';

/**
 * Verifica si un usuario está autenticado en rutas del servidor
 * Redirige al usuario a la página de inicio de sesión si no está autenticado
 * 
 * @example
 * // En páginas del servidor:
 * export default async function ProtectedPage() {
 *   const session = await requireAuth();
 *   return <div>Página protegida. Usuario: {session.user.email}</div>;
 * }
 */
export async function requireAuth() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    redirect('/');
  }
  
  return session;
}

/**
 * Manejador para endpoints API protegidos
 * Verifica si el usuario está autenticado antes de procesar la solicitud
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
  handler: (session: any) => Promise<T>
) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return NextResponse.json(
      { error: 'No autorizado' },
      { status: 401 }
    );
  }
  
  return handler(session);
}
