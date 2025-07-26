# Guide d'Installation - Gestion Dahiraa

## Table des Matières

1. [Prérequis Système](#prérequis-système)
2. [Installation en Développement](#installation-en-développement)
3. [Configuration de la Base de Données](#configuration-de-la-base-de-données)
4. [Variables d'Environnement](#variables-denvironnement)
5. [Démarrage des Services](#démarrage-des-services)
6. [Vérification de l'Installation](#vérification-de-linstallation)
7. [Déploiement en Production](#déploiement-en-production)
8. [Dépannage](#dépannage)

## Prérequis Système

### Logiciels Requis

**Node.js et npm**
- Node.js version 18.x ou supérieure
- npm version 8.x ou supérieure (inclus avec Node.js)
- Optionnel : pnpm pour de meilleures performances

Installation sur Ubuntu/Debian :
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

Installation sur macOS avec Homebrew :
```bash
brew install node
```

Installation sur Windows :
Télécharger depuis https://nodejs.org/

**Base de Données**

Pour le développement :
- SQLite (inclus automatiquement)

Pour la production :
- PostgreSQL 13.x ou supérieure

Installation PostgreSQL sur Ubuntu :
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**Git**
```bash
# Ubuntu/Debian
sudo apt install git

# macOS
brew install git

# Windows
# Télécharger depuis https://git-scm.com/
```

### Configuration Système

**Ports Requis**
- Port 3001 : API Backend
- Port 5173 : Frontend React (développement)
- Port 5432 : PostgreSQL (si utilisé)

**Mémoire Recommandée**
- Minimum : 2 GB RAM
- Recommandé : 4 GB RAM ou plus

**Espace Disque**
- Minimum : 500 MB pour l'application
- Recommandé : 2 GB pour les logs et uploads

## Installation en Développement

### Étape 1 : Clonage du Projet

```bash
# Cloner le repository
git clone <repository-url>
cd dahiraa-app

# Vérifier la structure
ls -la
```

Vous devriez voir :
```
dahiraa-app/
├── api/                 # Backend
├── client/             # Frontend
├── README.md
└── INSTALLATION.md
```

### Étape 2 : Installation du Backend

```bash
# Naviguer vers le dossier API
cd api

# Installer les dépendances
npm install

# Vérifier l'installation
npm list --depth=0
```

**Dépendances Principales Installées :**
- express : Framework web
- prisma : ORM et client de base de données
- bcryptjs : Hachage des mots de passe
- jsonwebtoken : Authentification JWT
- cors : Gestion des requêtes cross-origin
- multer : Upload de fichiers

### Étape 3 : Installation du Frontend

```bash
# Naviguer vers le dossier client
cd ../client/dahiraa-client

# Installer les dépendances avec pnpm (recommandé)
pnpm install

# Ou avec npm
npm install

# Vérifier l'installation
pnpm list --depth=0
```

**Dépendances Principales Installées :**
- react : Bibliothèque UI
- react-router-dom : Navigation
- tailwindcss : Framework CSS
- axios : Client HTTP
- @tanstack/react-query : Gestion d'état serveur
- recharts : Graphiques et visualisations

## Configuration de la Base de Données

### Développement avec SQLite

SQLite est configuré par défaut pour le développement. Aucune installation supplémentaire n'est requise.

```bash
cd api

# Copier le fichier de configuration
cp .env.example .env

# Le fichier .env contient déjà la configuration SQLite
# DATABASE_URL="file:./dev.db"
```

### Production avec PostgreSQL

Pour un environnement de production, configurez PostgreSQL :

```bash
# Créer un utilisateur et une base de données
sudo -u postgres psql

CREATE USER dahiraa_user WITH PASSWORD 'votre_mot_de_passe_securise';
CREATE DATABASE dahiraa_db OWNER dahiraa_user;
GRANT ALL PRIVILEGES ON DATABASE dahiraa_db TO dahiraa_user;
\q
```

Modifier le fichier `.env` :
```env
DATABASE_URL="postgresql://dahiraa_user:votre_mot_de_passe_securise@localhost:5432/dahiraa_db"
```

### Génération et Migration

```bash
cd api

# Générer le client Prisma
npx prisma generate

# Appliquer les migrations
npx prisma migrate dev --name init

# Vérifier la base de données
npx prisma studio
```

La commande `prisma studio` ouvre une interface web sur http://localhost:5555 pour explorer la base de données.

### Données de Test

```bash
# Peupler la base avec des données de test
npm run db:seed
```

Cette commande crée :
- 2 utilisateurs (admin et gestionnaire)
- 10 membres fictifs
- Cotisations d'exemple
- 3 événements
- Dépenses d'exemple

## Variables d'Environnement

### Backend (.env)

Créer le fichier `api/.env` avec les configurations suivantes :

```env
# Base de données
DATABASE_URL="file:./dev.db"

# JWT Configuration
JWT_SECRET="votre_cle_secrete_jwt_tres_longue_et_securisee"
JWT_EXPIRES_IN="7d"

# Serveur
PORT=3001
NODE_ENV="development"

# Frontend URL pour CORS
FRONTEND_URL="http://localhost:5173"

# Upload Configuration
MAX_FILE_SIZE="5mb"
UPLOAD_PATH="./uploads"
```

**Sécurité Important :**
- Générer une clé JWT sécurisée : `openssl rand -base64 64`
- Ne jamais commiter le fichier `.env` dans Git
- Utiliser des mots de passe forts en production

### Frontend (.env)

Créer le fichier `client/dahiraa-client/.env` :

```env
# API Backend URL
VITE_API_URL="http://localhost:3001/api"

# Environnement
VITE_NODE_ENV="development"
```

## Démarrage des Services

### Démarrage du Backend

```bash
cd api

# Mode développement avec rechargement automatique
npm run dev

# Mode production
npm start
```

**Vérifications :**
- Serveur démarré sur http://localhost:3001
- Message de confirmation dans la console
- API accessible sur http://localhost:3001/api/health

### Démarrage du Frontend

```bash
cd client/dahiraa-client

# Mode développement
pnpm run dev --host

# Build pour production
pnpm run build
```

**Vérifications :**
- Interface accessible sur http://localhost:5173
- Page de connexion s'affiche correctement
- Aucune erreur dans la console du navigateur

## Vérification de l'Installation

### Tests de Connectivité

**1. Test de l'API Backend**
```bash
curl http://localhost:3001/api/health
```

Réponse attendue :
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "environment": "development"
}
```

**2. Test de la Base de Données**
```bash
cd api
npx prisma db pull
```

**3. Test de l'Interface**
- Ouvrir http://localhost:5173
- Vérifier que la page de connexion s'affiche
- Tester la connexion avec : admin@dahiraa.com / password123

### Tests Fonctionnels

**Connexion Utilisateur :**
1. Utiliser les identifiants de test
2. Vérifier la redirection vers le tableau de bord
3. Confirmer l'affichage des statistiques

**Navigation :**
1. Tester tous les liens du menu
2. Vérifier le responsive design
3. Confirmer le fonctionnement sur mobile

## Déploiement en Production

### Préparation

**1. Configuration de Production**
```bash
# Backend
cd api
cp .env.example .env.production

# Modifier les variables pour la production
NODE_ENV="production"
DATABASE_URL="postgresql://..."
JWT_SECRET="cle_production_securisee"
FRONTEND_URL="https://votre-domaine.com"
```

**2. Build du Frontend**
```bash
cd client/dahiraa-client
pnpm run build
```

### Options de Déploiement

**Option 1 : Serveur VPS/Dédié**

Installation avec PM2 :
```bash
# Installer PM2 globalement
npm install -g pm2

# Démarrer le backend
cd api
pm2 start src/server.js --name "dahiraa-api"

# Servir le frontend avec nginx ou apache
```

**Option 2 : Docker**

Créer `Dockerfile` pour le backend :
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npx prisma generate
EXPOSE 3001
CMD ["npm", "start"]
```

**Option 3 : Services Cloud**
- Vercel/Netlify pour le frontend
- Railway/Heroku pour le backend
- Supabase/PlanetScale pour la base de données

### Configuration Nginx

```nginx
server {
    listen 80;
    server_name votre-domaine.com;

    # Frontend
    location / {
        root /path/to/dahiraa-client/dist;
        try_files $uri $uri/ /index.html;
    }

    # API Backend
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Dépannage

### Problèmes Courants

**1. Erreur "Port already in use"**
```bash
# Trouver le processus utilisant le port
lsof -i :3001
# Ou
netstat -tulpn | grep :3001

# Arrêter le processus
kill -9 <PID>
```

**2. Erreur Prisma "Client not generated"**
```bash
cd api
npx prisma generate
npm run dev
```

**3. Erreur CORS**
Vérifier que `FRONTEND_URL` dans `.env` correspond à l'URL du frontend.

**4. Erreur de Base de Données**
```bash
# Réinitialiser la base de données
cd api
rm -f prisma/dev.db
npx prisma migrate dev --name init
npm run db:seed
```

**5. Dépendances Manquantes**
```bash
# Réinstaller toutes les dépendances
rm -rf node_modules package-lock.json
npm install
```

### Logs et Debugging

**Backend :**
```bash
# Logs en temps réel
cd api
npm run dev

# Logs avec plus de détails
DEBUG=* npm run dev
```

**Frontend :**
- Ouvrir les outils de développement du navigateur (F12)
- Vérifier l'onglet Console pour les erreurs JavaScript
- Vérifier l'onglet Network pour les erreurs d'API

### Support

En cas de problème persistant :

1. Vérifier les logs d'erreur complets
2. Confirmer que tous les prérequis sont installés
3. Vérifier les versions des dépendances
4. Consulter la documentation des dépendances spécifiques

**Commandes de Diagnostic :**
```bash
# Versions des outils
node --version
npm --version
git --version

# État des services
ps aux | grep node
netstat -tulpn | grep :300

# Espace disque
df -h
```

Cette installation complète devrait vous permettre de faire fonctionner l'application Gestion Dahiraa dans votre environnement de développement ou de production.

