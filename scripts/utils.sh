#!/bin/bash

# ------------------------------------------------------------------------------
# Chatree - Funciones de utilidad
# ------------------------------------------------------------------------------

# Colores para mensajes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Función para imprimir mensajes
print_message() {
    local type=$1
    local message=$2
    local color=$NC
    
    case $type in
        "info") color=$BLUE ;;
        "success") color=$GREEN ;;
        "warning") color=$YELLOW ;;
        "error") color=$RED ;;
        "step") color=$CYAN ;;
        "header") color=$MAGENTA ;;
    esac
    
    echo -e "${color}${message}${NC}"
    echo "[$(date +"%Y-%m-%d %H:%M:%S")] $type: $message" >> "$LOG_FILE"
}

# Función para mostrar un banner de inicio
print_banner() {
    echo -e "${BOLD}${MAGENTA}"
    echo "╔═════════════════════════════════════════════════════════╗"
    echo "║                                                         ║"
    echo "║                 CHATREE - INICIALIZACIÓN                ║"
    echo "║                                                         ║"
    echo "╚═════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    
    print_message "header" "📑 Registro de inicialización: $LOG_FILE"
}

# Verificar si se está ejecutando como root
check_root() {
    if [ "$EUID" -eq 0 ]; then
        print_message "error" "No ejecutes este script como root. Usa un usuario normal."
        exit 1
    fi
}

# Función para mostrar información sobre servicios disponibles
show_info() {
    print_message "header" "📋 Servicios disponibles:"
    echo -e "${YELLOW}- Frontend:${NC} http://localhost:3000"
    echo -e "  ${CYAN}Accede a la aplicación principal de Chatree${NC}"
    
    echo -e "${YELLOW}- Supabase Studio:${NC} http://localhost:54323"
    echo -e "  ${CYAN}Administra la base de datos, modifica tablas y ejecuta consultas SQL${NC}"
    
    echo -e "${YELLOW}- API de LangChain:${NC} http://localhost:5000/docs"
    echo -e "  ${CYAN}Explora y prueba los endpoints de la API de LangChain${NC}"
    
    echo -e "${YELLOW}- Redis Commander:${NC} http://localhost:8081"
    echo -e "  ${CYAN}Visualiza y administra las claves almacenadas en Redis${NC}"
    
    echo -e "\n${MAGENTA}Credenciales de desarrollo:${NC}"
    echo -e "${YELLOW}- Base de datos:${NC} postgres:${GREEN}postgres123${NC} (Puerto: 54322)"
    echo -e "${YELLOW}- Redis:${NC} Contraseña: ${GREEN}redis123${NC} (Puerto: 6379)"
    
    echo -e "\n${MAGENTA}Comandos útiles:${NC}"
    echo -e "${YELLOW}- Ver logs:${NC} docker compose logs -f [servicio]"
    echo -e "${YELLOW}- Reiniciar servicio:${NC} docker compose restart [servicio]"
    echo -e "${YELLOW}- Actualizar contenedores:${NC} docker compose up -d --build"
    echo ""
}

# Función para abrir la aplicación en el navegador
open_app() {
    print_message "step" "🚀 Abriendo la aplicación en el navegador..."
    
    case "$(uname -s)" in
        Darwin*)  open "http://localhost:3000" ;;  # macOS
        Linux*)   xdg-open "http://localhost:3000" &> /dev/null || \
                  sensible-browser "http://localhost:3000" &> /dev/null || \
                  print_message "warning" "Por favor, abre http://localhost:3000 en tu navegador." ;;
        CYGWIN*|MINGW*|MSYS*)  start "http://localhost:3000" ;; # Windows
        *)        print_message "warning" "Por favor, abre http://localhost:3000 en tu navegador." ;;
    esac
}

# Verificar si un servicio está en ejecución
check_service() {
    local service=$1
    local max_attempts=${2:-30}
    local wait_time=${3:-2}
    
    print_message "info" "Verificando servicio $service... (máximo $((max_attempts * wait_time)) segundos)"
    
    for ((i=1; i<=max_attempts; i++)); do
        if docker compose ps $service | grep -q "Up"; then
            print_message "success" "Servicio $service está operativo"
            return 0
        fi
        echo -n "."
        sleep $wait_time
    done
    
    print_message "error" "Servicio $service no está respondiendo"
    return 1
}