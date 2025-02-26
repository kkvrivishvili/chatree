#!/bin/bash

# ------------------------------------------------------------------------------
# Chatree - Script de inicialización principal
# ------------------------------------------------------------------------------
# Este script orquesta la ejecución de módulos para inicializar Chatree
# utilizando un sistema de variables de entorno centralizado
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
source "$SCRIPTS_DIR/setup_modules.sh"

# Banner de inicio
print_banner

# Preguntar si se quiere hacer un rebuild completo
echo -e "${YELLOW}¿Deseas realizar una reconstrucción completa del proyecto?${NC}"
echo -e "Esto eliminará todos los contenedores, imágenes y caché de Docker relacionados con Chatree."
echo -e "Recomendado cuando se actualizan dependencias o se hacen cambios importantes en el código."
read -p "Reconstruir completamente (s/n): " do_rebuild

if [[ "$do_rebuild" =~ ^[Ss]$ ]]; then
    print_message "info" "Iniciando reconstrucción completa..."
    "$PROJECT_ROOT/rebuild.sh"
    exit $?
fi

# Función principal
main() {
    # Verificar si se está ejecutando como root
    check_root
    
    # Verificar e instalar dependencias
    print_message "step" "Paso 1: Verificando dependencias"
    check_dependencies || exit 1
    
    # Configurar variables de entorno centralizadas
    print_message "step" "Paso 2: Configurando variables de entorno centralizadas"
    print_message "info" "Todas las variables se gestionan desde un único archivo .env en la raíz"
    setup_env || exit 1
    
    # Configurar Docker
    print_message "step" "Paso 3: Configurando Docker"
    setup_docker || exit 1
    
    # Confirmar continuación
    print_message "info" "Configuración básica completada. Los siguientes pasos iniciarán los servicios."
    read -p "¿Deseas continuar con la inicialización de servicios? (s/n): " continue_setup
    if [[ ! "$continue_setup" =~ ^[Ss]$ ]]; then
        print_message "info" "Inicialización cancelada por el usuario"
        exit 0
    fi
    
    # Iniciar servicios
    print_message "step" "Paso 4: Iniciando servicios"
    print_message "info" "Los servicios utilizarán las variables centralizadas de .env"
    if ! docker compose up -d; then
        print_message "error" "Fallo al iniciar servicios. Abortando."
        exit 1
    fi
    
    # Verificar servicios iniciados
    print_message "info" "Verificando estado inicial de servicios..."
    docker compose ps
    
    # Preparar el frontend (una vez que los servicios están en ejecución)
    print_message "step" "Paso 5: Preparando frontend"
    print_message "info" "El frontend utilizará variables de entorno desde el archivo .env centralizado"
    build_frontend || print_message "warning" "Advertencia: Problemas al preparar el frontend"
    
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
    
    # Preguntar antes de abrir la aplicación
    read -p "¿Deseas abrir la aplicación en el navegador? (s/n): " open_browser
    if [[ "$open_browser" =~ ^[Ss]$ ]]; then
        open_app
    fi
    
    # Ofrecer monitorización de logs
    print_message "info" "Chatree está listo para usar!"
    read -p "¿Deseas monitorizar los logs de los servicios? (s/n): " monitor
    if [[ "$monitor" =~ ^[Ss]$ ]]; then
        docker compose logs -f
    fi
}

# Ejecutar función principal
main "$@"

# Agregar mensaje informativo sobre la reconstrucción
echo -e "\n${YELLOW}Nota:${NC} Si necesitas reconstruir completamente el proyecto (borrar imágenes y contenedores),"
echo -e "utiliza el script ${GREEN}./rebuild.sh${NC} para crear todo desde cero."