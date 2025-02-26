'use client'

import { useSupabase } from './useSupabase'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner' // Asumiendo que usas sonner para notificaciones

/**
 * Hook para manejar la autenticación de usuarios
 * Proporciona funciones para iniciar sesión, registrarse, cerrar sesión, etc.
 * @returns Funciones de autenticación y estados relacionados
 * 
 * @example
 * const { signIn, signUp, signOut, loading } = useAuth()
 * 
 * // Iniciar sesión
 * const handleSubmit = async (e) => {
 *   e.preventDefault()
 *   const { error } = await signIn(email, password)
 *   if (error) console.error(error)
 * }
 */
export function useAuth() {
  const supabase = useSupabase()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  
  /**
   * Inicia sesión con email y contraseña
   */
  const signIn = async (email: string, password: string, redirectTo?: string) => {
    try {
      setLoading(true)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) {
        throw error
      }
      
      if (redirectTo) {
        router.push(redirectTo)
      }
      
      return { data, error: null }
    } catch (error: any) {
      toast.error(error.message || 'Error al iniciar sesión')
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }
  
  /**
   * Registra un nuevo usuario
   */
  const signUp = async (email: string, password: string, userData: Record<string, any> = {}) => {
    try {
      setLoading(true)
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: userData
        }
      })
      
      if (error) {
        throw error
      }
      
      toast.success('Registro exitoso! Por favor revisa tu email para confirmar tu cuenta.')
      return { data, error: null }
    } catch (error: any) {
      toast.error(error.message || 'Error al registrarse')
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }
  
  /**
   * Cierra la sesión del usuario actual
   */
  const signOut = async (redirectTo: string = '/') => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        throw error
      }
      
      router.push(redirectTo)
      return { error: null }
    } catch (error: any) {
      toast.error(error.message || 'Error al cerrar sesión')
      return { error }
    } finally {
      setLoading(false)
    }
  }
  
  /**
   * Inicia sesión con un proveedor OAuth
   */
  const signInWithOAuth = async (provider: 'github' | 'google') => {
    try {
      setLoading(true)
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })
      
      if (error) {
        throw error
      }
      
      return { data, error: null }
    } catch (error: any) {
      toast.error(error.message || `Error al iniciar sesión con ${provider}`)
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }
  
  /**
   * Envía un enlace de restablecimiento de contraseña
   */
  const resetPassword = async (email: string) => {
    try {
      setLoading(true)
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      })
      
      if (error) {
        throw error
      }
      
      toast.success('Se ha enviado un enlace para restablecer la contraseña a tu email')
      return { data, error: null }
    } catch (error: any) {
      toast.error(error.message || 'Error al enviar el enlace de restablecimiento')
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }
  
  /**
   * Actualiza la contraseña del usuario
   */
  const updatePassword = async (password: string) => {
    try {
      setLoading(true)
      const { data, error } = await supabase.auth.updateUser({
        password
      })
      
      if (error) {
        throw error
      }
      
      toast.success('Contraseña actualizada correctamente')
      return { data, error: null }
    } catch (error: any) {
      toast.error(error.message || 'Error al actualizar la contraseña')
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }
  
  return {
    signIn,
    signUp,
    signOut,
    signInWithOAuth,
    resetPassword,
    updatePassword,
    loading
  }
}
