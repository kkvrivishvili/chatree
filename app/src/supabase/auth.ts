'use client'

import React from 'react'
import { createClient } from './client'
import { redirect } from 'next/navigation'
import type { Session } from '@supabase/supabase-js'

/**
 * Cliente de Supabase para usar en el archivo auth.ts
 */
const supabase = createClient()

/**
 * Funciones de autenticación para su uso en componentes del lado del cliente
 */
export const auth = {
  /**
   * Inicia sesión con email y contraseña
   * @param email - Email del usuario
   * @param password - Contraseña del usuario
   * @param redirectTo - URL opcional para redireccionar después de iniciar sesión
   */
  signIn: async (email: string, password: string, redirectTo?: string) => {
    return supabase.auth.signInWithPassword({
      email,
      password,
      options: redirectTo ? {
        redirectTo: redirectTo
      } : undefined
    })
  },
  
  /**
   * Registra un nuevo usuario
   * @param email - Email del usuario
   * @param password - Contraseña del usuario
   * @param userData - Datos adicionales del usuario (opcional)
   */
  signUp: async (email: string, password: string, userData: Record<string, any> = {}) => {
    return supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: userData
      }
    })
  },
  
  /**
   * Cierra la sesión del usuario actual
   */
  signOut: async () => {
    return supabase.auth.signOut()
  },
  
  /**
   * Inicia sesión con un proveedor OAuth
   * @param provider - Proveedor OAuth ('github', 'google', etc.)
   */
  oAuthSignIn: async (provider: 'github' | 'google') => {
    return supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
  },

  /**
   * Obtiene la sesión actual en el cliente
   */
  getSession: async () => {
    const { data } = await supabase.auth.getSession()
    return data.session
  },

  /**
   * Obtiene el usuario actual en el cliente
   */
  getUser: async () => {
    const { data } = await supabase.auth.getUser()
    return data.user
  }
}

/**
 * Hook para obtener la sesión actual de Supabase
 * @returns Objeto con la sesión y estado de carga
 */
export const useSupabaseSession = () => {
  const [session, setSession] = React.useState<Session | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    // Actualiza el estado inicial con la sesión actual
    const initializeSession = async () => {
      const { data } = await supabase.auth.getSession()
      setSession(data.session)
      setLoading(false)
    }

    initializeSession()

    // Escucha cambios en la autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession)
        setLoading(false)
      }
    )

    // Limpia la suscripción al desmontar el componente
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return { session, loading }
}
