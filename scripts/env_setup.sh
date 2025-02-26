#!/bin/bash

# ------------------------------------------------------------------------------
# Chatree - Configuración del entorno
# ------------------------------------------------------------------------------

# Verificar variables de entorno críticas
verify_env_variables() {
    print_message "info" "Verificando variables de entorno críticas..."
    
    local critical_vars=(
        # Supabase
        "SUPABASE_ANON_KEY"
        "SUPABASE_SERVICE_ROLE_KEY"
        "POSTGRES_PASSWORD"
        "NEXT_PUBLIC_SUPABASE_URL"
        "NEXT_PUBLIC_SUPABASE_ANON_KEY"
        
        # Redis
        "REDIS_PASSWORD"
        "REDIS_URL"
        
        # LangChain
        "LANGCHAIN_API_KEY"
        "LANGCHAIN_PROJECT"
        
        # GitHub OAuth (si se usa)
        "GITHUB_CLIENT_ID"
        "GITHUB_CLIENT_SECRET"
    )
    
    local all_ok=true
    
    for var in "${critical_vars[@]}"; do
        # Verificar si la variable existe y no está vacía
        if [ -z "${!var}" ]; then
            print_message "warning" "Variable $var no está configurada o está vacía"
            all_ok=false
        else
            print_message "success" "Variable $var configurada correctamente"
        fi
    done
    
    if $all_ok; then
        print_message "success" "Variables de entorno críticas verificadas"
        return 0
    else
        print_message "warning" "Algunas variables de entorno críticas podrían no estar correctamente configuradas"
        read -p "¿Deseas continuar de todos modos? (s/n): " continue_anyway
        if [[ "$continue_anyway" =~ ^[Ss]$ ]]; then
            return 0
        else
            return 1
        fi
    fi
}

# Eliminar archivos .env duplicados en subdirectorios
remove_duplicate_env_files() {
    print_message "info" "Buscando archivos .env duplicados en subdirectorios..."
    
    # Directorios donde pueden existir archivos .env duplicados
    local subdirs=(
        "$PROJECT_ROOT/Server"
        "$PROJECT_ROOT/Server/supabase"
        "$PROJECT_ROOT/Server/langchain"
    )
    
    for dir in "${subdirs[@]}"; do
        if [ -f "$dir/.env" ]; then
            print_message "warning" "Se encontró archivo .env en $dir"
            read -p "¿Deseas eliminarlo y usar solo el archivo centralizado? (s/n): " remove_file
            if [[ "$remove_file" =~ ^[Ss]$ ]]; then
                mv "$dir/.env" "$dir/.env.bak.$(date +%Y%m%d%H%M%S)"
                print_message "success" "Archivo .env en $dir movido a backup"
            fi
        fi
    done
}

