# Gestion Dahiraa - Application de Gestion d'Association Religieuse

## Vue d'ensemble

Gestion Dahiraa est une application web full-stack moderne conçue spécifiquement pour la gestion des associations religieuses sénégalaises appelées "Dahiraa". Cette solution complète permet aux gestionnaires et administrateurs de suivre efficacement les membres, les cotisations, les événements et les finances de leur organisation.

L'application combine une interface utilisateur intuitive développée avec React.js et une API robuste construite avec Node.js et Express, le tout soutenu par une base de données relationnelle gérée via Prisma ORM.

## Fonctionnalités Principales

### Gestion des Membres
- **Inscription et profils complets** : Enregistrement détaillé des membres avec informations personnelles, photos de profil, et numéros d'adhésion uniques
- **Suivi des participations** : Historique complet des cotisations et participations aux événements
- **Recherche et filtrage avancés** : Outils de recherche par nom, téléphone, genre, ou statut
- **Statistiques individuelles** : Tableaux de bord personnalisés pour chaque membre

### Gestion Financière
- **Suivi des cotisations** : Enregistrement des paiements hebdomadaires avec statuts (Payé, En attente, Absent)
- **Gestion des dépenses** : Catégorisation et suivi des dépenses par type (Événements, Générales)
- **Rapports financiers** : Génération automatique de rapports et analyses de tendances
- **Tableau de bord financier** : Visualisations graphiques des flux financiers

### Gestion des Événements
- **Planification d'événements** : Création et gestion d'événements avec dates, lieux, et contributions
- **Suivi des participations** : Gestion des inscriptions et présences aux événements
- **Calcul automatique des contributions** : Répartition équitable des coûts entre participants

### Sécurité et Authentification
- **Système d'authentification JWT** : Connexion sécurisée avec tokens d'accès
- **Gestion des rôles** : Différenciation entre Administrateurs et Gestionnaires
- **Protection des données** : Chiffrement des mots de passe et sécurisation des API

## Architecture Technique

### Stack Technologique

**Frontend (Client)**
- **React.js 19.x** : Framework JavaScript moderne pour l'interface utilisateur
- **Tailwind CSS** : Framework CSS utilitaire pour un design responsive
- **Shadcn/UI** : Composants UI pré-construits et accessibles
- **React Router** : Navigation côté client
- **Axios** : Client HTTP pour les appels API
- **React Query** : Gestion d'état et cache pour les données serveur
- **Recharts** : Bibliothèque de graphiques pour les visualisations
- **Lucide React** : Icônes modernes et cohérentes

**Backend (API)**
- **Node.js** : Runtime JavaScript côté serveur
- **Express.js 4.x** : Framework web minimaliste et flexible
- **Prisma ORM** : Couche d'abstraction de base de données moderne
- **SQLite/PostgreSQL** : Base de données relationnelle (SQLite pour le développement, PostgreSQL pour la production)
- **JWT (jsonwebtoken)** : Authentification basée sur les tokens
- **bcryptjs** : Hachage sécurisé des mots de passe
- **Multer** : Gestion des uploads de fichiers
- **Swagger/OpenAPI** : Documentation automatique de l'API

### Structure du Projet

```
dahiraa-app/
├── api/                          # Backend Node.js/Express
│   ├── src/
│   │   ├── controllers/          # Logique métier des endpoints
│   │   ├── middleware/           # Middlewares d'authentification et validation
│   │   ├── routes/              # Définition des routes API
│   │   ├── services/            # Services métier
│   │   ├── utils/               # Utilitaires (Prisma, JWT, Swagger)
│   │   └── server.js            # Point d'entrée du serveur
│   ├── prisma/
│   │   ├── schema.prisma        # Schéma de base de données
│   │   ├── migrations/          # Migrations de base de données
│   │   └── seed.js              # Données de test
│   ├── uploads/                 # Stockage des fichiers uploadés
│   └── package.json
├── client/
│   └── dahiraa-client/          # Frontend React
│       ├── src/
│       │   ├── components/      # Composants React réutilisables
│       │   ├── pages/           # Pages de l'application
│       │   ├── contexts/        # Contextes React (Auth, etc.)
│       │   ├── services/        # Services API
│       │   ├── utils/           # Utilitaires de formatage
│       │   └── App.jsx          # Composant racine
│       └── package.json
└── README.md
```

## Modèle de Données

L'application utilise un modèle de données relationnel optimisé pour les besoins spécifiques des associations religieuses :

### Entités Principales

