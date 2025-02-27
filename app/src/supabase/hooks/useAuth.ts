'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { auth } from '../auth'

export function useAuth() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const signIn = async (email: string, password: string, redirectTo = '/dashboard') => {
    try {
      setLoading(true)
      const result = await auth.signIn(email, password)
      
      if (result.error) {
        toast.error(result.error.message)
        return null
      }

      toast.success('Inicio de sesión exitoso')
      router.push(redirectTo)
      return result.data?.user || null

    } catch (error) {
      toast.error('Error inesperado')
      return null
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (
    email: string, 
    password: string, 
    metadata: Record<string, any> = {},
    redirectTo = '/dashboard'
  ) => {
    try {
      setLoading(true)
      const result = await auth.signUp(email, password, metadata)
      
      if (result.error) {
        toast.error(result.error.message)
        return null
      }

      toast.success('Registro exitoso')
      router.push(redirectTo)
      return result.data?.user || null

    } catch (error) {
      toast.error('Error inesperado')
      return null
    } finally {
      setLoading(false)
    }
  }

  const signOut = async (redirectTo = '/') => {
    try {
      setLoading(true)
      const result = await auth.signOut()
      
      if (result.error) {
        toast.error(result.error.message)
        return false
      }

      router.push(redirectTo)
      return true

    } catch (error) {
      toast.error('Error al cerrar sesión')
      return false
    } finally {
      setLoading(false)
    }
  }

  return { 
    signIn, 
    signUp, 
    signOut, 
    loading 
  }
}