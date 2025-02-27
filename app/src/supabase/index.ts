// Exportación de clientes
export { getSupabaseBrowserClient } from './client';
export { createSupabaseServerClient, getSession, getUser } from './server';

export { auth } from './auth';
export type { 
  AuthError, 
  AuthResponse, 
  AuthData 
} from './auth';

// Exportación de hooks
export { useAuth } from './hooks/useAuth';
export { useSession } from './hooks/useSession';

// Exportación de utilidades para rutas
export { requireAuth, withAuth, withRoles } from './route-handlers';

// Importamos directamente de los tipos de la aplicación
export type { Database } from '@/types/supabase';