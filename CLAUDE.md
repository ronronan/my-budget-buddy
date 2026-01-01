# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**IMPORTANT**: Ce fichier est une base de connaissances vivante. Toute décision, choix architectural, convention ou information pertinente doit être consignée ici pour référence future.

## Claude Code Permissions

**Commandes autorisées sans confirmation**:

- `npm` (install, run, test, build, start, etc.) - Gestion des dépendances et exécution des scripts
- `git` (status, add, commit, push, pull, branch, checkout, etc.) - Toutes opérations Git standard

**Politique d'exécution**:

- Claude peut exécuter ces commandes de manière autonome pour accomplir les tâches
- Les opérations destructives (git push --force, rm -rf, etc.) nécessitent toujours une confirmation
- Les modifications de configuration système restent soumises à approbation

**Workflow automatique pour chaque instruction** (depuis 2026-01-01):

**IMPORTANT**: À chaque instruction de l'utilisateur, effectuer automatiquement ces étapes dans l'ordre :

1. **Vérifications qualité** :
   - Exécuter `npm run prettier` pour vérifier le formatage
   - Exécuter `npm run lint` pour vérifier les erreurs ESLint
   - Exécuter `npm run type-check` pour vérifier les erreurs TypeScript
   - Si des erreurs sont détectées, les corriger avant de continuer

2. **Versioning** (si changements significatifs) :
   - Mettre à jour CHANGELOG.md avec la nouvelle version et les changements
   - Mettre à jour la version dans package.json pour correspondre au CHANGELOG
   - Exécuter `npm install` pour mettre à jour package-lock.json avec la nouvelle version

3. **Commit** :
   - Créer un commit avec message descriptif des changements

4. **Push** :
   - Pousser les commits sur origin/main

Cette politique assure un versioning continu, une qualité de code constante et un historique Git à jour en permanence.

## Project Overview

my-budget-buddy est une application de gestion de budget personnel.

**État actuel**: Projet React + TypeScript fonctionnel avec Vite, Prettier et ESLint configurés.

## Technology Stack

**Status**: Défini

- **Frontend**: React 19.2.0 avec TypeScript
- **Build Tool**: Vite 7.2.2
- **Package Manager**: npm
- **Language**: TypeScript 5.9.3
- **Linting**: ESLint 9.39.1 avec plugins React
- **Formatting**: Prettier 3.6.2
- **UI Components**: shadcn/ui (@radix-ui)
- **Styling**: Tailwind CSS v4 avec plugin Vite
- **Routing**: React Router DOM v7.9.5
- **State Management**: Context API (AuthContext, BudgetContext)
- **Data Visualization**: Recharts v2.15.4
- **Form Validation**: Zod v4.1.12
- **Drag & Drop**: @dnd-kit
- **Tables**: TanStack Table v8
- **Notifications**: Sonner v2
- **Themes**: next-themes v0.4.6
- **Backend**: Firebase v11.2.0 (Authentication + Firestore Database)

## Architecture

**Status**: Structure Vite standard

### Structure des dossiers

```
my-budget-buddy/
├── src/
│   ├── assets/
│   │   └── styles/
│   │       └── globals.css   # Styles globaux Tailwind CSS
│   ├── components/
│   │   ├── auth/             # Composants d'authentification
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   └── ui/               # Composants shadcn/ui
│   │       ├── button.tsx
│   │       └── card.tsx
│   ├── config/               # Configuration Firebase
│   │   └── firebase.ts
│   ├── contexts/             # Context providers React
│   │   └── AuthContext.tsx
│   ├── hooks/                # Custom hooks React
│   │   ├── use-mobile.ts     # Hook détection mobile
│   │   └── useAuth.ts        # Hook authentification
│   ├── lib/
│   │   ├── utils.ts          # Utilitaires (cn() pour class merging)
│   │   └── firebaseErrors.ts # Gestion erreurs Firebase
│   ├── pages/                # Pages de l'application
│   │   ├── Home.tsx
│   │   ├── PageTwo.tsx
│   │   ├── Settings.tsx
│   │   ├── Login.tsx
│   │   └── Register.tsx
│   ├── services/             # Services Firebase
│   │   ├── auth.service.ts
│   │   └── firestore.service.ts
│   ├── types/                # Types TypeScript
│   │   ├── auth.types.ts
│   │   ├── budget.types.ts
│   │   └── index.ts
│   ├── App.tsx               # Composant principal avec routing protégé
│   └── main.tsx              # Point d'entrée avec AuthProvider
├── public/                   # Fichiers publics statiques
├── .env.example              # Template variables d'environnement
├── .env.local                # Variables Firebase (NON commité)
├── .firebaserc               # Configuration projet Firebase
├── firebase.json             # Configuration Firebase Hosting
├── firestore.rules           # Règles de sécurité Firestore
├── firestore.indexes.json    # Index Firestore personnalisés
├── index.html                # Template HTML
├── vite.config.ts            # Configuration Vite (alias, plugins)
├── tsconfig.json             # Configuration TypeScript principale
├── tsconfig.app.json         # Config TS pour l'application
├── tsconfig.node.json        # Config TS pour les scripts Node
├── eslint.config.js          # Configuration ESLint (flat config)
├── .prettierrc               # Configuration Prettier
├── .gitignore                # Fichiers exclus du versioning
├── package.json              # Dépendances et scripts
├── CHANGELOG.md              # Historique des versions
└── CLAUDE.md                 # Base de connaissances du projet

```

