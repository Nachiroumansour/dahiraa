# 🚀 Déploiement Railway - API Dahiraa

## Variables d'environnement à configurer sur Railway :

### Variables obligatoires :
```
JWT_SECRET=votre_secret_jwt_tres_securise_et_long
NODE_ENV=production
```

### Variables optionnelles :
```
PORT=3001
CORS_ORIGIN=https://votre-frontend.vercel.app
```

## Étapes de déploiement :

1. **Connecter le repository GitHub à Railway**
2. **Configurer les variables d'environnement**
3. **Déployer automatiquement**

## Base de données SQLite :
- La base de données SQLite sera créée automatiquement
- Les migrations seront exécutées au premier déploiement
- Les données persistent dans le conteneur Railway

## Health Check :
- Endpoint : `/api/health`
- Utilisé par Railway pour vérifier que l'API fonctionne

## Logs :
- Accessibles via l'interface Railway
- Utiles pour déboguer les problèmes 