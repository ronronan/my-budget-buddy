# Changelog

Tous les changements notables de ce projet seront documentés dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère au [Semantic Versioning](https://semver.org/lang/fr/).

## [Non publié]

### En cours

- Documentation des changements pour les prochaines versions

## [0.10.0] - 2026-01-03

### Ajouté

- **Suivi des transactions avec support des splits** :
  - Création de transactions de revenus ou dépenses
  - Association à une ou plusieurs sous-catégories (mode splits)
  - Formulaire intelligent avec deux modes :
    - **Mode simple** : montant + 1 catégorie
    - **Mode splits** : division du montant entre plusieurs catégories avec validation en temps réel
  - Affichage du montant restant à allouer en mode splits
  - Filtres avancés : type (revenus/dépenses), catégorie, période (mois/année/tout)
  - Liste des transactions avec badges de catégories colorés
  - Édition et suppression avec confirmation
  - Calcul automatique des statistiques du mois en cours
  - Validation stricte : somme des splits = montant total, sous-catégories uniquement
  - Optimistic updates pour UX réactive
  - Intégration complète avec Firebase Firestore

- **Nouveaux composants** :
  - `TransactionSheet` : Formulaire avancé avec modes simple/splits
  - `TransactionList` : Liste avec filtres et actions (modifier/supprimer)

- **Nouveaux services** :
  - `transaction.service.ts` : CRUD complet avec validation métier
  - Méthodes de requête (par période, par catégorie, par type)
  - Enrichissement automatique avec détails des catégories
  - Calcul des statistiques (revenus, dépenses, solde, répartition)

- **Nouveaux types** :
  - `TransactionSplit` : Division par catégorie
  - `Transaction` : Modèle avec support des splits
  - `TransactionInput` : Type pour création/modification
  - `TransactionWithCategories` : Version enrichie pour l'UI
  - Helpers : `createSimpleTransaction()`, `validateTransactionSplits()`

- **Validation Zod** :
  - Schéma pour mode simple (`simpleTransactionSchema`)
  - Schéma pour mode splits (`splitTransactionSchema`) avec validation personnalisée de la somme
  - Messages d'erreur en français

- **Sécurité Firestore** :
  - Règles de sécurité pour collection `transactions`
  - Validation côté serveur : userId, structure des données, montants positifs

- **Mise à jour page Suivi Dépense** :
  - Remplacement des statistiques fictives par vraies données
  - Intégration du formulaire et de la liste de transactions
  - Calcul en temps réel des totaux du mois en cours

## [0.9.1] - 2026-01-03

### Corrigé

- **Bug réinitialisation des valeurs dans Suivi Livrets** :
  - Correction du bug où éditer un solde mensuel réinitialisait tous les autres soldes à 0
  - La fonction `updateMonthlySolde` récupère maintenant correctement les valeurs existantes depuis Firestore avant de mettre à jour

- **Graphique de trésorerie vide** :
  - Correction de `getSoldeEffectif` pour accepter 0 comme valeur valide
  - Le graphique affiche maintenant correctement les données dès qu'une année a des soldes enregistrés
  - Distinction entre "année sans données" (null) et "solde à 0" (valeur valide)

## [0.9.0] - 2026-01-01

### Ajouté

- **Suivi mensuel des livrets** :
  - Enregistrement des soldes de fin de mois par livret et par année (2024-2031)
  - Sélecteur d'année pour naviguer entre les périodes
  - Grille de saisie responsive avec 12 inputs mensuels par livret
  - Fonction "Remplir depuis" pour dupliquer rapidement un mois de référence sur les mois vides
  - Sauvegarde en batch avec optimistic updates et gestion d'erreurs
  - Affichage du solde de départ pour chaque livret
  - Interface adaptative (2/3/4/6 colonnes selon la taille d'écran)

- **Graphique d'évolution de la trésorerie** :
  - Visualisation de la trésorerie totale (somme de tous les livrets) par mois
  - Courbe d'évolution mensuelle avec Recharts (LineChart)
  - Statistiques automatiques : minimum, maximum et moyenne de trésorerie
  - Support complet du mode sombre/clair avec CSS variables
  - Gestion des mois sans données (pas de connexion de points)
  - Empty state informatif si aucune donnée pour l'année sélectionnée
  - Formatage monétaire cohérent (tooltip, axes, statistiques)

- **Nouveaux types et helpers** :
  - Types `MonthlySoldes` et `YearlySoldes` pour structurer les soldes mensuels
  - Helpers `createEmptyMonthlySoldes()`, `getSoldesForYear()`, `updateSoldesForYear()`
  - Helper `getSoldeEffectif()` pour calculer le solde d'un mois avec gestion des valeurs nulles
  - Extension des interfaces `Livret` et `LivretInput` avec champ `yearlySoldes` (optionnel)

### Modifié

- **Page "Suivi des Livrets" complètement refactorisée** :
  - Nouvelle interface avec graphique en première position
  - Pattern de gestion d'état similaire à BudgetAnnuel (editingSoldes, hasChanges)
  - Réutilisation du composant wrapper `ChartContainer` pour cohérence visuelle
  - Messages d'état clairs et informatifs (loading, empty states, toasts de succès/erreur)

### Technique

- **Compatibilité rétroactive garantie** : Les livrets existants sans `yearlySoldes` fonctionnent automatiquement avec soldes vides
- **Première utilisation de Recharts en production** : Graphique interactif avec thème adaptatif
- **Aucune migration de base de données requise** : Le champ `yearlySoldes` est optionnel
- **Pattern réutilisé** : Suivi identique au système de budgets mensuels des catégories pour cohérence

### Notes

Cette version majeure (0.9.0) introduit une fonctionnalité complète de suivi de trésorerie avec visualisation graphique. Le pattern de budgets mensuels utilisé pour les catégories a été adapté pour les livrets, garantissant cohérence architecturale et maintenabilité. C'est également la première utilisation de Recharts dans l'application, ouvrant la voie à d'autres visualisations futures.

## [0.8.5] - 2026-01-01

### Corrigé

- **Bug Budget Annuel - Réinitialisation des valeurs**:
  - Correction du bug où les valeurs des champs de budget repassaient à 0 lors de la modification
  - Suppression de l'appel à `initializeBudget()` pendant le rendu qui causait des setState non désirés
  - Simplification de la logique en utilisant un fallback direct sans effet de bord
  - Les modifications de budget sont maintenant stables et ne se réinitialisent plus

### Notes

Cette version corrige un bug critique qui empêchait les utilisateurs de modifier correctement leurs budgets mensuels. Le problème était causé par un setState déclenché pendant le rendu du composant, provoquant des réinitialisations inattendues.

## [0.8.4] - 2026-01-01

### Ajouté

- **Workflow automatique - Tags et Releases GitHub**:
  - Ajout de l'étape de création de tag git annoté après le push
  - Création automatique de releases GitHub avec `gh release create`
  - Extraction automatique des notes de release depuis CHANGELOG.md
  - Les releases GitHub sont maintenant créées automatiquement avec documentation complète
  - Format des tags : `v{VERSION}` (ex: v0.8.4)
  - Chaque release contient les détails complets des changements de la version

### Notes

Cette version complète le workflow automatique en ajoutant la création de tags git et de releases GitHub. Chaque version publiée sera désormais automatiquement taggée et documentée sur GitHub avec les notes de release extraites du CHANGELOG.

## [0.8.3] - 2026-01-01

### Modifié

- **Workflow automatique Claude Code**:
  - Ajout de vérifications qualité avant chaque commit :
    - `npm run prettier` pour vérifier le formatage
    - `npm run lint` pour vérifier les erreurs ESLint
    - `npm run type-check` pour vérifier les erreurs TypeScript
  - Correction automatique des erreurs détectées avant commit
  - Synchronisation automatique des versions entre CHANGELOG.md et package.json
  - Mise à jour automatique de package-lock.json via `npm install`
  - Documentation complète du nouveau workflow dans CLAUDE.md

### Notes

Cette version améliore le workflow de développement en ajoutant des vérifications automatiques de qualité de code avant chaque commit. Cela garantit que le code poussé sur le dépôt est toujours formaté correctement, sans erreurs de lint et sans erreurs de type. Les versions sont maintenant synchronisées entre CHANGELOG.md et package.json.

## [0.8.2] - 2026-01-01

### Modifié

- **Optimisation du build de production**:
  - Ajout de code splitting manuel pour réduire la taille des chunks
  - Séparation des grosses dépendances dans des chunks distincts :
    - `react` : React core et react-dom (11.79 kB)
    - `react-router` : React Router DOM (35.61 kB)
    - `firebase` : Firebase app, auth et firestore (344.64 kB)
    - `radix-ui` : Tous les composants Radix UI (159.45 kB)
    - `recharts` : Bibliothèque de visualisation de données
    - `icons` : Tabler Icons et Lucide React (13.93 kB)
    - `tanstack` : TanStack Table
  - Augmentation de `chunkSizeWarningLimit` à 1000 kB
  - Amélioration du cache navigateur (chunks vendors stables)
  - Réduction de l'avertissement "chunks larger than 500 kB"

### Notes

Cette version optimise le build de production en séparant les grosses dépendances dans des chunks distincts. Cela améliore les performances de chargement grâce à un meilleur cache navigateur et à un chargement parallèle des fichiers.

## [0.8.1] - 2026-01-01

### Ajouté

- **Budget Annuel - Budget moyen mensuel**:
  - Affichage du budget moyen mensuel à côté du budget annuel
  - Calcul automatique : total annuel / 12
  - Visible sur les catégories parents et les sous-catégories
  - Aide à visualiser le budget mensuel moyen planifié

### Corrigé

- **Budget Annuel - Sauvegarde des budgets**:
  - Correction de la fonction `saveAllChanges()` qui ne trouvait pas les sous-catégories
  - Le code cherchait uniquement dans les catégories parents lors de la sauvegarde
  - Ajout de la recherche dans les sous-catégories de chaque parent
  - Ajout des imports manquants (`Category`, `CategoryWithSubcategories`)
  - La mise à jour des budgets mensuels fonctionne maintenant correctement

- **Budget Annuel - Calcul du budget parent**:
  - Correction de `calculateParentTotal()` qui utilisait le champ déprécié `monthlyBudgets`
  - Utilisation de `getBudgetForYear()` pour récupérer le bon budget selon l'année sélectionnée
  - Le total des catégories parents se met maintenant à jour correctement lors de modifications

### Notes

Cette version corrige des bugs critiques sur la page Budget Annuel et ajoute l'affichage du budget moyen mensuel. Les totaux des catégories parents se mettent maintenant à jour correctement et les utilisateurs peuvent visualiser facilement le budget mensuel moyen pour chaque catégorie.

## [0.8.0] - 2025-12-31

### Ajouté

- **Budget Annuel - Sélecteur d'année**:
  - Ajout d'un sélecteur pour choisir l'année du budget (par défaut année courante)
  - Plage d'années disponibles : 2 ans dans le passé jusqu'à 5 ans dans le futur
  - Nouveau type `YearlyBudgets` pour stocker les budgets de plusieurs années
  - Helpers `getBudgetForYear()` et `updateBudgetForYear()` pour accès/mise à jour par année
  - Migration automatique depuis `monthlyBudgets` (déprécié) vers `yearlyBudgets`

- **Budget Annuel - Remplissage automatique**:
  - Bouton "Remplir depuis" avec sélecteur de mois de référence
  - Rempli automatiquement tous les mois à 0 avec la valeur du mois choisi
  - Notifications toast pour feedback utilisateur (erreurs, succès, info)
  - Validation : le mois de référence doit avoir une valeur non nulle

### Modifié

- **Amélioration UX mobile**:
  - Ajout de `inputMode="decimal"` sur les inputs de budget pour clavier numérique optimisé
  - Limitation automatique des valeurs à 2 décimales (arrondi)
  - Meilleure gestion des valeurs vides et invalides dans les inputs

- **Architecture des types**:
  - Ajout du champ `yearlyBudgets?: YearlyBudgets` dans `Category`
  - Dépréciation de `monthlyBudgets` (maintenu pour compatibilité rétroactive)
  - Mise à jour de `CategoryInput` pour supporter `yearlyBudgets`

### Corrigé

- **ESLint - Composants créés pendant le render**:
  - Correction de CategoryItem.tsx pour éviter la création de composants pendant le render
  - Utilisation de `React.createElement()` au lieu de stocker le composant dans une variable
  - Résolution de l'erreur `react-hooks/static-components`

### Notes

Cette version transforme la page Budget Annuel en un outil multi-années complet avec remplissage automatique des budgets mensuels et une meilleure expérience utilisateur sur mobile. Les budgets sont maintenant organisés par année, permettant une planification à long terme.

## [0.7.1] - 2025-12-30

### Corrigé

- **Affichage des icônes sur la page Budget Annuel**:
  - Les icônes des catégories et sous-catégories s'affichaient comme du texte brut au lieu de composants React
  - Création de src/lib/iconMap.tsx avec fonction utilitaire getIconComponent()
  - Mise à jour de BudgetAnnuel.tsx pour utiliser les composants d'icônes réels
  - Refactorisation de CategoryItem.tsx pour utiliser l'utilitaire centralisé
  - Suppression de la duplication de code pour la map des icônes

### Modifié

- **Architecture**:
  - Centralisation de la map des icônes dans lib/iconMap.tsx pour réutilisabilité
  - Amélioration de la cohérence du code entre les composants

### Notes

Cette version corrige un bug d'affichage où les noms d'icônes (ex: "IconShoppingCart") étaient rendus comme du texte au lieu des composants React correspondants sur la page Budget Annuel. La solution centralise la logique de conversion des noms d'icônes en composants dans un utilitaire réutilisable.

## [0.7.0] - 2025-12-30

### Ajouté

- **Gestion des budgets annuels**:
  - Page BudgetAnnuel.tsx avec interface accordéon par catégorie parent
  - Type MonthlyBudget pour gérer 12 budgets mensuels par catégorie (janvier à décembre)
  - Fonction helper createEmptyMonthlyBudget() pour initialisation
  - Constante MONTH_NAMES pour affichage des mois en français
  - Composant Accordion shadcn/ui installé
  - Route `/budget-annuel` dans App.tsx
  - Lien "Budget Annuel" dans la sidebar avec icône IconCalculator

- **Fonctionnalités de la page Budget Annuel**:
  - Cartes accordéon pour chaque catégorie parent
  - Affichage automatique des sous-catégories avec leurs budgets mensuels
  - Édition inline des 12 montants mensuels par sous-catégorie (inputs numériques)
  - Calcul automatique du total annuel par sous-catégorie
  - Calcul automatique du budget parent (somme des budgets des enfants)
  - Bouton "Sauvegarder" affiché uniquement lorsqu'il y a des modifications
  - Optimistic updates pour UX fluide
  - Affichage responsive avec grilles adaptatives (2/3/4/6 colonnes selon breakpoint)

### Modifié

- **Types Budget**:
  - Category.budget marqué comme @deprecated (compatibilité rétroactive)
  - Category.monthlyBudgets ajouté (type MonthlyBudget optionnel)
  - CategoryInput.budget marqué comme @deprecated
  - CategoryInput.monthlyBudgets ajouté

- **Services Firestore**:
  - category.service.ts : support de monthlyBudgets dans createCategory
  - Ancien champ budget conservé pour compatibilité rétroactive

- **Navigation**:
  - app-sidebar.tsx : ajout de IconCalculator dans les imports
  - app-sidebar.tsx : nouveau lien "Budget Annuel" placé en 2ème position (après Dashboard)

### Notes

Cette version introduit la gestion complète des budgets annuels avec planification mensuelle. Les utilisateurs peuvent désormais définir des budgets mensuels pour chaque sous-catégorie sur les 12 mois de l'année. Les catégories parents affichent automatiquement la somme des budgets de leurs sous-catégories, assurant une cohérence dans la planification budgétaire. L'interface en accordéon permet une navigation intuitive et une vue d'ensemble claire de la répartition budgétaire annuelle.

## [0.6.0] - 2025-12-30

### Ajouté

- **Optimisations Mobile-First**:
  - Sidebar fermée par défaut sur mobile avec détection automatique
  - Hook useIsMobile() intégré dans App.tsx pour adaptation responsive
  - Breakpoints cohérents (mobile < 640px, tablet 640px+, desktop 1024px+)

### Modifié

- **Layouts responsive**:
  - Espacements réduits sur mobile (py-3 px-3 gap-3) progressifs jusqu'au desktop
  - Grilles adaptatives : 1 colonne (mobile) → 2 colonnes (tablet) → 3 colonnes (desktop)
  - Tous les paddings et gaps optimisés par breakpoint dans toutes les pages

- **Header mobile-friendly**:
  - Titre réduit sur mobile (text-sm) avec taille progressive
  - Description cachée sur très petit écran (< 640px)
  - Texte tronqué pour éviter débordement
  - Padding réduit sur mobile (px-3 → px-4 → px-6)

- **Boutons et zones tactiles**:
  - Boutons d'action full-width sur mobile (w-full sm:w-auto)
  - Taille minimale 44px pour zones tactiles (conformité Apple/Google)
  - Boutons formulaire en colonne sur mobile, en ligne sur desktop
  - Espacement tactile optimal entre boutons (gap-2 minimum)

- **Formulaires optimisés**:
  - LivretManager avec boutons adaptatifs (colonne mobile → ligne desktop)
  - Boutons d'édition/suppression agrandis (h-10 w-10 pour meilleure zone tactile)

- **Pages optimisées**:
  - Home.tsx : grilles et cartes responsive
  - SuiviLivret.tsx : layout mobile-first avec bouton full-width
  - SuiviDepense.tsx : statistiques en colonne sur mobile
  - Settings.tsx : espacements réduits sur mobile

### Notes

Cette version transforme l'application en expérience mobile-first complète. L'interface est maintenant parfaitement utilisable sur smartphone avec des zones tactiles optimales (≥ 44px), des espacements adaptés et une sidebar non intrusive. Les breakpoints cohérents assurent une progression fluide de mobile à desktop.

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
