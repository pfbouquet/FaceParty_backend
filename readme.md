# FaceParty API (Backend)

![Node.js](https://img.shields.io/badge/Node.js-16-blue) ![Express](https://img.shields.io/badge/Express-4.x-lightgrey)

## Table des matières

- [FaceParty API (Backend)](#faceparty-api-backend)
  - [Table des matières](#table-des-matières)
  - [Description](#description)
  - [Fonctionnalitées principales:](#fonctionnalitées-principales)
  - [Prérequis](#prérequis)
  - [Installation](#installation)
  - [Lancement](#lancement)
  - [Structure du projet](#structure-du-projet)
  - [Technologies](#technologies)
  - [Licence](#licence)

## Description

Serveur REST & WebSocket pour FaceParty.
Liens vers les différents repositories nécessaire à l'application:

- Frontend: github.com/pfbouquet/FaceParty_frontend
- Backend: github.com/pfbouquet/FaceParty_backend
- Morphing API: github.com/pfbouquet/FaceParty_morpher

## Fonctionnalitées principales:

- Gestion des parties, joueurs et scores (MongoDB).
- Synchronisation temps réel avec Socket.io.
- Morphing d’images via un service Python externe. Cette partie est assuré par une API reposant elle même sur la librairie [face_morpher GitHub Repository](https://github.com/alyssaq/face_morpher)

## Prérequis

- Node.js >= 16
- MongoDB
- Docker

## Installation

```bash
git clone https://github.com/pfbouquet/FaceParty_backend.git
cd FaceParty_backend
npm install
```

Créez un fichier .env contenant les variables d'environement suivantes:

```
MONGODB_URI=your-mongodb-collection-connection-string
EXPO_PUBLIC_BACKEND_URL=http://localhost:3000
FRONTEND_URL=http://your-frontend-url
MORPHER_URL=https://your-morpher-url
```

## Lancement

```bash
yarn start
```

## Structure du projet

```bash
FaceParty_backend/
├── bin/
│ └── www            # Point d’entrée HTTP (script de démarrage)
├── modules/         # Modules métiers réutilisables
├── routes/          # Définition des routes Express
├── services/        # Intégrations externes (API, moteurs de morphing, logique de création de partie)
├── database/
│ └── models/        # Schémas des documents pour Mongoose
├── sockets/         # Handlers des événements Socket.io
├── public/
│ └── characters/    # Assets statiques (images de célébrités…)
├── tmp/             # Fichiers temporaires (upload, cache…)
├── app.js           # Initialisation de l’app Express
├── readme.md        # Documentation du projet
├── package.json     # Dépendances
└── yarn.lock        # Verrou des versions Yarn

```

## Technologies

- Node.js & Express
- MongoDB & Mongoose
- Socket.io
- Jest
- Docker

## Licence

MIT © Aymeric Simao; Thomas Lecoeur; Pierre‑François Bouquet
