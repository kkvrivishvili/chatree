#!/bin/bash

# ------------------------------------------------------------------------------
# Chatree - Script de inicialización principal
# ------------------------------------------------------------------------------
# Este script orquesta la ejecución de módulos para inicializar Chatree
# ------------------------------------------------------------------------------

# Configuraciones globales
export PROJECT_ROOT=$(pwd)
export SCRIPTS_DIR="$PROJECT_ROOT/scripts"
export LOG_DIR="$PROJECT_ROOT/logs"
mkdir -p "$LOG_DIR"
export LOG_FILE="$LOG_DIR/startup_$(date +%Y%m%d_%H%M%S).log"

# Verificar que todos los scripts existan
if [ ! -d "$SCRIPTS_DIR" ]; then
    echo "Error: Directorio de scripts no encontrado. Ejecute este script desde la raíz del proyecto."
    exit 1
fi

# Cargar módulos
source "$SCRIPTS_DIR/utils.sh"
source "$SCRIPTS_DIR/check_deps.sh"
source "$SCRIPTS_DIR/docker_setup.sh"
source "$SCRIPTS_DIR/env_setup.sh"
source "$SCRIPTS_DIR/frontend_build.sh"
source "$SCRIPTS_DIR/db_setup.sh"
source "$SCRIPTS_DIR/models_setup.sh"

# Función principal
main() {
    # Banner de inicio
    print_banner
    
    # Verificar si se está ejecutando como root
    check_root
    
    # Verificar e instalar dependencias
    print_message "step" "Paso 1: Verificando dependencias"
    check_dependencies || exit 1
    
    # Configurar variables de entorno
    print_message "step" "Paso 2: Configurando variables de entorno"
    setup_env || exit 1
    
    # Configurar Docker
    print_message "step" "Paso 3: Configurando Docker"
    setup_docker || exit 1
    
    # Construir el frontend
    print_message "step" "Paso 4: Preparando frontend"
    build_frontend || print_message "warning" "Advertencia: Problemas al preparar el frontend"
    
    # Iniciar servicios
    print_message "step" "Paso 5: Iniciando servicios"
    if ! docker compose up -d; then
        print_message "error" "Fallo al iniciar servicios. Abortando."
        exit 1
    fi
    
    # Configurar base de datos
    print_message "step" "Paso 6: Configurando base de datos"
    setup_database || print_message "warning" "Advertencia: Problemas con la configuración de la base de datos"
    
    # Configurar modelos
    print_message "step" "Paso 7: Configurando modelos Ollama"
    setup_models || print_message "warning" "Advertencia: Problemas con la configuración de modelos"
    
    # Verificar servicios
    print_message "step" "Paso 8: Verificando servicios"
    check_services
    
    # Mostrar información y abrir la aplicación
    show_info
    open_app
    
    # Ofrecer monitorización de logs
    print_message "info" "Chatree está listo para usar!"
    read -p "¿Deseas monitorizar los logs de los servicios? (s/n): " monitor
    if [[ "$monitor" =~ ^[Ss]$ ]]; then
        docker compose logs -f
    fi
}

# Ejecutar función principal
main "$@"