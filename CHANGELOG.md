# Changelog

Tous les changements notables de ce projet seront documentés dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère au [Semantic Versioning](https://semver.org/lang/fr/).

## [Non publié]

### En cours

- Documentation des changements pour les prochaines versions

## [0.3.0] - 2025-11-11

### Ajouté

- **Routing**:
  - React Router DOM v7.9.5 intégré avec BrowserRouter
  - Structure pages/ avec composants Home et PageTwo
  - Navigation entre pages avec composant Link

- **Composants UI shadcn/ui**:
  - Composants Button et Card dans components/ui/
  - Nombreux composants Radix UI ajoutés aux dépendances (@radix-ui/react-*)
  - Utilitaire cn() dans lib/utils.ts pour fusion de classes CSS

- **Bibliothèques et outils**:
  - Recharts v2.15.4 pour visualisation de données
  - TanStack Table v8.21.3 pour tableaux avancés
  - Zod v4.1.12 pour validation de schémas
  - @dnd-kit pour fonctionnalités drag & drop
  - Sonner v2.0.7 pour notifications toast
  - next-themes v0.4.6 pour gestion des thèmes
  - vaul v1.1.2 pour drawers mobiles

- **Configuration**:
  - Plugin @tailwindcss/vite pour Tailwind CSS v4
  - Alias '@' configuré dans vite.config.ts pour imports absolus
  - Types Node.js ajoutés (@types/node)

- **Structure projet**:
  - Dossier pages/ pour les pages de l'application
  - Dossier hooks/ avec use-mobile.ts
  - Dossier lib/ pour utilitaires partagés
  - Dossier components/ui/ pour composants shadcn/ui

### Modifié

- **Configuration Vite**:
  - Ajout du plugin @tailwindcss/vite
  - Configuration de l'alias '@' pointant vers ./src
  - Exposition réseau désactivée (host: false)

- **Application**:
  - App.tsx converti en router avec Routes et Route
  - main.tsx enrobé avec BrowserRouter
  - index.html: titre changé de "temp-vite" à "my-budget-buddy"
  - index.html: ajout du lien vers globals.css

- **Documentation**:
  - CLAUDE.md: mise à jour complète du Technology Stack
  - CLAUDE.md: documentation des nouvelles décisions architecturales
  - CLAUDE.md: structure des dossiers mise à jour
  - CLAUDE.md: ajout des patterns établis (routing, alias, etc.)
  - CLAUDE.md: port du serveur de dev corrigé (9999)

### Supprimé

- src/styles/globals.css (déplacé vers src/assets/styles/)

### Notes

Cette version pose les fondations de l'interface utilisateur avec shadcn/ui et établit l'architecture de routing de l'application. Les bibliothèques de visualisation de données (Recharts), de tableaux (TanStack Table), et de validation (Zod) sont prêtes pour l'implémentation des fonctionnalités de gestion budgétaire.

## [0.2.0] - 2025-11-11

### Ajouté

- Plugins Prettier pour Tailwind CSS et tri automatique des imports
- Cache ESLint pour améliorer les performances de linting
- Configuration personnalisée du serveur de développement Vite (port 9999, host activé)

### Modifié

- Configuration Prettier étendue :
  - Largeur de ligne portée à 140 caractères
  - Ordre des imports configuré (@ > ~ > ../ > ./)
  - jsxSingleQuote activé
  - package-lock.json exclu du formatage
- Scripts npm renommés : `format` → `prettier`, `format:check` → `prettier:check`
- Scripts ESLint mis à jour pour utiliser le cache (--cache)
- Mise à jour de typescript-eslint (8.46.3 → 8.46.4)
- Formatage complet de la codebase avec la nouvelle configuration Prettier

## [0.1.0] - 2025-11-11

### Ajouté

- Initialisation du projet React 19.2.0 avec TypeScript 5.9.3
- Configuration de Vite 7.2.2 comme outil de build
- Configuration d'ESLint 9.39.1 avec flat config et plugins React
- Configuration de Prettier 3.6.2 pour le formatage automatique
- Scripts npm pour dev, build, lint et format
- Création de CLAUDE.md comme base de connaissances vivante du projet
- Mise en place du CHANGELOG.md avec Semantic Versioning
- Configuration des permissions Claude Code pour npm et git

### Conventions établies

- Structure de projet Vite standard
- Code style avec Prettier (single quotes, 2 espaces, semi-colons)
- Messages de commit en français avec préfixe type (feat, fix, etc.)
- Nommage : PascalCase pour composants, camelCase pour utils

## [0.0.0] - 2025-11-11

### Ajouté

- Initialisation du repository Git
- Création du README.md initial

---

## Légende des types de changements

- **Ajouté** : nouvelles fonctionnalités
- **Modifié** : changements dans les fonctionnalités existantes
- **Déprécié** : fonctionnalités bientôt supprimées
- **Supprimé** : fonctionnalités supprimées
- **Corrigé** : corrections de bugs
- **Sécurité** : corrections de vulnérabilités