# Detectar y solucionar problemas comunes de configuración
check_env_config_issues() {
    print_message "info" "Verificando posibles problemas de configuración..."
    
    local issues_found=false
    local env_file="$PROJECT_ROOT/.env"
    
    # Verificar URLs de Supabase
    if grep -q "NEXT_PUBLIC_SUPABASE_URL=http://supabase" "$env_file"; then
        print_message "warning" "La URL de Supabase para el frontend debe ser accesible desde el navegador."
        print_message "warning" "Cambia 'NEXT_PUBLIC_SUPABASE_URL=http://supabase' a 'NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321'"
        issues_found=true
    fi
    
    # Verificar que las claves anónimas coincidan
    local anon_key=$(grep "^SUPABASE_ANON_KEY=" "$env_file" | head -n 1 | cut -d '=' -f2 | tr -d ' "')
    local next_anon_key=$(grep "^NEXT_PUBLIC_SUPABASE_ANON_KEY=" "$env_file" | head -n 1 | cut -d '=' -f2 | tr -d ' "')
    
    # Limpiar posibles comentarios al final de la línea
    anon_key=$(echo "$anon_key" | sed 's/#.*$//')
    next_anon_key=$(echo "$next_anon_key" | sed 's/#.*$//')
    
    # Eliminar espacios en blanco al final
    anon_key=$(echo "$anon_key" | xargs)
    next_anon_key=$(echo "$next_anon_key" | xargs)
    
    if [ "$anon_key" != "$next_anon_key" ]; then
        print_message "warning" "Las claves anónimas de Supabase no coinciden entre SUPABASE_ANON_KEY y NEXT_PUBLIC_SUPABASE_ANON_KEY"
        print_message "warning" "Esto puede causar problemas de autenticación en el frontend"
        issues_found=true
    fi
    
    # Verificar contraseñas débiles en entornos de producción
    if [ "$NODE_ENV" = "production" ]; then
        if grep -q "POSTGRES_PASSWORD=postgres123" "$env_file" || 
           grep -q "REDIS_PASSWORD=redis123" "$env_file"; then
            print_message "warning" "Estás usando contraseñas predeterminadas en un entorno de producción"
            print_message "warning" "Por favor, cambia las contraseñas predeterminadas por unas más seguras"
            issues_found=true
        fi
    fi
    
    # Verificar consistencia de URLs
    if grep -q "SUPABASE_URL=http://supabase:8000" "$env_file" && 
       ! grep -q "NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321" "$env_file"; then
        print_message "warning" "La configuración de URLs de Supabase parece inconsistente"
        print_message "info" "Para desarrollo local, se recomienda:"
        print_message "info" "SUPABASE_URL=http://supabase:8000 (para servicios Docker)"
        print_message "info" "NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321 (para el navegador)"
        issues_found=true
    fi
    
    if $issues_found; then
        print_message "warning" "Se encontraron posibles problemas en tu configuración."
        read -p "¿Deseas editar el archivo .env ahora? (s/n): " edit_env
        if [[ "$edit_env" =~ ^[Ss]$ ]]; then
            ${EDITOR:-vi} "$env_file"
            # Recargar variables de entorno
            set -a
            source "$env_file"
            set +a
        fi
    else
        print_message "success" "No se detectaron problemas comunes de configuración"
    fi
}

# Configurar archivo de variables de entorno centralizado
setup_env() {
    local env_file="$PROJECT_ROOT/.env"
    local template="$PROJECT_ROOT/.env.example"
    
    if [ ! -f "$env_file" ]; then
        print_message "info" "Archivo .env centralizado no encontrado"
        
        if [ -f "$template" ]; then
            cp "$template" "$env_file"
            print_message "success" "Creado .env desde plantilla"
        else
            print_message "warning" "Creando .env básico centralizado"
            
            cat > "$env_file" << EOL
# ------------------------------------------------------------------------------
# Chatree - Variables de Entorno Centralizadas
# ------------------------------------------------------------------------------
# Este archivo centraliza todas las variables de entorno para los diferentes 
# servicios y componentes de Chatree. Todos los servicios utilizan este archivo.
# ------------------------------------------------------------------------------

# Supabase Configuration
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU
POSTGRES_PASSWORD=postgres123
SUPABASE_URL=http://supabase:8000
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU

# Frontend Supabase Configuration
# Estas variables son utilizadas por Next.js
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0

# GitHub OAuth
GITHUB_CLIENT_ID=test_github_client_id
GITHUB_CLIENT_SECRET=test_github_client_secret

# LangChain Configuration
LANGCHAIN_API_KEY=your_langchain_api_key
LANGCHAIN_PROJECT=chatree
LANGCHAIN_TRACING_V2=true
OPENAI_API_KEY=sk-test

# Redis Configuration
REDIS_PASSWORD=redis123
REDIS_URL=redis://redis:6379
EOL
        fi
        
        print_message "warning" "Por favor, revisa y edita .env según sea necesario"
        read -p "Presiona Enter cuando hayas terminado... "
    else
        print_message "success" "Archivo .env centralizado encontrado"
    fi
    
    # Eliminar archivos .env duplicados
    remove_duplicate_env_files
    
    # Cargar variables de entorno
    set -a
    source "$env_file"
    set +a
    
    # Verificar variables críticas
    verify_env_variables || return 1
    
    # Verificar problemas comunes de configuración
    check_env_config_issues
    
    # Informar sobre el acceso a variables de entorno para Next.js
    print_message "info" "Next.js necesita acceso a las variables de entorno"
    print_message "info" "Las variables de entorno para Next.js deben configurarse manualmente en el archivo .env.local"
    print_message "info" "O configurarse en el archivo docker-compose.yml en la sección 'environment' del servicio 'app'"
    
    return 0
}