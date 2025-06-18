# Utilise l'image officielle Node.js version 22.14.0 comme image de base
FROM node:22.14.0
# Définit le dossier de travail dans le conteneur
WORKDIR /app
# Copie les fichiers package.json et package-lock.json ou yarn.lock (si Yarn) dans le conteneur
COPY package*.json ./
COPY yarn.lock ./
# Installe les dépendances avec Yarn
RUN yarn install
# Copie tout le reste du projet dans le conteneur
COPY . .
# Expose le port 3000 à l'extérieur du conteneur
EXPOSE 3000
# démarre l'application avec
CMD ["yarn", "start", "nodemon"]
