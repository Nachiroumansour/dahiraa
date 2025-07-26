# 🚀 Guide de Déploiement - Application Dahiraa

## 📋 Vue d'ensemble

Ce guide vous accompagne pour déployer l'application Dahiraa en production :
- **Frontend :** Vercel (React)
- **Backend :** Railway (Node.js/Express)
- **Base de données :** SQLite (sur Railway)

## 🎯 Prérequis

- ✅ Compte GitHub
- ✅ Compte Railway (gratuit)
- ✅ Compte Vercel (gratuit)
- ✅ Code source prêt

## 📦 Structure du projet

```
dahiraa-app/
├── api/                    # Backend (Railway)
│   ├── src/
│   ├── prisma/
│   ├── Procfile
│   └── railway.json
└── client/
    └── dahiraa-client/     # Frontend (Vercel)
        ├── src/
        ├── vercel.json
        └── package.json
```

## 🚀 Étapes de déploiement

### Étape 1 : Préparer le repository GitHub

1. **Pousser le code sur GitHub :**
   ```bash
   git add .
   git commit -m "Préparation déploiement"
   git push origin main
   ```

### Étape 2 : Déployer le Backend sur Railway

1. **Aller sur [Railway.app](https://railway.app)**
2. **Se connecter avec GitHub**
3. **Créer un nouveau projet**
4. **Choisir "Deploy from GitHub repo"**
5. **Sélectionner votre repository**
6. **Choisir le dossier `api`**
7. **Configurer les variables d'environnement :**
   ```
   JWT_SECRET=votre_secret_jwt_tres_securise_et_long
   NODE_ENV=production
   ```
8. **Déployer**

### Étape 3 : Déployer le Frontend sur Vercel

1. **Aller sur [Vercel.com](https://vercel.com)**
2. **Se connecter avec GitHub**
3. **Créer un nouveau projet**
4. **Importer votre repository**
5. **Configurer :**
   - **Framework Preset :** Vite
   - **Root Directory :** `client/dahiraa-client`
   - **Build Command :** `npm run build`
   - **Output Directory :** `dist`
6. **Configurer les variables d'environnement :**
   ```
   VITE_API_URL=https://votre-api.railway.app/api
   ```
7. **Déployer**

### Étape 4 : Configuration finale

1. **Récupérer l'URL de l'API Railway**
2. **Mettre à jour VITE_API_URL sur Vercel**
3. **Tester l'application**

## 🔧 Configuration des variables d'environnement

### Railway (Backend)
```
JWT_SECRET=votre_secret_jwt_tres_securise_et_long
NODE_ENV=production
PORT=3001
```

### Vercel (Frontend)
```
VITE_API_URL=https://votre-api.railway.app/api
```

## 🧪 Tests post-déploiement

1. **Tester l'API :**
   ```
   https://votre-api.railway.app/api/health
   ```

2. **Tester le frontend :**
   ```
   https://votre-app.vercel.app
   ```

3. **Tester la connexion :**
   - Email : `test@dahiraa.com`
   - Mot de passe : `test123`

## 🔍 Dépannage

### Problèmes courants :

1. **Erreur CORS :**
   - Vérifier les origines autorisées dans `api/src/server.js`

2. **Erreur de connexion API :**
   - Vérifier `VITE_API_URL` sur Vercel
   - Vérifier que l'API Railway fonctionne

3. **Erreur de build :**
   - Vérifier les dépendances dans `package.json`
   - Vérifier les logs de build

## 📞 Support

- **Railway :** [docs.railway.app](https://docs.railway.app)
- **Vercel :** [vercel.com/docs](https://vercel.com/docs)
- **Logs :** Accessibles via les interfaces Railway et Vercel

## 🎉 Félicitations !

Votre application Dahiraa est maintenant en ligne ! 🚀 