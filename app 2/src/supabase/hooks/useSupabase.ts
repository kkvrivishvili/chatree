'use client'

import { createSupabaseClient } from '../client'
import { useState } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../types'

/**
 * Hook para obtener una instancia del cliente Supabase
 * Optimizado para componentes del lado del cliente
 * @returns Instancia del cliente Supabase con tipado completo
 * 
 * @example 
 * const supabase = useSupabase()
 * const { data } = await supabase.from('profiles').select('*')
 */
export function useSupabase() {
  // useState con función inicializadora para que solo se cree una vez
  const [supabase] = useState<SupabaseClient<Database>>(() => createSupabaseClient()!)
  return supabase
}
