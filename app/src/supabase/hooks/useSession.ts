'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '../client'
import type { Session } from '@supabase/supabase-js'

// Cliente Supabase singleton para todos los hooks
let supabaseClient: ReturnType<typeof createClient>;

/**
 * Hook para obtener y mantener actualizada la sesión de usuario
 * @returns Objeto con la sesión actual, estado de carga y funciones
 */
export function useSession() {
  // Inicializar cliente solo en el lado del cliente
  const [client, setClient] = useState<ReturnType<typeof createClient> | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Inicializar el cliente una vez que estamos en el cliente
  useEffect(() => {
    // Si ya existe un cliente singleton, úsalo
    if (supabaseClient) {
      setClient(supabaseClient);
      return;
    }
    
    // Si no, crea un nuevo cliente
    const newClient = createClient();
    if (newClient) {
      supabaseClient = newClient;
      setClient(newClient);
    } else {
      console.error('No se pudo crear el cliente Supabase');
      setLoading(false);
    }
  }, []);

  // Función para actualizar el estado de sesión
  const updateSession = useCallback((newSession: Session | null) => {
    setSession(newSession);
  }, []);

  // Cargar la sesión y suscribirse a cambios
  useEffect(() => {
    if (!client) return;
    
    // Cargar la sesión inicial
    const getInitialSession = async () => {
      try {
        setLoading(true);
        const { data, error } = await client.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        // Manejar explícitamente el caso de sesión nula
        setSession(data.session);
      } catch (error) {
        setError(error as Error);
        console.error('Error al cargar la sesión:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Suscribirse a cambios en la autenticación
    const { data: { subscription } } = client.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setLoading(false);
      }
    );

    // Limpiar la suscripción al desmontar
    return () => {
      subscription.unsubscribe();
    };
  }, [client]);

  return { 
    session, 
    loading, 
    error, 
    updateSession,
    isAuthenticated: !!session
  };
}