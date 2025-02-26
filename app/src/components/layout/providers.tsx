'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import ThemeProvider from './ThemeToggle/theme-provider';
import { createClient } from '@/supabase/client';
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

const SessionContext = createContext<SessionContextType>({} as SessionContextType);

export const SupabaseProvider = ({ 
  children, 
  initialSession 
}: { 
  children: React.ReactNode;
  initialSession?: UserSession | null;
}) => {
  const supabase = createClient();
  const [session, setSession] = useState<UserSession | null>(initialSession || null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event: string, session: Session | null) => {
        if (session) {
          setSession({
            user: {
              id: session.user.id,
              email: session.user.email,
              user_metadata: session.user.user_metadata
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
  }, [supabase.auth]);

  return (
    <SessionContext.Provider value={{ session, supabase }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(SessionContext);
};

export default function Providers({ 
  children, 
  session: initialSession 
}: { 
  children: React.ReactNode;
  session?: UserSession | null;
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <SupabaseProvider initialSession={initialSession}>
        {children}
      </SupabaseProvider>
    </ThemeProvider>
  );
}