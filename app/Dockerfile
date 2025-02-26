FROM node:20-alpine

WORKDIR /app

COPY package.json ./

RUN pnpm install

# Copiar el código fuente
COPY . .

EXPOSE 3000

CMD ["pnpm", "run", "dev"]
