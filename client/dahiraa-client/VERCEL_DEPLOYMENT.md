# 🚀 Déploiement Vercel - Frontend Dahiraa

## Variables d'environnement à configurer sur Vercel :

### Variables obligatoires :
```
VITE_API_URL=https://votre-api.railway.app/api
```

## Étapes de déploiement :

1. **Connecter le repository GitHub à Vercel**
2. **Configurer les variables d'environnement**
3. **Déployer automatiquement**

## Configuration du projet :

- **Framework :** Vite + React
- **Build Command :** `npm run build`
- **Output Directory :** `dist`
- **Install Command :** `npm install`

## Variables d'environnement Vercel :

Dans l'interface Vercel, allez dans :
1. **Settings** → **Environment Variables**
2. **Ajoutez :**
   - `VITE_API_URL` = `https://votre-api.railway.app/api`

## Domaine personnalisé (optionnel) :
- Vous pouvez configurer un domaine personnalisé
- Exemple : `dahiraa.votre-domaine.com`

## Redéploiement automatique :
- Chaque push sur la branche `main` déclenche un redéploiement
- Les variables d'environnement sont automatiquement utilisées 