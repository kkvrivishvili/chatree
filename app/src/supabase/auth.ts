import { getSupabaseBrowserClient } from '../client';

// Definimos los tipos aquí para evitar problemas de importación
interface AuthError {
  message: string;
  status?: number;
}

interface User {
  id: string;
  email: string;
}

interface Session {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  user: User;
}

interface AuthData {
  user: User;
  session: Session;
}

interface SignInResponse {
  data: AuthData | null;
  error: AuthError | null;
}

interface AuthResponse<T = AuthData> {
  data: T | null;
  error: AuthError | null;
}

// Creamos el cliente Supabase para autenticación, asegurándonos de que no sea nulo
// Suponemos que auth.ts solo se usará en el cliente, donde window está definido
const supabase = (() => {
  // Verificamos si estamos en el cliente
  const isClient = typeof window !== 'undefined';
  
  if (!isClient) {
    console.warn('auth.ts se está cargando en el servidor, lo que no es ideal');
    // Devolvemos un objeto que simula los métodos pero lanza errores si se llaman
    return {
      auth: {
        signInWithPassword: () => {
          throw new Error('auth.signInWithPassword() debe usarse solo en el cliente');
        },
        signUp: () => {
          throw new Error('auth.signUp() debe usarse solo en el cliente');
        },
        signOut: () => {
          throw new Error('auth.signOut() debe usarse solo en el cliente');
        },
        signInWithOAuth: () => {
          throw new Error('auth.signInWithOAuth() debe usarse solo en el cliente');
        },
        getSession: () => {
          throw new Error('auth.getSession() debe usarse solo en el cliente');
        },
        getUser: () => {
          throw new Error('auth.getUser() debe usarse solo en el cliente');
        },
        resetPasswordForEmail: () => {
          throw new Error('auth.resetPasswordForEmail() debe usarse solo en el cliente');
        },
        updateUser: () => {
          throw new Error('auth.updateUser() debe usarse solo en el cliente');
        }
      }
    };
  }
  
  // En el cliente, creamos el cliente Supabase real
  const client = getSupabaseBrowserClient();
  
  // Si no se puede crear el cliente, lanzamos un error más descriptivo
  if (!client) {
    console.error('No se pudo crear el cliente Supabase. Verifica las variables de entorno.');
    throw new Error('No se pudo crear el cliente Supabase. Revisa NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }
  
  return client;
})();

/**
 * Funciones de autenticación para uso en componentes del lado del cliente
 */
const handleAuthError = (error: any): AuthResponse => {
  return { 
    data: null, 
    error: { 
      message: error.message || 'Error desconocido',
      status: error.status
    } 
  };
};

export const auth = {
  /**
   * Inicia sesión con email y contraseña
   * @param email - Email del usuario
   * @param password - Contraseña del usuario
   */
  signIn: async (email: string, password: string): Promise<SignInResponse> => {
    try {
      const response = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (response.error) {
        throw response.error;
      }

      const user = response.data.user;
      const session = response.data.session;

      // Verificar que user y session no sean null
      if (!user || !session) {
        throw new Error('User or session is null');
      }

      return { data: { user, session }, error: null };
    } catch (error: any) {
      return handleAuthError(error);
    }
  },
  
  /**
   * Registra un nuevo usuario
   * @param email - Email del usuario
   * @param password - Contraseña del usuario
   * @param userData - Datos adicionales del usuario (opcional)
   */
  signUp: async (email: string, password: string, userData: Record<string, unknown> = {}): Promise<AuthResponse> => {
    try {
      const response = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`,
          data: userData
        }
      });
      
      if (response.error) {
        throw response.error;
      }
      
      return { data: response.data, error: null };
    } catch (error: any) {
      return handleAuthError(error);
    }
  },
  
  /**
   * Cierra la sesión del usuario actual
   */
  signOut: async (): Promise<AuthResponse> => {
    try {
      const response = await supabase.auth.signOut();
      
      if (response.error) {
        throw response.error;
      }
      
      return { data: null, error: null };
    } catch (error: any) {
      return handleAuthError(error);
    }
  },
  
  /**
   * Inicia sesión con un proveedor OAuth
   * @param provider - Proveedor OAuth ('github', 'google', etc.)
   */
  signInWithOAuth: async (provider: 'github' | 'google'): Promise<AuthResponse> => {
    try {
      const response = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`
        }
      });
      
      if (response.error) {
        throw response.error;
      }
      
      return { data: response.data, error: null };
    } catch (error: any) {
      return handleAuthError(error);
    }
  },
  
  /**
   * Obtiene la sesión actual
   */
  getSession: async (): Promise<AuthResponse> => {
    try {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        throw error;
      }
      
      return { data: data.session, error: null };
    } catch (error: any) {
      return handleAuthError(error);
    }
  },
  
  /**
   * Obtiene el usuario actual
   */
  getUser: async (): Promise<AuthResponse> => {
    try {
      const { data, error } = await supabase.auth.getUser();
      
      if (error) {
        throw error;
      }
      
      return { data: data.user, error: null };
    } catch (error: any) {
      return handleAuthError(error);
    }
  },
  
  /**
   * Envía un enlace para restablecer la contraseña
   */
  resetPassword: async (email: string): Promise<AuthResponse> => {
    try {
      const response = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/reset-password`
      });
      
      if (response.error) {
        throw response.error;
      }
      
      return { data: null, error: null };
    } catch (error: any) {
      return handleAuthError(error);
    }
  },
  
  /**
   * Actualiza la contraseña del usuario
   */
  updatePassword: async (password: string): Promise<AuthResponse> => {
    try {
      const response = await supabase.auth.updateUser({
        password
      });
      
      if (response.error) {
        throw response.error;
      }
      
      return { data: response.data, error: null };
    } catch (error: any) {
      return handleAuthError(error);
    }
  }
};

// Re-exportamos los tipos para que estén disponibles al importar este módulo
export type { AuthError, AuthResponse, AuthData, User, Session };