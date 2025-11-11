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

**État actuel**: Projet initialisé avec npm. Base de connaissances (CLAUDE.md) et package.json créés.

## Technology Stack

**Status**: En cours de définition
- Frontend: À déterminer
- Backend: Node.js (npm initialisé)
- Base de données: À déterminer
- Langage(s): JavaScript/TypeScript (à confirmer)

## Architecture

**Status**: Non définie

Cette section sera mise à jour avec:
- Structure des dossiers
- Patterns architecturaux choisis (MVC, Clean Architecture, etc.)
- Flux de données
- Gestion de l'état
- Organisation des modules/composants

## Commands & Workflows

**Status**: Configuration de base

```bash
# Installation des dépendances
npm install

# Développement
# [À définir selon le framework choisi]

# Tests
npm test  # (actuellement non configuré)

# Build
# [À définir]
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

## Conventions & Standards

Cette section définira:
- Conventions de nommage
- Structure des commits
- Standards de code
- Patterns de tests

## Security Considerations

- Gestion sécurisée des données financières sensibles
- Authentification/autorisation (si multi-utilisateur)
- Chiffrement des données au repos (à considérer)
- Validation des entrées utilisateur

## Known Issues & TODOs

*[Aucun problème connu pour le moment]*

## Notes & Context

*[Section pour notes contextuelles importantes]*