**User** : Comptes utilisateurs avec authentification
- Rôles : ADMIN, GESTIONNAIRE
- Authentification JWT sécurisée

**Member** : Membres de l'association
- Informations personnelles complètes
- Numéros d'adhésion uniques
- Photos de profil optionnelles

**Cotisation** : Paiements des membres
- Montants et dates de paiement
- Statuts de paiement (PAYE, EN_ATTENTE, ABSENT)
- Référence aux semaines de cotisation

**Event** : Événements organisés
- Détails complets (titre, description, lieu, dates)
- Montants de contribution
- Gestion des participations

**Expense** : Dépenses de l'association
- Catégorisation par type
- Justificatifs optionnels
- Suivi des montants

## Installation et Configuration

### Prérequis

- **Node.js** (version 18.x ou supérieure)
- **npm** ou **pnpm** (gestionnaire de paquets)
- **Base de données** : SQLite (développement) ou PostgreSQL (production)

### Installation Rapide

1. **Cloner le projet**
```bash
git clone <repository-url>
cd dahiraa-app
```

2. **Configuration du Backend**
```bash
cd api
npm install
cp .env.example .env
# Éditer le fichier .env avec vos configurations
npx prisma generate
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

3. **Configuration du Frontend**
```bash
cd ../client/dahiraa-client
pnpm install
# Le serveur backend doit être en cours d'exécution
pnpm run dev --host
```

4. **Accès à l'application**
- Frontend : http://localhost:5173
- API Backend : http://localhost:3001
- Documentation API : http://localhost:3001/api-docs

### Comptes de Démonstration

L'application inclut des comptes de test pré-configurés :

- **Administrateur** : admin@dahiraa.com / password123
- **Gestionnaire** : gestionnaire@dahiraa.com / password123

## Utilisation

### Interface Utilisateur

L'application propose une interface moderne et intuitive organisée autour de plusieurs sections principales :

**Tableau de Bord** : Vue d'ensemble avec statistiques clés, graphiques de tendances financières, et alertes importantes.

**Gestion des Membres** : Interface complète pour l'ajout, la modification, et la consultation des profils des membres avec fonctionnalités de recherche avancée.

**Suivi des Cotisations** : Outils de saisie et de suivi des paiements avec génération automatique de rapports.

**Planification d'Événements** : Système complet de gestion des événements avec suivi des participations et calcul des contributions.

**Gestion Financière** : Suivi des dépenses avec catégorisation et génération de rapports financiers détaillés.

### API REST

L'API suit les principes REST et propose des endpoints complets pour toutes les fonctionnalités :

- **Authentification** : `/api/auth/*` - Connexion, inscription, gestion des profils
- **Membres** : `/api/members/*` - CRUD complet des membres
- **Cotisations** : `/api/cotisations/*` - Gestion des paiements
- **Événements** : `/api/events/*` - Planification et suivi des événements
- **Dépenses** : `/api/expenses/*` - Gestion financière
- **Tableau de bord** : `/api/dashboard/*` - Statistiques et analyses

## Déploiement

### Environnement de Production

Pour un déploiement en production, plusieurs configurations sont recommandées :

**Base de Données** : Migration vers PostgreSQL pour de meilleures performances et une meilleure scalabilité.

**Sécurité** : Configuration de variables d'environnement sécurisées, mise en place de HTTPS, et configuration de CORS appropriée.

**Performance** : Mise en cache des requêtes fréquentes, optimisation des images, et configuration de CDN pour les assets statiques.

**Monitoring** : Mise en place de logs structurés et de monitoring des performances.

## Contribution

Ce projet suit les meilleures pratiques de développement moderne :

- **Code Style** : ESLint et Prettier pour la cohérence du code
- **Git Flow** : Branches feature, develop, et main
- **Tests** : Tests unitaires et d'intégration (à implémenter)
- **Documentation** : Documentation complète de l'API avec Swagger

## Support et Maintenance

L'application est conçue pour être facilement maintenable et extensible :

- **Architecture modulaire** permettant l'ajout de nouvelles fonctionnalités
- **Base de code bien documentée** avec commentaires explicatifs
- **Gestion d'erreurs robuste** avec logs détaillés
- **Migrations de base de données** versionnées avec Prisma

## Licence

Ce projet est développé pour les besoins spécifiques des associations religieuses sénégalaises et peut être adapté selon les besoins particuliers de chaque organisation.

---

**Développé par Manus AI** - Solution complète pour la gestion moderne des associations religieuses.

