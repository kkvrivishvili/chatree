#!/bin/bash

# Script para iniciar Supabase localmente
# Este script debe ejecutarse desde la raíz del proyecto

echo "Iniciando Supabase localmente..."

# Verificar si Supabase CLI está instalado
if ! command -v supabase &> /dev/null; then
    echo "Supabase CLI no está instalado. Por favor, instálalo siguiendo las instrucciones en https://supabase.com/docs/guides/cli"
    exit 1
fi

# Ir al directorio de Supabase
cd Server/supabase || exit

# Iniciar Supabase
echo "Iniciando servicios de Supabase..."
supabase start

# Verificar si se inició correctamente
if [ $? -eq 0 ]; then
    echo "Supabase se ha iniciado correctamente."
    echo "URL de la API: http://localhost:54321"
    echo "URL del Studio: http://localhost:54323"
    echo "Anon Key: $(supabase status | grep anon_key | awk '{print $2}')"
    echo "Service Role Key: $(supabase status | grep service_role_key | awk '{print $2}')"
else
    echo "Error al iniciar Supabase."
    exit 1
fi
