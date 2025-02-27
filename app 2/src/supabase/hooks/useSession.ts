'use client'

import { useState, useEffect } from 'react'
import { getSupabaseBrowserClient } from '../client'
import type { Session } from '@supabase/supabase-js'

export function useSession() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const supabase = getSupabaseBrowserClient()

    async function fetchSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setSession(session)
        setLoading(false)

        // Suscribirse a cambios de autenticación
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (_event, newSession) => {
            setSession(newSession)
          }
        )

        return () => subscription.unsubscribe()

      } catch (err) {
        setError(err instanceof Error ? err : new Error('Error de sesión'))
        setLoading(false)
      }
    }

    fetchSession()
  }, [])

  return { 
    session, 
    loading, 
    error,
    isAuthenticated: !!session 
  }
}