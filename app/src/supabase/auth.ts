import { getSupabaseBrowserClient } from './client';
import type { User, Session } from '@supabase/supabase-js';

// Tipos de Autenticación
export interface AuthError {
  message: string;
  status?: number;
}

export interface AuthResult<T = unknown> {
  data: T | null;
  error: AuthError | null;
}

export interface AuthData {
  user: User;
  session: Session;
}

export const auth = {
  async signIn(email: string, password: string): Promise<AuthResult<AuthData>> {
    try {
      const supabase = getSupabaseBrowserClient();
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      
      if (!data.user || !data.session) {
        throw new Error('Datos de autenticación incompletos');
      }

      return { 
        data: { 
          user: data.user, 
          session: data.session 
        }, 
        error: null 
      };

    } catch (error: any) {
      return { 
        data: null, 
        error: { 
          message: error.message || 'Error de autenticación', 
          status: error.status 
        } 
      };
    }
  },

  async signUp(
    email: string, 
    password: string, 
    metadata: Record<string, any> = {}
  ): Promise<AuthResult<AuthData>> {
    try {
      const supabase = getSupabaseBrowserClient();
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { 
          data: metadata,
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) throw error;

      if (!data.user || !data.session) {
        throw new Error('Registro incompleto');
      }

      return { 
        data: { 
          user: data.user, 
          session: data.session 
        }, 
        error: null 
      };

    } catch (error: any) {
      return { 
        data: null, 
        error: { 
          message: error.message || 'Error de registro', 
          status: error.status 
        } 
      };
    }
  },

  async signOut(): Promise<AuthResult> {
    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.auth.signOut();

      if (error) throw error;

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

  async resetPassword(email: string): Promise<AuthResult> {
    try {
      const supabase = getSupabaseBrowserClient();
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      });

      if (error) throw error;

      return { data: null, error: null };

    } catch (error: any) {
      return { 
        data: null, 
        error: { 
          message: error.message || 'Error al restablecer contraseña', 
          status: error.status 
        } 
      };
    }
  }
};

// Exportación de tipos
export type AuthResponse<T = unknown> = AuthResult<T>;