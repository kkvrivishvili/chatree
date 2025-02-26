#!/bin/bash

# ------------------------------------------------------------------------------
# Chatree - Construcción del frontend
# ------------------------------------------------------------------------------

# Preparar Dockerfile para producción
build_frontend() {
    local frontend_dir="$PROJECT_ROOT/app"
    
    if [ ! -d "$frontend_dir" ]; then
        print_message "error" "Directorio del frontend no encontrado: $frontend_dir"
        return 1
    fi
    
    # Crear Dockerfile.prod si no existe
    if [ ! -f "$frontend_dir/Dockerfile.prod" ]; then
        print_message "info" "Creando Dockerfile para producción"
        
        cat > "$frontend_dir/Dockerfile.prod" << EOL
# Etapa de construcción
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar package.json
COPY package*.json ./

# Instalar dependencias
RUN pnpm i

# Copiar código fuente
COPY . .

# Construir aplicación
RUN pnpm run build

# Etapa de producción
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copiar archivos necesarios
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

CMD ["pnpm", "start"]
EOL
        print_message "success" "Dockerfile de producción creado"
    else
        print_message "info" "Dockerfile de producción ya existe"
    fi
    
    # Actualizar docker-compose.yml
    print_message "info" "Actualizando configuración de docker-compose.yml"
    
    # Hacer una copia de seguridad
    cp "$PROJECT_ROOT/docker-compose.yml" "$PROJECT_ROOT/docker-compose.yml.bak"
    
    # Usar un enfoque diferente para modificar el archivo
    # En lugar de usar sed, hacemos una modificación más controlada
    print_message "info" "Modificando servicio 'app' en docker-compose.yml"
    
    # Leer el contenido actual
    local docker_compose="$PROJECT_ROOT/docker-compose.yml"
    local temp_file="$PROJECT_ROOT/docker-compose.yml.tmp"
    
    # Construir el nuevo contenido para el servicio app
    local new_app_service="  app:
    build:
      context: ./app
      dockerfile: Dockerfile.prod
    ports:
      - \"3000:3000\"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=\${SUPABASE_ANON_KEY:-your-anon-key}
    networks:
      - chatree-network
    depends_on:
      - supabase
    restart: unless-stopped"
    
    # Usar awk para reemplazar la sección app: hasta el siguiente servicio
    awk -v new_service="$new_app_service" '
    /^  app:/ {
        print new_service;
        in_app_section = 1;
        next;
    }
    /^  [a-zA-Z]/ && in_app_section {
        in_app_section = 0;
    }
    !in_app_section {
        print;
    }
    ' "$docker_compose" > "$temp_file"
    
    # Verificar que la modificación fue exitosa
    if [ -s "$temp_file" ]; then
        mv "$temp_file" "$docker_compose"
        print_message "success" "docker-compose.yml actualizado correctamente"
    else
        print_message "error" "Error al actualizar docker-compose.yml"
        return 1
    fi
    
    print_message "success" "Frontend preparado correctamente"
    return 0
}