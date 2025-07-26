# Documentation API - Gestion Dahiraa

## Vue d'ensemble

L'API Gestion Dahiraa est une API REST complète qui fournit tous les endpoints nécessaires pour gérer une association religieuse. Elle suit les principes REST et utilise l'authentification JWT pour sécuriser les accès.

**URL de Base :** `http://localhost:3001/api`

**Format de Réponse :** JSON

**Authentification :** Bearer Token (JWT)

## Authentification

### Système d'Authentification

L'API utilise JSON Web Tokens (JWT) pour l'authentification. Après une connexion réussie, un token est fourni qui doit être inclus dans l'en-tête `Authorization` de toutes les requêtes protégées.

**Format de l'en-tête :**
```
Authorization: Bearer <votre_token_jwt>
```

### Endpoints d'Authentification

#### POST /api/auth/register
Créer un nouveau compte utilisateur.

**Corps de la requête :**
```json
{
  "email": "utilisateur@example.com",
  "password": "motdepasse123",
  "role": "GESTIONNAIRE"
}
```

**Réponse (201) :**
```json
{
  "message": "Utilisateur créé avec succès",
  "user": {
    "id": "clx1234567890",
    "email": "utilisateur@example.com",
    "role": "GESTIONNAIRE",
    "createdAt": "2024-01-01T12:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Erreurs possibles :**
- 400 : Email déjà utilisé
- 400 : Données de validation invalides

#### POST /api/auth/login
Se connecter avec un compte existant.

**Corps de la requête :**
```json
{
  "email": "admin@dahiraa.com",
  "password": "password123"
}
```

**Réponse (200) :**
```json
{
  "message": "Connexion réussie",
  "user": {
    "id": "clx1234567890",
    "email": "admin@dahiraa.com",
    "role": "ADMIN",
    "createdAt": "2024-01-01T12:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Erreurs possibles :**
- 401 : Identifiants invalides
- 400 : Données manquantes

#### GET /api/auth/profile
Récupérer le profil de l'utilisateur connecté.

**En-têtes requis :**
```
Authorization: Bearer <token>
```

**Réponse (200) :**
```json
{
  "user": {
    "id": "clx1234567890",
    "email": "admin@dahiraa.com",
    "role": "ADMIN",
    "createdAt": "2024-01-01T12:00:00.000Z"
  }
}
```

#### PUT /api/auth/profile
Mettre à jour le profil utilisateur.

**Corps de la requête :**
```json
{
  "email": "nouveau@email.com",
  "currentPassword": "ancien_mot_de_passe",
  "newPassword": "nouveau_mot_de_passe"
}
```

**Réponse (200) :**
```json
{
  "message": "Profil mis à jour avec succès",
  "user": {
    "id": "clx1234567890",
    "email": "nouveau@email.com",
    "role": "ADMIN"
  }
}
```

## Gestion des Membres

### GET /api/members
Récupérer la liste des membres avec pagination et filtres.

**Paramètres de requête :**
- `page` (optionnel) : Numéro de page (défaut: 1)
- `limit` (optionnel) : Nombre d'éléments par page (défaut: 10)
- `search` (optionnel) : Recherche par nom, téléphone, ou numéro d'adhésion
- `genre` (optionnel) : Filtrer par genre (HOMME, FEMME)

**Exemple de requête :**
```
GET /api/members?page=1&limit=10&search=Diallo&genre=HOMME
```

**Réponse (200) :**
```json
{
  "members": [
    {
      "id": "clx1234567890",
      "numeroAdhesion": "DAH001",
      "prenom": "Amadou",
      "nom": "Diallo",
      "genre": "HOMME",
      "dateNaissance": "1990-05-15T00:00:00.000Z",
      "telephone": "771234567",
      "adresse": "Dakar, Sénégal",
      "dateInscription": "2024-01-01T00:00:00.000Z",
      "photoProfile": "/uploads/profiles/photo1.jpg",
      "_count": {
        "cotisations": 12,
        "eventParticipations": 3
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

### GET /api/members/:id
Récupérer les détails d'un membre spécifique.

**Réponse (200) :**
```json
{
  "member": {
    "id": "clx1234567890",
    "numeroAdhesion": "DAH001",
    "prenom": "Amadou",
    "nom": "Diallo",
    "genre": "HOMME",
    "dateNaissance": "1990-05-15T00:00:00.000Z",
    "telephone": "771234567",
    "adresse": "Dakar, Sénégal",
    "dateInscription": "2024-01-01T00:00:00.000Z",
    "photoProfile": "/uploads/profiles/photo1.jpg",
    "cotisations": [
      {
        "id": "clx9876543210",
        "montant": 5000,
        "semaine": "2024-01-01T00:00:00.000Z",
        "statut": "PAYE",
        "createdAt": "2024-01-01T12:00:00.000Z"
      }
    ],
    "eventParticipations": [
      {
        "id": "clx5555555555",
        "event": {
          "titre": "Conférence Religieuse",
          "dateDebut": "2024-02-01T10:00:00.000Z"
        },
        "statut": "CONFIRME"
      }
    ]
  }
}
```

### POST /api/members
Créer un nouveau membre.

**Corps de la requête (multipart/form-data) :**
```json
{
  "prenom": "Fatou",
  "nom": "Sow",
  "genre": "FEMME",
  "dateNaissance": "1995-03-20",
  "telephone": "779876543",
  "adresse": "Thiès, Sénégal",
  "photoProfile": "<fichier_image>"
}
```

**Réponse (201) :**
```json
{
  "message": "Membre créé avec succès",
  "member": {
    "id": "clx2222222222",
    "numeroAdhesion": "DAH025",
    "prenom": "Fatou",
    "nom": "Sow",
    "genre": "FEMME",
    "dateNaissance": "1995-03-20T00:00:00.000Z",
    "telephone": "779876543",
    "adresse": "Thiès, Sénégal",
    "dateInscription": "2024-01-15T12:00:00.000Z",
    "photoProfile": "/uploads/profiles/photo25.jpg"
  }
}
```

### PUT /api/members/:id
Mettre à jour un membre existant.

**Corps de la requête :**
```json
{
  "prenom": "Fatou Bintou",
  "telephone": "779876544",
  "adresse": "Thiès, Quartier Médina"
}
```

**Réponse (200) :**
```json
{
  "message": "Membre mis à jour avec succès",
  "member": {
    "id": "clx2222222222",
    "numeroAdhesion": "DAH025",
    "prenom": "Fatou Bintou",
    "nom": "Sow",
    "telephone": "779876544",
    "adresse": "Thiès, Quartier Médina"
  }
}
```

### DELETE /api/members/:id
Supprimer un membre.

**Réponse (200) :**
```json
{
  "message": "Membre supprimé avec succès"
}
```

### GET /api/members/:id/stats
Récupérer les statistiques d'un membre.

**Réponse (200) :**
```json
{
  "stats": {
    "totalCotisations": 60000,
    "cotisationsPayees": 12,
    "cotisationsEnAttente": 1,
    "evenementsParticipes": 3,
    "derniereCotisation": "2024-01-15T00:00:00.000Z",
    "moyenneMensuelle": 20000
  }
}
```

## Gestion des Cotisations

### GET /api/cotisations
Récupérer la liste des cotisations.

**Paramètres de requête :**
- `page`, `limit` : Pagination
- `memberId` : Filtrer par membre
- `statut` : Filtrer par statut (PAYE, EN_ATTENTE, ABSENT)
- `startDate`, `endDate` : Filtrer par période

**Réponse (200) :**
```json
{
  "cotisations": [
    {
      "id": "clx9876543210",
      "montant": 5000,
      "semaine": "2024-01-01T00:00:00.000Z",
      "statut": "PAYE",
      "createdAt": "2024-01-01T12:00:00.000Z",
      "member": {
        "id": "clx1234567890",
        "prenom": "Amadou",
        "nom": "Diallo",
        "numeroAdhesion": "DAH001"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 150,
    "pages": 15
  }
}
```

### POST /api/cotisations
Enregistrer une nouvelle cotisation.

**Corps de la requête :**
```json
{
  "memberId": "clx1234567890",
  "montant": 5000,
  "semaine": "2024-01-08",
  "statut": "PAYE"
}
```

**Réponse (201) :**
```json
{
  "message": "Cotisation enregistrée avec succès",
  "cotisation": {
    "id": "clx3333333333",
    "montant": 5000,
    "semaine": "2024-01-08T00:00:00.000Z",
    "statut": "PAYE",
    "createdAt": "2024-01-08T14:30:00.000Z",
    "member": {
      "prenom": "Amadou",
      "nom": "Diallo",
      "numeroAdhesion": "DAH001"
    }
  }
}
```

### POST /api/cotisations/bulk
Enregistrer plusieurs cotisations en une fois.

**Corps de la requête :**
```json
{
  "semaine": "2024-01-08",
  "cotisations": [
    {
      "memberId": "clx1234567890",
      "montant": 5000,
      "statut": "PAYE"
    },
    {
      "memberId": "clx2222222222",
      "montant": 5000,
      "statut": "EN_ATTENTE"
    }
  ]
}
```

**Réponse (201) :**
```json
{
  "message": "Cotisations enregistrées avec succès",
  "created": 2,
  "cotisations": [...]
}
```

### GET /api/cotisations/week/:semaine
Récupérer les cotisations d'une semaine spécifique.

**Exemple :**
```
GET /api/cotisations/week/2024-01-08
```

**Réponse (200) :**
```json
{
  "semaine": "2024-01-08T00:00:00.000Z",
  "cotisations": [...],
  "resume": {
    "totalMontant": 45000,
    "nombrePaye": 8,
    "nombreEnAttente": 2,
    "nombreAbsent": 1
  }
}
```

## Gestion des Événements

### GET /api/events
Récupérer la liste des événements.

**Paramètres de requête :**
- `page`, `limit` : Pagination
- `upcoming` : true pour les événements à venir uniquement
- `type` : Filtrer par type d'événement

**Réponse (200) :**
```json
{
  "events": [
    {
      "id": "clx4444444444",
      "titre": "Conférence Religieuse Annuelle",
      "description": "Grande conférence avec des invités internationaux",
      "dateDebut": "2024-03-15T09:00:00.000Z",
      "dateFin": "2024-03-15T17:00:00.000Z",
      "lieu": "Grande Mosquée de Dakar",
      "montantContribution": 10000,
      "_count": {
        "participants": 25
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 8,
    "pages": 1
  }
}
```

### POST /api/events
Créer un nouveau événement.

**Corps de la requête :**
```json
{
  "titre": "Journée de Solidarité",
  "description": "Collecte de fonds pour les familles nécessiteuses",
  "dateDebut": "2024-04-20T08:00:00.000Z",
  "dateFin": "2024-04-20T18:00:00.000Z",
  "lieu": "Centre Communautaire",
  "montantContribution": 15000
}
```

**Réponse (201) :**
```json
{
  "message": "Événement créé avec succès",
  "event": {
    "id": "clx5555555555",
    "titre": "Journée de Solidarité",
    "description": "Collecte de fonds pour les familles nécessiteuses",
    "dateDebut": "2024-04-20T08:00:00.000Z",
    "dateFin": "2024-04-20T18:00:00.000Z",
    "lieu": "Centre Communautaire",
    "montantContribution": 15000,
    "createdAt": "2024-01-15T10:00:00.000Z"
  }
}
```

### POST /api/events/:id/participants
Ajouter un participant à un événement.

**Corps de la requête :**
```json
{
  "memberId": "clx1234567890"
}
```

**Réponse (201) :**
```json
{
  "message": "Participant ajouté avec succès",
  "participation": {
    "id": "clx6666666666",
    "eventId": "clx5555555555",
    "memberId": "clx1234567890",
    "statut": "CONFIRME",
    "createdAt": "2024-01-15T11:00:00.000Z"
  }
}
```

## Gestion des Dépenses

### GET /api/expenses
Récupérer la liste des dépenses.

**Paramètres de requête :**
- `page`, `limit` : Pagination
- `type` : Filtrer par type (EVENEMENT, GENERALE)
- `startDate`, `endDate` : Filtrer par période

**Réponse (200) :**
```json
{
  "expenses": [
    {
      "id": "clx7777777777",
      "description": "Achat de matériel sonore",
      "montant": 150000,
      "type": "EVENEMENT",
      "date": "2024-01-10T00:00:00.000Z",
      "justificatif": "/uploads/receipts/receipt1.pdf",
      "createdAt": "2024-01-10T15:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "pages": 5
  }
}
```

### POST /api/expenses
Enregistrer une nouvelle dépense.

**Corps de la requête (multipart/form-data) :**
```json
{
  "description": "Frais de transport pour conférenciers",
  "montant": 75000,
  "type": "EVENEMENT",
  "date": "2024-01-12",
  "justificatif": "<fichier_pdf>"
}
```

**Réponse (201) :**
```json
{
  "message": "Dépense enregistrée avec succès",
  "expense": {
    "id": "clx8888888888",
    "description": "Frais de transport pour conférenciers",
    "montant": 75000,
    "type": "EVENEMENT",
    "date": "2024-01-12T00:00:00.000Z",
    "justificatif": "/uploads/receipts/receipt15.pdf",
    "createdAt": "2024-01-12T09:15:00.000Z"
  }
}
```

### GET /api/expenses/stats
Récupérer les statistiques des dépenses.

**Paramètres de requête :**
- `startDate`, `endDate` : Période d'analyse
- `groupBy` : Grouper par (month, type)

**Réponse (200) :**
```json
{
  "stats": {
    "totalAmount": 450000,
    "totalCount": 12,
    "byType": [
      {
        "type": "EVENEMENT",
        "montant": 300000,
        "count": 8
      },
      {
        "type": "GENERALE",
        "montant": 150000,
        "count": 4
      }
    ],
    "byMonth": [
      {
        "month": "2024-01",
        "montant": 225000,
        "count": 6
      }
    ]
  }
}
```

## Tableau de Bord

### GET /api/dashboard
Récupérer les statistiques générales du tableau de bord.

**Réponse (200) :**
```json
{
  "summary": {
    "totalMembers": 25,
    "soldeTotal": 1250000,
    "cotisationsThisMonth": {
      "montant": 200000,
      "count": 40
    },
    "expensesThisMonth": {
      "montant": 75000,
      "count": 3
    }
  },
  "upcomingEvents": [
    {
      "id": "clx5555555555",
      "titre": "Journée de Solidarité",
      "dateDebut": "2024-04-20T08:00:00.000Z",
      "lieu": "Centre Communautaire",
      "montantContribution": 15000,
      "_count": {
        "participants": 12
      }
    }
  ],
  "recentCotisations": [
    {
      "id": "clx3333333333",
      "montant": 5000,
      "statut": "PAYE",
      "createdAt": "2024-01-15T14:30:00.000Z",
      "member": {
        "prenom": "Amadou",
        "nom": "Diallo",
        "numeroAdhesion": "DAH001"
      }
    }
  ],
  "membersWithoutRecentCotisation": [
    {
      "id": "clx9999999999",
      "prenom": "Ibrahim",
      "nom": "Ba",
      "numeroAdhesion": "DAH015",
      "telephone": "775555555"
    }
  ],
  "charts": {
    "monthlyTrend": [
      {
        "month": "2024-01-01T00:00:00.000Z",
        "cotisations": 200000,
        "expenses": 75000
      }
    ],
    "expensesByType": [
      {
        "type": "EVENEMENT",
        "montant": 300000,
        "count": 8
      }
    ]
  }
}
```

### GET /api/dashboard/financial-summary
Récupérer un résumé financier détaillé.

**Paramètres de requête :**
- `startDate`, `endDate` : Période d'analyse
- `groupBy` : Grouper par (week, month, year)

**Réponse (200) :**
```json
{
  "period": {
    "startDate": "2024-01-01T00:00:00.000Z",
    "endDate": "2024-01-31T23:59:59.999Z"
  },
  "summary": {
    "totalCotisations": 200000,
    "totalExpenses": 75000,
    "netBalance": 125000,
    "averageWeeklyCotisation": 50000
  },
  "trends": [
    {
      "period": "2024-01-01",
      "cotisations": 50000,
      "expenses": 25000,
      "balance": 25000
    }
  ]
}
```

## Codes d'Erreur

### Codes HTTP Standards

- **200** : Succès
- **201** : Créé avec succès
- **400** : Requête invalide
- **401** : Non autorisé (token manquant ou invalide)
- **403** : Accès interdit (permissions insuffisantes)
- **404** : Ressource non trouvée
- **409** : Conflit (ex: email déjà utilisé)
- **422** : Données de validation invalides
- **500** : Erreur interne du serveur

### Format des Erreurs

```json
{
  "error": "Message d'erreur principal",
  "details": "Détails supplémentaires si disponibles",
  "code": "ERROR_CODE_SPECIFIC",
  "timestamp": "2024-01-15T12:00:00.000Z"
}
```

### Erreurs de Validation

```json
{
  "error": "Erreur de validation",
  "details": {
    "email": ["L'email est requis", "Format d'email invalide"],
    "password": ["Le mot de passe doit contenir au moins 6 caractères"]
  }
}
```

## Limites et Quotas

### Rate Limiting

- **Limite générale** : 100 requêtes par 15 minutes par IP
- **Authentification** : 5 tentatives de connexion par 15 minutes
- **Upload de fichiers** : 5 MB maximum par fichier

### Pagination

- **Limite par défaut** : 10 éléments
- **Limite maximum** : 100 éléments par page

### Formats de Fichiers Supportés

**Images (photos de profil) :**
- JPEG, PNG, WebP
- Taille maximum : 2 MB

**Documents (justificatifs) :**
- PDF, JPEG, PNG
- Taille maximum : 5 MB

## Exemples d'Utilisation

### Authentification et Utilisation

```javascript
// 1. Connexion
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'admin@dahiraa.com',
    password: 'password123'
  })
});

const { token } = await loginResponse.json();

// 2. Utilisation du token pour les requêtes suivantes
const membersResponse = await fetch('/api/members', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const members = await membersResponse.json();
```

### Création d'un Membre avec Photo

```javascript
const formData = new FormData();
formData.append('prenom', 'Aminata');
formData.append('nom', 'Diop');
formData.append('genre', 'FEMME');
formData.append('dateNaissance', '1992-07-10');
formData.append('telephone', '778888888');
formData.append('adresse', 'Saint-Louis, Sénégal');
formData.append('photoProfile', fileInput.files[0]);

const response = await fetch('/api/members', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

Cette documentation couvre tous les endpoints principaux de l'API Gestion Dahiraa. Pour des informations plus détaillées ou des cas d'usage spécifiques, consultez la documentation Swagger disponible à l'adresse `/api-docs` lorsque le serveur est en cours d'exécution.

