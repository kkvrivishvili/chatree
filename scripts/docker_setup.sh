#!/bin/bash

# ------------------------------------------------------------------------------
# Chatree - Configuración de Docker
# ------------------------------------------------------------------------------

# Instalar Docker y Docker Compose
setup_docker() {
    # Verificar Docker
    if ! command -v docker &> /dev/null; then
        print_message "warning" "Docker no está instalado. Instalando..."
        
        if command -v apt-get &> /dev/null; then
            sudo apt-get update
            sudo apt-get install -y ca-certificates curl gnupg
            sudo install -m 0755 -d /etc/apt/keyrings
            curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
            sudo chmod a+r /etc/apt/keyrings/docker.gpg
            
            echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
            
            sudo apt-get update
            sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
            
            sudo usermod -aG docker $USER
            print_message "warning" "Se ha añadido tu usuario al grupo docker. Podrías necesitar cerrar y abrir sesión."
            print_message "warning" "Si encuentras problemas de permisos, intenta ejecutar: 'newgrp docker'"
            
            # Intenta iniciar el grupo docker en la sesión actual
            if getent group docker | grep -q "\b${USER}\b"; then
                newgrp docker << EONG
                # Continuar con el script aquí
EONG
            fi
        elif command -v brew &> /dev/null; then
            brew install --cask docker
            print_message "info" "Docker Desktop instalado. Por favor, ábrelo y completa la instalación."
            read -p "Presiona Enter cuando Docker Desktop esté ejecutándose... " 
        else
            print_message "error" "No se pudo instalar Docker automáticamente."
            print_message "info" "Por favor, instala Docker manualmente: https://docs.docker.com/get-docker/"
            return 1
        fi
    else
        print_message "success" "Docker ya está instalado: $(docker --version)"
    fi
    
    # Verificar Docker Compose
    if ! (command -v docker-compose &> /dev/null || docker compose version &> /dev/null); then
        print_message "warning" "Docker Compose no encontrado. Instalando..."
        
        if docker compose version &> /dev/null; then
            print_message "success" "Docker Compose V2 ya está disponible como plugin"
            # Crear alias para compatibilidad
            echo 'alias docker-compose="docker compose"' >> ~/.bashrc
            source ~/.bashrc
        elif command -v apt-get &> /dev/null; then
            sudo apt-get install -y docker-compose-plugin
        else
            print_message "error" "No se pudo instalar Docker Compose automáticamente."
            print_message "info" "Por favor, instala Docker Compose manualmente"
            return 1
        fi
    else
        print_message "success" "Docker Compose está disponible"
    fi
    
    # Verificar que Docker esté en ejecución
    if ! docker info &> /dev/null; then
        print_message "warning" "El servicio Docker no está en ejecución"
        
        if command -v systemctl &> /dev/null; then
            print_message "info" "Iniciando servicio Docker..."
            sudo systemctl start docker
            
            if ! docker info &> /dev/null; then
                print_message "error" "No se pudo iniciar Docker"
                return 1
            fi
        else
            print_message "error" "Por favor, inicia el servicio Docker manualmente"
            return 1
        fi
    fi
    
    print_message "success" "Docker está configurado correctamente"
    return 0
}