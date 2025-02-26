FROM node:20-alpine

WORKDIR /app

# Instalar pnpm
RUN npm install -g pnpm

# Copiar package.json y pnpm-lock.yaml (si existe)
COPY package.json pnpm-lock.yaml* ./

# Instalar dependencias
RUN pnpm install

# Copiar todo el código fuente
COPY . .

# Exponer el puerto para la aplicación
EXPOSE 3000

# Configurar acceso a variables de entorno desde la raíz
# Esto se manejará montando el archivo .env como volumen en docker-compose.yml

# Comando de inicio para desarrollo
CMD ["pnpm", "dev"]
