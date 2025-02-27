'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { Session } from '@supabase/supabase-js'
import { createClient } from './client'

// Contexto para proveer la sesión a toda la aplicación
type SupabaseContextType = {
  session: Session | null
  isLoading: boolean
  error: Error | null
}

const SupabaseContext = createContext<SupabaseContextType>({
  session: null,
  isLoading: true,
  error: null
})

export function SupabaseProvider({ 
  children,
  initialSession
}: { 
  children: React.ReactNode
  initialSession?: Session | null
}) {
  const [session, setSession] = useState<Session | null>(initialSession || null)
  const [isLoading, setIsLoading] = useState(!initialSession)
  const [error, setError] = useState<Error | null>(null)
  
  useEffect(() => {
    const supabase = createClient()
    if (!supabase) {
      setError(new Error('No se pudo crear el cliente de Supabase'))
      setIsLoading(false)
      return
    }
    
    // Si no tenemos una sesión inicial, intentamos obtenerla
    const fetchSession = async () => {
      try {
        setIsLoading(true)
        const { data } = await supabase.auth.getSession()
        setSession(data.session)
      } catch (fetchError) {
        setError(fetchError as Error)
      } finally {
        setIsLoading(false)
      }
    }

    if (!initialSession) {
      fetchSession()
    }
    
    // Suscribirnos a cambios en la autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        setIsLoading(false)
      }
    )
    
    return () => {
      subscription.unsubscribe()
    }
  }, [initialSession])
  
  return (
    <SupabaseContext.Provider value={{ session, isLoading, error }}>
      {children}
    </SupabaseContext.Provider>
  )
}

// Hook para usar el contexto
export function useSupabase() {
  return useContext(SupabaseContext)
}