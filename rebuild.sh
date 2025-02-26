#!/bin/bash

# ------------------------------------------------------------------------------
# Chatree - Script de reconstrucción completa
# ------------------------------------------------------------------------------
# Este script elimina todos los contenedores e imágenes anteriores
# y reconstruye todo el proyecto desde cero
# ------------------------------------------------------------------------------

# Configuraciones globales
export PROJECT_ROOT=$(pwd)
export SCRIPTS_DIR="$PROJECT_ROOT/scripts"
export LOG_DIR="$PROJECT_ROOT/logs"
mkdir -p "$LOG_DIR"
export LOG_FILE="$LOG_DIR/rebuild_$(date +%Y%m%d_%H%M%S).log"

# Verificar que todos los scripts existan
if [ ! -d "$SCRIPTS_DIR" ]; then
    echo "Error: Directorio de scripts no encontrado. Ejecute este script desde la raíz del proyecto."
    exit 1
fi

# Cargar módulos de utilidades
if [ -f "$SCRIPTS_DIR/utils.sh" ]; then
    source "$SCRIPTS_DIR/utils.sh"
else
    echo "Error: No se encontró el archivo utils.sh. Asegúrese de que existe en $SCRIPTS_DIR."
    exit 1
fi

# Función principal de reconstrucción
rebuild() {
    # Banner de inicio
    echo -e "${BOLD}${MAGENTA}"
    echo "╔═════════════════════════════════════════════════════════╗"
    echo "║                                                         ║"
    echo "║             CHATREE - RECONSTRUCCIÓN COMPLETA           ║"
    echo "║                                                         ║"
    echo "╚═════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    
    # Verificar si se está ejecutando como root
    check_root
    
    # Paso 1: Detener todos los contenedores
    print_message "step" "Paso 1: Deteniendo todos los contenedores de Chatree"
    if docker compose ps -q &>/dev/null; then
        if ! docker compose down -v; then
            print_message "warning" "Hubo un problema al detener los contenedores. Intentando forzar..."
            docker compose down -v --remove-orphans
        fi
        print_message "success" "Contenedores detenidos correctamente"
    else
        print_message "info" "No hay contenedores en ejecución"
    fi
    
    # Paso 2: Eliminar volúmenes
    print_message "step" "Paso 2: Eliminando volúmenes de Docker"
    local volumes=$(docker volume ls -q -f name=chatree)
    if [ -n "$volumes" ]; then
        echo "$volumes" | xargs -r docker volume rm
        print_message "success" "Volúmenes eliminados correctamente"
    else
        print_message "info" "No se encontraron volúmenes relacionados con Chatree"
    fi
    
    # Paso 3: Eliminar imágenes
    print_message "step" "Paso 3: Eliminando imágenes de Docker relacionadas con Chatree"
    # Obtener IDs de imágenes relacionadas con el proyecto
    local project_name=$(basename "$PROJECT_ROOT" | tr '[:upper:]' '[:lower:]')
    local images=$(docker images --format "{{.Repository}}:{{.Tag}}" | grep -E "${project_name}|chatree")
    
    if [ -n "$images" ]; then
        echo "$images" | xargs -r docker rmi -f
        print_message "success" "Imágenes eliminadas correctamente"
    else
        print_message "info" "No se encontraron imágenes relacionadas con Chatree"
    fi
    
    # Paso 4: Limpiar caché de Docker
    print_message "step" "Paso 4: Limpiando caché de Docker"
    if ! docker system prune -f; then
        print_message "warning" "Error al limpiar la caché de Docker. Continuando..."
    else
        print_message "success" "Caché de Docker limpiada correctamente"
    fi
    
    # Paso 5: Verificar configuración de variables de entorno
    print_message "step" "Paso 5: Verificando variables de entorno"
    if [ -f "$SCRIPTS_DIR/env_setup.sh" ]; then
        source "$SCRIPTS_DIR/env_setup.sh"
        setup_env || {
            print_message "error" "Error en la configuración de variables de entorno"
            exit 1
        }
    else
        print_message "error" "No se encontró el script env_setup.sh"
        exit 1
    fi
    
    # Paso 6: Reconstruir todos los servicios
    print_message "step" "Paso 6: Reconstruyendo todos los servicios"
    if ! docker compose build --no-cache; then
        print_message "error" "Error al reconstruir los servicios"
        exit 1
    fi
    print_message "success" "Servicios reconstruidos correctamente"
    
    # Paso 7: Iniciar servicios
    print_message "step" "Paso 7: Iniciando servicios"
    if ! docker compose up -d --force-recreate; then
        print_message "error" "Error al iniciar los servicios"
        exit 1
    fi
    print_message "success" "Servicios iniciados correctamente"
    
    # Paso 8: Verificar servicios
    print_message "step" "Paso 8: Verificando servicios"
    if [ -f "$SCRIPTS_DIR/models_setup.sh" ]; then
        source "$SCRIPTS_DIR/models_setup.sh"
        check_services
    else
        print_message "warning" "No se pudo verificar los servicios (models_setup.sh no encontrado)"
        # Verificación alternativa básica
        docker compose ps
    fi
    
    # Mostrar información
    show_info
    
    print_message "success" "¡Reconstrucción completa finalizada!"
    print_message "info" "Puedes acceder a la aplicación en: http://localhost:3000"
    
    # Preguntar antes de abrir la aplicación
    read -p "¿Deseas abrir la aplicación en el navegador? (s/n): " open_browser
    if [[ "$open_browser" =~ ^[Ss]$ ]]; then
        open_app
    fi
    
    # Ofrecer monitorización de logs
    read -p "¿Deseas monitorizar los logs de los servicios? (s/n): " monitor
    if [[ "$monitor" =~ ^[Ss]$ ]]; then
        docker compose logs -f
    fi
}

# Ejecutar función principal
rebuild "$@"
