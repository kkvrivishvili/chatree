#!/bin/bash

# ------------------------------------------------------------------------------
# Chatree - Configuración de modelos
# ------------------------------------------------------------------------------

# Configurar y descargar modelos de Ollama
setup_models() {
    print_message "info" "Configurando modelos de Ollama..."
    
    # Esperar a que Ollama esté listo
    check_service "ollama" 60 3 || return 1
    
    # Obtener contenedor de Ollama
    local ollama_container=$(docker ps -qf "name=ollama" | head -n1)
    if [ -z "$ollama_container" ]; then
        print_message "error" "No se pudo encontrar el contenedor de Ollama"
        return 1
    fi
    
    # Verificar si el modelo está disponible
    if docker exec $ollama_container ollama list 2>/dev/null | grep -q "llama3:8b"; then
        print_message "info" "El modelo llama3:8b ya está disponible"
    else
        print_message "info" "Descargando modelo llama3:8b (esto puede tardar varios minutos)..."
        
        docker exec $ollama_container ollama pull llama3:8b
        
        if [ $? -ne 0 ]; then
            print_message "error" "Error al descargar modelo llama3:8b"
            return 1
        fi
        
        print_message "success" "Modelo llama3:8b descargado correctamente"
    fi
    
    # Verificar modelo base para embeddings
    if ! docker exec $ollama_container ollama list 2>/dev/null | grep -q "llama3"; then
        print_message "info" "Descargando modelo base llama3 para embeddings..."
        
        docker exec $ollama_container ollama pull llama3
        
        if [ $? -ne 0 ]; then
            print_message "warning" "Error al descargar modelo base. Se usará llama3:8b para embeddings."
        else
            print_message "success" "Modelo base descargado correctamente"
        fi
    fi
    
    print_message "success" "Modelos configurados correctamente"
    return 0
}

# Función para verificar todos los servicios
check_services() {
    print_message "info" "Verificando estado de servicios..."
    
    local services=("supabase-db" "supabase" "ollama" "redis" "langchain-server" "app")
    local all_ok=true
    
    for service in "${services[@]}"; do
        if ! check_service "$service" 20 1; then
            all_ok=false
        fi
    done
    
    if $all_ok; then
        print_message "success" "Todos los servicios están funcionando correctamente"
    else
        print_message "warning" "Algunos servicios podrían no estar funcionando correctamente"
    fi
}