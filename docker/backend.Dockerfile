FROM node:18-alpine

WORKDIR /app

# Copia manifestos de dependências
COPY package*.json ./

# Instala dependências de produção
RUN npm ci --production

# Copia todo o projeto
COPY . /app

EXPOSE 3001

CMD ["node", "server/server.js"]
