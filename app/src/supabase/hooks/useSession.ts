'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '../client'
import type { Session } from '@supabase/supabase-js'

/**
 * Hook para obtener y mantener actualizada la sesión de usuario
 * @returns Objeto con la sesión actual, estado de carga y funciones
 */
export function useSession() {
  const [supabase] = useState(() => createClient())
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Función para actualizar el estado de sesión
  const updateSession = useCallback((newSession: Session | null) => {
    setSession(newSession)
  }, [])

  useEffect(() => {
    // Cargar la sesión inicial
    const getInitialSession = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          throw error
        }
        
        setSession(data.session)
      } catch (error) {
        setError(error as Error)
        console.error('Error al cargar la sesión:', error)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Suscribirse a cambios en la autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        setLoading(false)
      }
    )

    // Limpiar la suscripción al desmontar
    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  return { 
    session, 
    loading, 
    error, 
    updateSession,
    isAuthenticated: !!session
  }
}