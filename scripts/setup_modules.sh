#!/bin/bash

# Este script prepara la estructura modular para Chatree
# Crea los directorios y scripts necesarios

# Colores para mensajes
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
BOLD='\033[1m'
NC='\033[0m' # No Color

echo -e "${BOLD}${MAGENTA}"
echo "╔═════════════════════════════════════════════════════════╗"
echo "║                                                         ║"
echo "║            CONFIGURACIÓN MODULAR DE CHATREE             ║"
echo "║                                                         ║"
echo "╚═════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Crear estructura de directorios
echo -e "${BLUE}Creando estructura de directorios...${NC}"
mkdir -p scripts logs

# Descargar start.sh y darle permisos
echo -e "${BLUE}Configurando script principal...${NC}"
chmod +x start.sh

# Dar permisos a los scripts de módulos
echo -e "${BLUE}Dando permisos a los scripts de módulos...${NC}"
chmod +x scripts/*.sh

echo -e "${GREEN}✅ Estructura modular configurada correctamente${NC}"
echo -e "${GREEN}✅ Puedes iniciar Chatree ejecutando: ./start.sh${NC}"