### Patterns établis

- **Routing**: React Router v7 avec structure pages/
- **Composants UI**: shadcn/ui dans components/ui/
- **Custom hooks**: Fichiers dans hooks/ (useAuth, use-mobile)
- **Utilitaires**: Fonctions partagées dans lib/
- **Alias imports**: '@/' pour imports absolus depuis src/
- **State Management**: Context API (AuthContext pour authentification)
- **Services Layer**: Services Firebase dans services/ (auth.service, firestore.service)
- **Types**: Types TypeScript centralisés dans types/
- **Authentication**: Routes protégées avec ProtectedRoute HOC
- **Error Handling**: Messages d'erreur Firebase traduits en français

### Patterns à établir

- Gestion des formulaires avec validation Zod (à implémenter avec React Hook Form)
- Optimistic updates pour Firestore
- Gestion du cache des données Firebase

## Commands & Workflows

**Status**: Configuré et opérationnel

```bash
# Installation des dépendances
npm install

# Développement (démarrer le serveur de dev Vite)
npm run dev
# Serveur accessible sur http://localhost:9999

# Build de production
npm run build
# Compile TypeScript et génère les fichiers optimisés dans dist/

# Preview du build de production
npm run preview

# Linting
npm run lint          # Vérifier les erreurs ESLint
npm run lint:fix      # Corriger automatiquement les erreurs ESLint

# Formatting
npm run prettier        # Vérifier le formatage sans modifier
npm run prettier:fix    # Formatter le code avec Prettier

# Déploiement Firebase
npm run firebase:deploy # Déployer sur Firebase Hosting + Firestore rules
npm run firebase        # Accès direct à Firebase CLI

# Tests
# [À configurer - Vitest recommandé pour Vite]
```

### Workflow de déploiement

**Process recommandé pour déployer en production** :

1. **Vérification du code**

   ```bash
   npm run lint          # Vérifier les erreurs ESLint
   npm run prettier      # Vérifier le formatage
   ```

2. **Build de production**

   ```bash
   npm run build         # Compile et optimise pour production
   ```

3. **Commit des changements**

   ```bash
   git add .
   git commit -m "type: description"
   git push origin main
   ```

4. **Déploiement Firebase**
   ```bash
   npm run firebase:deploy
   # Déploie :
   # - Application web (dist/) sur Firebase Hosting
   # - Règles Firestore (firestore.rules)
   # - Index Firestore (firestore.indexes.json)
   ```

**Important** :

- Toujours build avant de déployer
- Le déploiement inclut automatiquement les règles Firestore et les index
- URL de production : [sera fournie par Firebase après premier déploiement]

## Data Models

**Status**: Définis dans types/

### Types Authentication (types/auth.types.ts)

- **User**: uid, email, displayName, photoURL
- **AuthContextType**: Interface pour le contexte d'authentification

### Types Budget (types/budget.types.ts)

- **Transaction**: id, userId, amount, category, description, date, type, createdAt, updatedAt
- **Category**: id, userId, name, color, icon, budget, createdAt
- **BudgetSummary**: totalIncome, totalExpenses, balance, categoriesBreakdown

### Collections Firestore

