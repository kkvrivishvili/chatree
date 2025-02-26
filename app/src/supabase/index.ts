// Exportación de clientes
export { createClient } from './client';
export { createSupabaseServerClient, createSupabaseServerAdminClient, getSession, getUser } from './server';

// Exportación de autenticación
export { auth } from './auth';
export type { AuthResponse, AuthError } from './auth';

// Exportación de hooks
export { useAuth } from './hooks/useAuth';
export { useSession } from './hooks/useSession';

// Exportación de utilidades para rutas
export { requireAuth, withAuth, withRoles } from './route-handlers';

// Importamos directamente de los tipos de la aplicación
export type { Database } from '@/types/supabase';