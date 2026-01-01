# 🔐 Configuration du Compte Administrateur

## Objectif

Ce guide explique comment créer un compte administrateur pour accéder au panneau d'administration de l'application Transport DanGE.

## Prérequis

- PostgreSQL installé et démarré
- Base de données initialisée (voir `backend/database/init.js`)
- Variables d'environnement configurées (`.env` dans le dossier `backend/`)

## Création du Compte Admin

### 1. Exécuter le Script

```bash
cd backend
npm run create-admin
```

### 2. Vérification

Le script affichera un message de confirmation si la création est réussie :

```
═══════════════════════════════════════════════
✅ Compte administrateur créé avec succès !
═══════════════════════════════════════════════

📋 Informations du compte:
   ID: 1
   Username: admin
   Password: admin77281670
   Rôle: admin
   Créé le: 2024-01-01 12:00:00

⚠️  IMPORTANT: Changez le mot de passe après la première connexion!
```

## Identifiants par Défaut

| Champ | Valeur |
|-------|--------|
| **Username** | `admin` |
| **Password** | `admin77281670` |
| **Rôle** | `admin` |

## Connexion

1. Accédez à l'interface d'administration (URL selon votre configuration)
2. Connectez-vous avec les identifiants ci-dessus
3. **Changez immédiatement le mot de passe** pour sécuriser le compte

## Gestion des Erreurs

### Le compte admin existe déjà

Si vous voyez ce message :
```
⚠️  Un compte administrateur existe déjà!
```

Le compte admin a déjà été créé. Si vous avez oublié le mot de passe, vous devrez le réinitialiser manuellement dans la base de données.

### Erreur de connexion à la base de données

```
❌ Erreur lors de la création du compte administrateur
```

**Solutions :**
1. Vérifiez que PostgreSQL est démarré
2. Vérifiez les variables d'environnement dans le fichier `.env`
3. Assurez-vous que la base de données existe et est accessible

## ⚠️ Sécurité

### Recommandations Importantes

1. **Changez le mot de passe immédiatement** après la première connexion
2. Utilisez un mot de passe fort contenant :
   - Au moins 12 caractères
   - Des lettres majuscules et minuscules
   - Des chiffres
   - Des caractères spéciaux
3. Ne partagez jamais vos identifiants administrateur
4. Activez la double authentification si disponible

### Pour Changer le Mot de Passe

Une fois connecté en tant qu'administrateur, utilisez l'interface de gestion de compte pour changer votre mot de passe.

## Support

Pour toute question ou problème, consultez :
- La documentation principale : [README.md](../README.md)
- La FAQ : [documentation/09-FAQ-TROUBLESHOOTING.md](../documentation/09-FAQ-TROUBLESHOOTING.md)

---

**Version:** 1.0.0 | **Transport DanGE** - Dunois, Eure-et-Loir
