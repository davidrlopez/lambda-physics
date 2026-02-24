# Usamos Node 20 para que coincida con tu entorno
FROM node:20-slim

# Necesario para que Prisma funcione en Linux
RUN apt-get update -y && apt-get install -y openssl

WORKDIR /app

# Copiamos primero lo necesario para instalar dependencias
COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

# Copiamos el resto del código
COPY . .

# Preparamos Prisma y compilamos el código TypeScript
RUN npx prisma generate

# Exponemos el puerto
EXPOSE 3000

# Arrancamos la aplicación
CMD ["npx", "tsx", "src/index.ts"]
