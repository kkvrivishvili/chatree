#!/bin/bash

# ------------------------------------------------------------------------------
# Chatree - Verificación de dependencias
# ------------------------------------------------------------------------------

# Instalar dependencia si no existe
install_if_missing() {
    local cmd=$1
    local pkg=${2:-$cmd}
    
    if ! command -v $cmd &> /dev/null; then
        print_message "warning" "$cmd no está instalado. Instalando $pkg..."
        
        if command -v apt-get &> /dev/null; then
            sudo apt-get update && sudo apt-get install -y $pkg
        elif command -v dnf &> /dev/null; then
            sudo dnf install -y $pkg
        elif command -v yum &> /dev/null; then
            sudo yum install -y $pkg
        elif command -v pacman &> /dev/null; then
            sudo pacman -Sy --noconfirm $pkg
        elif command -v brew &> /dev/null; then
            brew install $pkg
        else
            print_message "error" "No se pudo instalar $pkg. Por favor, instálalo manualmente."
            return 1
        fi
        
        if ! command -v $cmd &> /dev/null; then
            print_message "error" "Instalación de $pkg falló."
            return 1
        fi
    fi
    
    print_message "success" "$cmd está disponible"
    return 0
}

# Verificar puertos disponibles
check_port() {
    local port=$1
    local service=$2
    
    # Asegurar que tenemos lsof
    if ! command -v lsof &> /dev/null; then
        install_if_missing lsof
    fi
    
    if lsof -i ":$port" -t &> /dev/null; then
        print_message "error" "Puerto $port para $service está ocupado"
        return 1
    fi
    
    print_message "success" "Puerto $port para $service está disponible"
    return 0
}

# Verificar todas las dependencias
check_dependencies() {
    print_message "info" "Verificando dependencias necesarias..."
    
    # Herramientas básicas
    install_if_missing curl || return 1
    install_if_missing wget || return 1
    install_if_missing git || return 1
    
    # Verificar puertos
    check_port 3000 "Frontend" || return 1
    check_port 54321 "Supabase API" || return 1
    check_port 54323 "Supabase Studio" || return 1
    check_port 5000 "LangChain API" || return 1
    check_port 11434 "Ollama" || return 1
    check_port 6379 "Redis" || return 1
    check_port 8081 "Redis Commander" || return 1
    
    print_message "success" "Todas las dependencias están verificadas"
    return 0
}