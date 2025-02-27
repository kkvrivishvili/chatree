'use client'

import { useEffect, useState, useCallback } from 'react'
import { getSupabaseBrowserClient } from '../client'
import type { Session } from '@supabase/supabase-js'

export function useSession() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchSession() {
      try {
        const supabase = getSupabaseBrowserClient()
        
        // Obtener sesión inicial
        const { data: { session } } = await supabase.auth.getSession()
        setSession(session)

        // Suscribirse a cambios
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (_event, newSession) => {
            setSession(newSession)
          }
        )

        return () => {
          subscription.unsubscribe()
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Error desconocido'))
      } finally {
        setLoading(false)
      }
    }

    const cleanup = fetchSession()
    return () => {
      cleanup.then(unsubscribe => unsubscribe?.())
    }
  }, [])

  return { 
    session, 
    loading, 
    error,
    isAuthenticated: !!session 
  }
}