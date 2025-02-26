import { createClient } from './client';

// Definimos los tipos aquí para evitar problemas de importación
interface AuthError {
  message: string;
  status?: number;
}

interface AuthResponse<T = any> {
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
  const client = createClient();
  if (!client) {
    throw new Error('No se pudo crear el cliente Supabase en el cliente');
  }
  return client;
})();

/**
 * Funciones de autenticación para uso en componentes del lado del cliente
 */
export const auth = {
  /**
   * Inicia sesión con email y contraseña
   * @param email - Email del usuario
   * @param password - Contraseña del usuario
   */
  signIn: async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const response = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (response.error) {
        throw response.error;
      }
      
      return { data: response.data, error: null };
    } catch (error: any) {
      return { 
        data: null, 
        error: { 
          message: error.message || 'Error al iniciar sesión',
          status: error.status
        } 
      };
    }
  },
  
  /**
   * Registra un nuevo usuario
   * @param email - Email del usuario
   * @param password - Contraseña del usuario
   * @param userData - Datos adicionales del usuario (opcional)
   */
  signUp: async (email: string, password: string, userData: Record<string, any> = {}): Promise<AuthResponse> => {
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
      return { 
        data: null, 
        error: { 
          message: error.message || 'Error al registrarse',
          status: error.status
        } 
      };
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
      return { 
        data: null, 
        error: { 
          message: error.message || 'Error al cerrar sesión',
          status: error.status
        } 
      };
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
      return { 
        data: null, 
        error: { 
          message: error.message || `Error al iniciar sesión con ${provider}`,
          status: error.status
        } 
      };
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
      return { 
        data: null, 
        error: { 
          message: error.message || 'Error al obtener la sesión',
          status: error.status
        } 
      };
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
      return { 
        data: null, 
        error: { 
          message: error.message || 'Error al obtener el usuario',
          status: error.status
        } 
      };
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
      return { 
        data: null, 
        error: { 
          message: error.message || 'Error al enviar el enlace de recuperación',
          status: error.status
        } 
      };
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
      return { 
        data: null, 
        error: { 
          message: error.message || 'Error al actualizar la contraseña',
          status: error.status
        } 
      };
    }
  }
};

// Re-exportamos los tipos para que estén disponibles al importar este módulo
export type { AuthError, AuthResponse };