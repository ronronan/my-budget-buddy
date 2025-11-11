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
- Base de données: À déterminer (prochaine étape)

## Architecture

**Status**: Structure Vite standard

### Structure des dossiers
```
my-budget-buddy/
├── src/
│   ├── App.tsx          # Composant principal
│   ├── App.css          # Styles du composant principal
│   ├── main.tsx         # Point d'entrée de l'application
│   ├── index.css        # Styles globaux
│   └── assets/          # Ressources statiques
├── public/              # Fichiers publics statiques
├── index.html           # Template HTML
├── vite.config.ts       # Configuration Vite
├── tsconfig.json        # Configuration TypeScript principale
├── tsconfig.app.json    # Config TS pour l'application
├── tsconfig.node.json   # Config TS pour les scripts Node
├── eslint.config.js     # Configuration ESLint (flat config)
├── .prettierrc          # Configuration Prettier
└── package.json         # Dépendances et scripts

```

### Patterns à établir
- Gestion de l'état (Context API, Zustand, ou autre)
- Routing (React Router si nécessaire)
- Structure des composants (Atomic Design ou autre)
- Organisation des services/API calls

## Commands & Workflows

**Status**: Configuré et opérationnel

```bash
# Installation des dépendances
npm install

# Développement (démarrer le serveur de dev Vite)
npm run dev
# Serveur accessible sur http://localhost:5173

# Build de production
npm run build
# Compile TypeScript et génère les fichiers optimisés dans dist/

# Preview du build de production
npm run preview

# Linting
npm run lint          # Vérifier les erreurs ESLint
npm run lint:fix      # Corriger automatiquement les erreurs ESLint

# Formatting
npm run format        # Formatter le code avec Prettier
npm run format:check  # Vérifier le formatage sans modifier

# Tests
# [À configurer - Vitest recommandé pour Vite]
```

## Data Models

**Status**: Non définis

Modèles de données à créer:
- Transactions/Dépenses
- Catégories de budget
- Comptes/Sources de revenus
- Périodes budgétaires
- Objectifs financiers (si applicable)

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

*[Aucun problème connu pour le moment]*

## Notes & Context

*[Section pour notes contextuelles importantes]*
