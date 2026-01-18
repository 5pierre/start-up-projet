FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# On expose le port interne (utilisé par Nginx plus tard)
EXPOSE 3000

# Démarrage en mode développement
CMD ["npm", "start"]