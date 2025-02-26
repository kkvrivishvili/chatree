'use client'

import { useSupabase } from './useSupabase'
import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'

/**
 * Hook para obtener y mantener actualizada la sesión de usuario
 * @returns Objeto con la sesión actual, estado de carga y error
 * 
 * @example
 * const { session, loading } = useSession()
 * if (loading) return <p>Cargando...</p>
 * if (!session) return <p>No has iniciado sesión</p>
 * return <p>Bienvenido, {session.user.email}</p>
 */
export function useSession() {
  const supabase = useSupabase()
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

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

  return { session, loading, error }
}
