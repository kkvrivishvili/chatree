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
RUN npm ci

# Copiar código fuente
COPY . .

# Construir aplicación
RUN npm run build

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

CMD ["npm", "start"]
EOL
        print_message "success" "Dockerfile de producción creado"
    else
        print_message "info" "Dockerfile de producción ya existe"
    fi
    
    # Actualizar docker-compose.yml
    print_message "info" "Actualizando configuración de docker-compose.yml"
    
    # Hacer una copia de seguridad
    cp "$PROJECT_ROOT/docker-compose.yml" "$PROJECT_ROOT/docker-compose.yml.bak"
    
    # Actualizar configuración del servicio app
    sed -i '/app:/,/depends_on:/c\
  app:\
    build:\
      context: ./app\
      dockerfile: Dockerfile.prod\
    ports:\
      - "3000:3000"\
    environment:\
      - NODE_ENV=production\
      - NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321\
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY:-your-anon-key}\
    networks:\
      - chatree-network\
    depends_on:\
      - supabase\
    restart: unless-stopped' "$PROJECT_ROOT/docker-compose.yml"
    
    print_message "success" "Frontend preparado correctamente"
    return 0
}