- `transactions` - Transactions utilisateur
- `categories` - Catégories de budget personnalisées
- (À venir) `budgets` - Budgets périodiques
- (À venir) `goals` - Objectifs financiers

## Design Decisions & Rationale

Cette section consigne les décisions importantes et leur justification:

### 2025-11-11: Initialisation du projet

- **Décision**: Utilisation de npm comme gestionnaire de paquets
- **Rationale**: Standard de l'écosystème Node.js, large adoption

- **Décision**: Création de CLAUDE.md comme base de connaissances vivante
- **Rationale**: Centraliser toutes les décisions et conventions pour référence future par Claude Code

### 2025-11-11: Stack technique frontend

- **Décision**: React + TypeScript avec Vite
- **Rationale**:
  - React: Framework populaire, large écosystème, excellent pour les SPA
  - TypeScript: Typage statique pour réduire les erreurs, meilleure DX
  - Vite: Build ultra-rapide, HMR performant, configuration minimale

- **Décision**: ESLint 9 avec flat config + Prettier
- **Rationale**:
  - ESLint 9: Nouvelle config flat plus simple et moderne
  - Prettier: Formatage automatique cohérent
  - Intégration: eslint-config-prettier évite les conflits

- **Décision**: React 19.2.0
- **Rationale**: Dernière version stable avec nouvelles fonctionnalités (React Compiler, etc.)

### 2025-11-11: Gestion des versions

- **Décision**: CHANGELOG.md avec Keep a Changelog + Semantic Versioning
- **Rationale**:
  - Keep a Changelog: Format standard reconnu par l'industrie, facile à lire pour humains et machines
  - Semantic Versioning: Communication claire de l'impact des changements (breaking changes vs features vs fixes)
  - Facilite les releases futures et la compréhension de l'évolution du projet
  - Documenter l'historique dès le début pour éviter de perdre le contexte des décisions

### 2025-11-11: Intégration UI et Routing

- **Décision**: shadcn/ui comme bibliothèque de composants
- **Rationale**:
  - Composants accessibles basés sur Radix UI
  - Personnalisables avec Tailwind CSS
  - Pas de dépendance NPM lourde, copie des composants dans le projet
  - Excellente DX et documentation

- **Décision**: React Router v7 pour le routing
- **Rationale**:
  - Standard de facto pour le routing React
  - API simple et puissante
  - Support du code splitting et lazy loading
  - Bonne intégration avec React 19

- **Décision**: Tailwind CSS v4 avec plugin Vite
- **Rationale**:
  - Version la plus récente avec meilleures performances
  - Plugin Vite natif pour intégration optimale
  - Utility-first CSS pour développement rapide
  - Excellent écosystème de plugins

- **Décision**: Alias '@' pour imports absolus
- **Rationale**:
  - Évite les imports relatifs complexes (../../..)
  - Meilleure lisibilité du code
  - Facilite les refactorings
  - Convention standard dans l'écosystème React

- **Décision**: Structure pages/ pour le routing
- **Rationale**:
  - Séparation claire entre pages et composants réutilisables
  - Facilite la navigation dans le code
  - Scalable pour applications de taille moyenne/grande

- **Décision**: Zod pour validation de formulaires
- **Rationale**:
  - TypeScript-first avec inférence de types
  - API intuitive et composable
  - Excellent pour validation côté client et serveur
  - Bonne intégration avec React Hook Form (future intégration possible)

- **Décision**: Recharts pour visualisation de données
- **Rationale**:
  - Bibliothèque mature et stable
  - Composants React natifs (pas de wrapper)
  - Adapté pour données budgétaires (graphiques en barres, lignes, camemberts)
  - Responsive et personnalisable

- **Décision**: TanStack Table pour tableaux de données
- **Rationale**:
  - Headless UI pour contrôle total du rendu
  - Performances excellentes avec virtualisation
  - Fonctionnalités avancées (tri, filtrage, pagination)
  - Parfait pour tableaux de transactions

- **Décision**: @dnd-kit pour drag & drop
- **Rationale**:
  - Moderne, performant et accessible
  - Excellent support TypeScript
  - Flexible et composable
  - Utile pour réorganiser catégories/budgets

### 2025-12-27: Intégration Firebase

- **Décision**: Firebase Authentication + Firestore Database
- **Rationale**:
  - Backend-as-a-Service pour accélérer le développement
  - Authentication robuste et sécurisée (email/password, OAuth future)
  - Firestore NoSQL flexible pour données budget
  - Synchronisation temps réel (fonctionnalité future)
  - SDK moderne avec excellent support TypeScript
  - Gratuit jusqu'à usage significatif (Spark plan)

