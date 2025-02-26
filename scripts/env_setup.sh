#!/bin/bash

# ------------------------------------------------------------------------------
# Chatree - Configuración del entorno
# ------------------------------------------------------------------------------

# Configurar archivo de variables de entorno
setup_env() {
    local env_file="$PROJECT_ROOT/.env"
    local template="$PROJECT_ROOT/.env.example"
    
    if [ ! -f "$env_file" ]; then
        print_message "info" "Archivo .env no encontrado"
        
        if [ -f "$template" ]; then
            cp "$template" "$env_file"
            print_message "success" "Creado .env desde plantilla"
        else
            print_message "warning" "Creando .env básico"
            
            cat > "$env_file" << EOL
# Supabase Configuration
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU
POSTGRES_PASSWORD=postgres123
SUPABASE_URL=http://supabase:8000
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU

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
        print_message "success" "Archivo .env encontrado"
    fi
    
    # Cargar variables de entorno
    set -a
    source "$env_file"
    set +a
    
    return 0
}