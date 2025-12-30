# Changelog

Tous les changements notables de ce projet seront documentés dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère au [Semantic Versioning](https://semver.org/lang/fr/).

## [Non publié]

### En cours

- Documentation des changements pour les prochaines versions

## [0.5.0] - 2025-12-30

### Ajouté

- **Gestion des livrets**:
  - Types Livret et LivretInput dans budget.types.ts
  - Service livret.service.ts avec méthodes CRUD Firestore
  - Composant LivretManager avec formulaire (nom + solde de départ)
  - Intégration complète avec BudgetContext (état + méthodes CRUD)
  - Optimistic updates pour UX fluide
  - Règles Firestore pour collection livrets
  - Onglet "Livret" dans les Paramètres

- **Nouvelles pages**:
  - Page SuiviLivret.tsx : visualisation et gestion des livrets d'épargne
  - Page SuiviDepense.tsx : suivi des dépenses par catégorie avec statistiques
  - Dashboard amélioré (Home.tsx) : vue d'ensemble avec cartes de résumé et actions rapides

- **Navigation**:
  - Routes `/suivi-livret` et `/suivi-depense` dans App.tsx
  - Liens de navigation dans app-sidebar.tsx avec icônes appropriées
  - Section "Actions rapides" dans le Dashboard

### Modifié

- **Pages Settings**:
  - Remplacement de l'onglet "Profil" par "Livret"
  - Gestion des livrets intégrée aux paramètres

- **BudgetContext**:
  - Extension avec état livrets (livrets, livretsLoading)
  - Ajout méthodes fetchLivrets, createLivret, updateLivret, deleteLivret
  - Chargement automatique des livrets au montage

- **Firestore**:
  - Rules mises à jour pour autoriser accès à la collection livrets

- **UI/UX**:
  - Messages informatifs pour états vides (aucun livret, aucune catégorie)
  - Skeletons de chargement cohérents
  - Design responsive sur toutes les nouvelles pages
  - Notifications toast pour toutes les opérations CRUD

### Supprimé

- Page PageTwo.tsx (exemple inutilisé)
- Route `/two` du routing
- Référence à PageTwo dans app-sidebar.tsx

### Notes

Cette version apporte la gestion complète des livrets d'épargne avec persistance Firestore et introduit deux nouvelles pages principales pour le suivi des finances. L'application dispose maintenant d'une structure claire avec Dashboard, Suivi Livret, Suivi Dépense et Paramètres. Les fonctionnalités de base sont en place pour gérer catégories et livrets, prêtes pour l'ajout futur des transactions.

## [0.4.0] - 2025-12-27

### Ajouté

- **Firebase Integration**:
  - Firebase SDK v11.2.0 (Authentication + Firestore Database)
  - Configuration Firebase dans src/config/firebase.ts
  - Variables d'environnement (.env.example, .env.local)
  - .gitignore mis à jour pour exclure .env.local

- **Authentication**:
  - Firebase Authentication avec email/password
  - AuthContext pour gestion d'état global d'authentification
  - Hook useAuth pour accès facile au contexte
  - Pages Login et Register avec formulaires complets
  - Protection des routes avec composant ProtectedRoute
  - Redirection automatique vers /login si non authentifié
  - Skeleton loader pendant vérification authentification

- **Services Layer**:
  - Service auth.service.ts (register, login, logout, resetPassword)
  - Service firestore.service.ts (CRUD générique pour Firestore)
  - Gestion des erreurs Firebase traduite en français

- **Types TypeScript**:
  - Types auth.types.ts (User, AuthContextType, AuthProviderProps)
  - Types budget.types.ts (Transaction, Category, BudgetSummary)
  - Export centralisé dans types/index.ts

- **Composants**:
  - LoginForm avec validation et états de chargement
  - RegisterForm avec champ displayName optionnel
  - ProtectedRoute HOC pour sécurisation des routes
  - Notifications toast avec Sonner (succès/erreur)

- **Structure**:
  - Dossier config/ pour configuration Firebase
  - Dossier contexts/ pour Context providers
  - Dossier services/ pour services Firebase
  - Dossier types/ pour types TypeScript
  - Dossier components/auth/ pour composants d'authentification

### Modifié

- **Routing**:
  - App.tsx : Routes publiques (/login, /register) et protégées (/, /two, /settings)
  - Structure de routing avec ProtectedRoute englobant SidebarProvider

- **Application**:
  - main.tsx : Enrobé avec AuthProvider et Toaster
  - nav-user.tsx : Utilisation de useAuth() pour données utilisateur réelles
  - nav-user.tsx : Fonction handleLogout avec navigation vers /login
  - nav-user.tsx : Labels traduits en français (Mon compte, Abonnement, Se déconnecter)
  - nav-user.tsx : Avatar avec initiales générées dynamiquement
  - app-sidebar.tsx : Suppression des données user hardcodées
  - app-sidebar.tsx : NavUser appelé sans props

- **Documentation**:
  - CLAUDE.md : Technology Stack mis à jour (Firebase, Context API)
  - CLAUDE.md : Structure des dossiers mise à jour (config/, contexts/, services/, types/)
  - CLAUDE.md : Patterns établis étendus (State Management, Services Layer, Authentication)
  - CLAUDE.md : Data Models définis avec références aux types
  - CLAUDE.md : Section "Intégration Firebase" dans Design Decisions
  - CHANGELOG.md : Version 0.4.0 documentée

### Sécurité

- Variables d'environnement pour credentials Firebase
- Protection des routes authentifiées avec ProtectedRoute
- .env.local exclu du versioning Git
- Messages d'erreur utilisateur sans exposition d'informations sensibles
- Validation côté client des formulaires d'authentification

### Notes

Cette version apporte l'authentification complète à l'application avec Firebase. Les utilisateurs peuvent maintenant s'inscrire, se connecter, et se déconnecter. Toutes les routes principales sont protégées et redirigent vers la page de connexion si l'utilisateur n'est pas authentifié. La base est posée pour l'intégration des fonctionnalités de gestion budgétaire avec Firestore.

**Configuration requise** : Créer un projet Firebase et remplir le fichier .env.local avec les credentials Firebase pour que l'application fonctionne.

## [0.3.0] - 2025-11-11

### Ajouté

- **Routing**:
  - React Router DOM v7.9.5 intégré avec BrowserRouter
  - Structure pages/ avec composants Home et PageTwo
  - Navigation entre pages avec composant Link

- **Composants UI shadcn/ui**:
  - Composants Button et Card dans components/ui/
  - Nombreux composants Radix UI ajoutés aux dépendances (@radix-ui/react-\*)
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
