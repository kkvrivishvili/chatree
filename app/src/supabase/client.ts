// /media/konstantin/DATOS/VSCODE/chatree/app/src/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'
import { type Database } from './types'

/**
 * Crea un cliente Supabase para usar en el navegador (componentes del lado del cliente)
 * Este cliente está optimizado para su uso en componentes 'use client'
 */
export const createClient = () => {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

/**
 * Cliente singleton preconfigurado para usar en componentes del lado del cliente
 * Utilice este cliente cuando no necesite crear una nueva instancia
 * @example
 * import { supabase } from '@/supabase/client'
 * 
 * const { data } = await supabase.from('profiles').select('*')
 */
export const supabase = createClient()