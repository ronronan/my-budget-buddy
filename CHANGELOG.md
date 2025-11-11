# Changelog

Tous les changements notables de ce projet seront documentés dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère au [Semantic Versioning](https://semver.org/lang/fr/).

## [Non publié]

### En cours

- Documentation des changements pour les prochaines versions

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
