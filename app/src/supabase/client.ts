'use client';
import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/supabase';
import type { SupabaseClient } from '@supabase/supabase-js';

// Singleton seguro para cliente Supabase
class SupabaseClientManager {
  private static instance: SupabaseClient<Database> | null = null;

  private constructor() {}

  static getInstance(): SupabaseClient<Database> {
    if (typeof window === 'undefined') {
      throw new Error('Supabase client solo puede usarse en navegador');
    }

    if (!this.instance) {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!url || !anonKey) {
        throw new Error('Configuración de Supabase incompleta');
      }

      try {
        this.instance = createBrowserClient<Database>(url, anonKey);
      } catch (error) {
        console.error('Error al crear cliente Supabase:', error);
        throw error;
      }
    }

    return this.instance;
  }

  static reset(): void {
    this.instance = null;
  }
}

export function createSupabaseClient(): SupabaseClient<Database> {
  return SupabaseClientManager.getInstance();
}

export function getSupabaseBrowserClient(): SupabaseClient<Database> {
  return SupabaseClientManager.getInstance();
}