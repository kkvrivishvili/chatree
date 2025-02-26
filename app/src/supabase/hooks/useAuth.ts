'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { auth } from '../auth'
import { useSession } from './useSession'

/**
 * Hook para manejar la autenticación de usuarios
 * Proporciona funciones para iniciar sesión, registrarse, cerrar sesión, etc.
 */
export function useAuth() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const { updateSession } = useSession()
  
/**
 * Inicia sesión con email y contraseña
 */
const signIn = async (email: string, password: string, redirectTo?: string) => {
  try {
    setLoading(true)
    const { data, error } = await auth.signIn(email, password)
    
    if (error) {
      throw error
    }
    
    // Actualiza la sesión en el estado global con la sesión correcta
    updateSession(data.session)
    
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
      const { data, error } = await auth.signUp(email, password, userData)
      
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
      const { error } = await auth.signOut()
      
      if (error) {
        throw error
      }
      
      // Actualiza la sesión a null en el estado global
      updateSession(null)
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
 * Nota: La redirección y actualización de sesión se manejan automáticamente
 * a través de la ruta /auth/callback después de la autenticación exitosa
 */
const signInWithOAuth = async (provider: 'github' | 'google') => {
  try {
    setLoading(true)
    const { data, error } = await auth.signInWithOAuth(provider)
    
    if (error) {
      throw error
    }
    
    // No necesitamos actualizar la sesión aquí, ya que se hará en el callback
    // No hay redirección manual ya que Supabase maneja la redirección a través de OAuth
    
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
      const { error } = await auth.resetPassword(email)
      
      if (error) {
        throw error
      }
      
      toast.success('Se ha enviado un enlace para restablecer la contraseña a tu email')
      return { error: null }
    } catch (error: any) {
      toast.error(error.message || 'Error al enviar el enlace de restablecimiento')
      return { error }
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
      const { data, error } = await auth.updatePassword(password)
      
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