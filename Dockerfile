# Dockerfile para Painel de Monitoramento de Pacientes

# Stage 1: Build
FROM node:20-slim AS builder

WORKDIR /app

# Instalar dependências necessárias para compilação (se houver)
# RUN apt-get update && apt-get install -y python3 make g++

COPY package*.json ./
RUN npm install

COPY . .

# Build da aplicação (Vite + Server)
RUN npm run build

# Stage 2: Runtime
FROM node:20-slim AS runner

WORKDIR /app

ENV NODE_ENV=production

# Instalar dependências de produção (incluindo dotenv que é necessário no index.js)
COPY package*.json ./
RUN npm install --omit=dev && npm install dotenv

# Copiar arquivos compilados do builder
COPY --from=builder /app/dist ./dist

# Expor a porta definida no servidor
EXPOSE 3000

CMD ["node", "dist/index.js"]
