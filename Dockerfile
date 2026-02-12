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

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar TODAS as dependências (incluindo as de dev) para garantir que
# pacotes como 'dotenv' que foram listados em devDependencies mas usados no bundle
# ou referenciados pelo index.js compilado estejam presentes.
RUN npm install

# Copiar arquivos compilados do builder
COPY --from=builder /app/dist ./dist

# Expor a porta definida no servidor
EXPOSE 3000

CMD ["node", "dist/index.js"]
