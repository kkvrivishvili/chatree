'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { Session } from '@supabase/supabase-js'
import { createClient } from './client'

// Contexto para proveer la sesión a toda la aplicación
type SupabaseContextType = {
  session: Session | null
  isLoading: boolean
}

const SupabaseContext = createContext<SupabaseContextType>({
  session: null,
  isLoading: true
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
  
  useEffect(() => {
    const supabase = createClient()
    if (!supabase) return
    
    // Si no tenemos una sesión inicial, intentamos obtenerla
    if (!initialSession) {
      supabase.auth.getSession().then(({ data }) => {
        setSession(data.session)
        setIsLoading(false)
      })
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
    <SupabaseContext.Provider value={{ session, isLoading }}>
      {children}
    </SupabaseContext.Provider>
  )
}

// Hook para usar el contexto
export function useSupabase() {
  return useContext(SupabaseContext)
}