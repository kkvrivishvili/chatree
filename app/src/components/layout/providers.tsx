'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import ThemeProvider from './ThemeToggle/theme-provider';
import { createSupabaseClient } from '@/supabase/client';
import type { Database } from '@/supabase/types';
import { Session, SupabaseClient } from '@supabase/supabase-js';

interface UserSession {
  user: {
    id: string;
    email?: string;
    user_metadata?: {
      name?: string;
      avatar_url?: string;
    };
  } | null;
}

type SessionContextType = {
  session: UserSession | null;
  supabase: SupabaseClient<Database>;
};

const SessionContext = createContext<SessionContextType | null>(null);

export const SupabaseProvider = ({ 
  children, 
  initialSession 
}: { 
  children: React.ReactNode;
  initialSession?: UserSession | null;
}) => {
  // Corrección: Llamada correcta al método createSupabaseClient
  const supabase = createSupabaseClient();
  const [session, setSession] = useState<UserSession | null>(initialSession || null);

  useEffect(() => {
    if (!supabase) {
      console.error('Supabase client is undefined');
      return;
    }

    // Verificación adicional de supabase.auth
    if (supabase && supabase.auth) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (_event: string, authSession: Session | null) => {
          if (authSession) {
            setSession({
              user: {
                id: authSession.user.id,
                email: authSession.user.email,
                user_metadata: authSession.user.user_metadata
              }
            });
          } else {
            setSession(null);
          }
        }
      );

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [supabase]);

  // Asegurar que sessionContextValue sea del tipo correcto
  const sessionContextValue = supabase 
    ? { session, supabase } 
    : null;

  return (
    <SessionContext.Provider value={sessionContextValue}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        {children}
      </ThemeProvider>
    </SessionContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(SessionContext);
  
  if (context === null) {
    throw new Error('useAuth must be used within a SupabaseProvider');
  }
  
  return context;
};

export default function Providers({ 
  children, 
  session: initialSession 
}: { 
  children: React.ReactNode;
  session?: UserSession | null;
}) {
  return (
    <SupabaseProvider initialSession={initialSession}>
      {children}
    </SupabaseProvider>
  );
}