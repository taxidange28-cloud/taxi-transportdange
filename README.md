# 🚕 Transport DanGE - Application de Dispatch Taxi

Application complète de gestion de missions taxi pour **Transport DanGE** (Taxi Dunois, Eure-et-Loir).

## 📋 Vue d'Ensemble

Système complet comprenant:
- 🖥️ **Backend API** (Node.js + PostgreSQL)
- 💻 **Frontend Secrétaire** (React - Interface web PC)
- 📱 **Frontend Chauffeur** (React PWA - Application mobile)

## 🎨 Identité Visuelle

**Entreprise:** Transport DanGE - Taxi Dunois  
**Domaine:** planning.transportdange.fr

**Couleurs:**
- Vert principal: `#4CAF50`
- Vert clair: `#8BC34A`
- Vert pastel: `#C8E6C9`
- Gris foncé: `#424242`

## 🌟 Fonctionnalités Principales

### Pour la Secrétaire
- ✅ Création de missions (brouillon ou envoi immédiat)
- ✅ Planning visuel avec statuts colorés
- ✅ Modification missions (si pas en cours)
- ✅ Envoi groupé par date
- ✅ Suivi temps réel des chauffeurs
- ✅ Lecture commentaires chauffeurs
- ✅ Export Excel pour comptabilité

### Pour les Chauffeurs
- ✅ Réception missions avec notifications push
- ✅ Confirmation de réception
- ✅ Prise en charge avec horodatage
- ✅ Fin de mission avec horodatage
- ✅ Ajout de commentaires
- ✅ Interface mobile optimisée
- ✅ Fonctionne hors ligne
- ✅ Installation PWA (comme app native)

## 📱 Applications

### Backend API
- **URL:** api.transportdange.fr
- **Port:** 3000
- **Stack:** Node.js, Express, PostgreSQL, Socket.io, Firebase
- **Sécurité:** JWT, Bcrypt, Helmet, CORS, Rate Limiting

### Frontend Secrétaire
- **URL:** planning.transportdange.fr
- **Stack:** React, Material-UI, Socket.io Client, Axios
- **Features:** Temps réel, Export Excel, Interface desktop

### Frontend Chauffeur (PWA)
- **URL:** chauffeur.transportdange.fr
- **Stack:** React, Material-UI, PWA, Service Worker, Firebase
- **Features:** Notifications push, Mode hors ligne, Installation mobile

## 🎯 Statuts des Missions

| Statut | Emoji | Description | Visible |
|--------|-------|-------------|---------|
| Brouillon | ⚪ | Non envoyée | Secrétaire |
| Envoyée | 🔵 | Envoyée au chauffeur | Tous |
| Confirmée | 🟡 | Lue par chauffeur | Tous |
| En cours (PEC) | 🔴 | Client à bord | Tous |
| Terminée | 🟢 | Mission finie | Tous |

## 👥 Comptes Utilisateurs

**Secrétaire:**
- Username: `Secretaire`
- Password: `ChangezMoi123!`

**Chauffeurs:**
- Username: `patron` / `franck` / `laurence` / `autre`
- Password: `ChangezMoi123!`

⚠️ **À changer immédiatement en production!**

## 🚀 Installation Rapide

Voir: **INSTALLATION-RAPIDE.md**

## 📚 Documentation Complète

### Installation et Déploiement
1. **[01-INSTALLATION-SERVEUR.md](documentation/01-INSTALLATION-SERVEUR.md)** - Prérequis serveur
2. **[02-CONFIGURATION-FIREBASE.md](documentation/02-CONFIGURATION-FIREBASE.md)** - Configuration notifications
3. **[03-DEPLOIEMENT-BACKEND.md](documentation/03-DEPLOIEMENT-BACKEND.md)** - Déploiement API
4. **[04-DEPLOIEMENT-FRONTEND.md](documentation/04-DEPLOIEMENT-FRONTEND.md)** - Déploiement frontends
5. **[05-CONFIGURATION-DOMAINE.md](documentation/05-CONFIGURATION-DOMAINE.md)** - Configuration DNS/SSL

### Guides Utilisateurs
6. **[06-INSTALLATION-PWA.md](documentation/06-INSTALLATION-PWA.md)** - Installation app chauffeur
7. **[07-GUIDE-UTILISATEUR-SECRETAIRE.md](documentation/07-GUIDE-UTILISATEUR-SECRETAIRE.md)** - Guide secrétaire
8. **[08-GUIDE-UTILISATEUR-CHAUFFEUR.md](documentation/08-GUIDE-UTILISATEUR-CHAUFFEUR.md)** - Guide chauffeur
9. **[09-FAQ-TROUBLESHOOTING.md](documentation/09-FAQ-TROUBLESHOOTING.md)** - FAQ et dépannage

## 🗂️ Structure du Projet

```
taxi-transportdange/
├── backend/                    # API Node.js
├── frontend-secretaire/       # Interface web secrétaire
├── frontend-chauffeur/        # PWA chauffeur
├── documentation/             # Documentation (9 guides)
└── scripts/                   # Scripts d'installation
```

## 🛠️ Technologies

- **Backend:** Node.js, Express, PostgreSQL, Socket.io, Firebase
- **Frontend:** React, Material-UI, PWA, Service Worker
- **Sécurité:** JWT, Bcrypt, HTTPS, CORS

## 🤝 Support

**Documentation:** `/documentation/`  
**FAQ:** `documentation/09-FAQ-TROUBLESHOOTING.md`

---

**Version:** 1.0.0 | **Transport DanGE** - Dunois, Eure-et-Loir
