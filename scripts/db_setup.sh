#!/bin/bash

# ------------------------------------------------------------------------------
# Chatree - Configuración de la base de datos
# ------------------------------------------------------------------------------

# Ejecutar migraciones y configuración de la base de datos
setup_database() {
    print_message "info" "Configurando base de datos..."
    
    # Esperar a que Supabase esté listo
    check_service "supabase" 60 3 || return 1
    
    # Obtener contenedor de Supabase
    local supabase_container=$(docker ps -qf "name=supabase" | head -n1)
    if [ -z "$supabase_container" ]; then
        print_message "error" "No se pudo encontrar el contenedor de Supabase"
        return 1
    fi
    
    # Verificar si ya está inicializada la tabla de perfiles
    if docker exec $supabase_container psql -U postgres -d postgres -c "SELECT * FROM pg_tables WHERE tablename = 'profiles'" | grep -q "profiles"; then
        print_message "info" "Base de datos ya está inicializada"
    else
        print_message "info" "Aplicando esquema inicial..."
        
        local migration_file="$PROJECT_ROOT/Server/supabase/migrations/20250226000000_initial_schema.sql"
        if [ ! -f "$migration_file" ]; then
            print_message "error" "Archivo de migración no encontrado: $migration_file"
            return 1
        fi
        
        # Usar el contenedor de postgres directamente en lugar del contenedor de supabase
        local postgres_container=$(docker ps -qf "name=supabase-db" | head -n1)
        if [ -z "$postgres_container" ]; then
            print_message "error" "No se pudo encontrar el contenedor de PostgreSQL"
            return 1
        fi
        
        cat "$migration_file" | docker exec -i $postgres_container psql -U postgres -d postgres
        
        if [ $? -ne 0 ]; then
            print_message "error" "Error al aplicar migración inicial"
            return 1
        fi
        
        print_message "success" "Esquema inicial aplicado correctamente"
    fi
    
    # Verificar extensión pgvector
    if ! docker exec $postgres_container psql -U postgres -d postgres -c "SELECT * FROM pg_extension WHERE extname = 'vector'" | grep -q "vector"; then
        print_message "info" "Habilitando extensión pgvector..."
        
        docker exec $postgres_container psql -U postgres -d postgres -c "CREATE EXTENSION IF NOT EXISTS vector;"
        
        if [ $? -ne 0 ]; then
            print_message "error" "Error al habilitar pgvector"
            return 1
        fi
        
        print_message "success" "Extensión pgvector habilitada correctamente"
    else
        print_message "info" "Extensión pgvector ya está habilitada"
    fi
    
    print_message "success" "Base de datos configurada correctamente"
    return 0
}