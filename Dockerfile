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

# Em produção, precisamos de algumas variáveis para rodar o node_modules corretamente
ENV NODE_ENV=production
ENV PORT=3000

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar TODAS as dependências no runner. 
# Como usamos --packages=external no esbuild, o node precisa de acesso aos pacotes reais.
RUN npm install

# Copiar arquivos compilados do builder
COPY --from=builder /app/dist ./dist
# Copiar o restante do código fonte que pode ser necessário para imports dinâmicos ou referências relativas
COPY --from=builder /app/server ./server
COPY --from=builder /app/client ./client

# Expor a porta definida no servidor
EXPOSE 3000

CMD ["node", "dist/index.js"]