- **Décision**: Context API pour gestion d'état global
- **Rationale**:
  - Suffisant pour état d'authentification et données budget
  - Pattern React natif, pas de dépendance externe
  - Performance acceptable pour cette échelle
  - Évolutif vers Zustand si nécessaire

- **Décision**: Services layer pour Firebase
- **Rationale**:
  - Séparation des préoccupations (UI vs logique métier)
  - Testabilité améliorée (mock facile des services)
  - Réutilisabilité des opérations CRUD
  - Abstraction permettant changement de backend si nécessaire
  - Code plus maintenable et organisé

- **Décision**: ProtectedRoute HOC pour sécurisation
- **Rationale**:
  - Protection centralisée des routes authentifiées
  - Redirection automatique vers /login si non connecté
  - UX améliorée avec skeleton loader pendant vérification
  - Pattern réutilisable et testable

- **Décision**: Messages d'erreur Firebase en français
- **Rationale**:
  - Meilleure UX pour utilisateurs francophones
  - Cohérence avec l'interface de l'application
  - Centralisation dans firebaseErrors.ts pour maintenance facile

### 2025-12-29: Configuration Firebase Hosting

- **Décision**: Firebase Hosting pour déploiement en production
- **Rationale**:
  - Intégration native avec Firebase Authentication et Firestore
  - CDN mondial avec performances excellentes
  - HTTPS automatique avec certificat SSL gratuit
  - Déploiement simplifié avec Firebase CLI
  - Rollback facile vers versions précédentes
  - Gratuité pour trafic modéré (Spark plan)
  - Configuration SPA avec rewrites pour React Router

- **Décision**: Déploiement automatique des règles Firestore
- **Rationale**:
  - Synchronisation règles de sécurité avec le code
  - Évite les oublis de mise à jour des règles
  - Versioning des règles via Git
  - Workflow cohérent (code + config en une commande)

- **Configuration**:
  - Projet Firebase : `budgeto-3rm`
  - Dossier déployé : `dist/` (build Vite)
  - Règles Firestore : Authentification requise pour accès categories
  - Rewrites : Toutes les routes vers /index.html (SPA)

## Conventions & Standards

### Code Style

- **Formatage**: Géré automatiquement par Prettier
  - Single quotes
  - 2 espaces d'indentation
  - Point-virgule obligatoire
  - 80 caractères max par ligne

### Linting

- **ESLint**: Configuration stricte avec TypeScript
  - Règles React Hooks recommandées
  - Règles React Refresh (Vite)
  - TypeScript strict mode

### Conventions de nommage

- **Composants**: PascalCase (ex: `BudgetCard.tsx`)
- **Fichiers utilitaires**: camelCase (ex: `formatCurrency.ts`)
- **Constantes**: UPPER_SNAKE_CASE
- **Types/Interfaces**: PascalCase avec prefix I pour interfaces si nécessaire

### Structure des commits

- Messages en français
- Format: `type: description courte`
- Types: feat, fix, refactor, docs, style, test, chore

### Gestion des versions (Changelog)

- **Fichier**: CHANGELOG.md à la racine du projet
- **Format**: [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/)
- **Versioning**: [Semantic Versioning](https://semver.org/lang/fr/) (MAJOR.MINOR.PATCH)
- **Mise à jour**: CHANGELOG.md doit être mis à jour pour chaque commit significatif
- **Catégories**: Ajouté, Modifié, Déprécié, Supprimé, Corrigé, Sécurité
- **Convention**:
  - Version 0.x.x pendant le développement initial
  - Version 1.0.0 pour la première release stable
  - Garder une section [Non publié] pour les changements en cours

### Imports

- Ordre recommandé:
  1. Librairies externes (React, etc.)
  2. Composants internes
  3. Utils/helpers
  4. Types
  5. Styles

## Security Considerations

- Gestion sécurisée des données financières sensibles
- Authentification/autorisation (si multi-utilisateur)
- Chiffrement des données au repos (à considérer)
- Validation des entrées utilisateur

## Known Issues & TODOs

_[Aucun problème connu pour le moment]_

## Notes & Context

_[Section pour notes contextuelles importantes]_
