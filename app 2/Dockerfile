FROM node:20-alpine

WORKDIR /app

# Instalar pnpm
RUN npm install -g pnpm

# Copiar package.json y pnpm-lock.yaml (si existe)
COPY package.json pnpm-lock.yaml* ./

# Instalar dependencias con --frozen-lockfile para garantizar consistencia
RUN pnpm install --frozen-lockfile --prod=false

# Copiar todo el código fuente
COPY . .

# Construir la aplicación
RUN pnpm build

# Limpiar caché para reducir el tamaño de la imagen
RUN pnpm cache clean --force

# Exponer el puerto para la aplicación
EXPOSE 3000

# Configurar acceso a variables de entorno desde la raíz
# Esto se manejará montando el archivo .env como volumen en docker-compose.yml

# Comando de inicio para desarrollo
CMD ["pnpm", "dev"]
