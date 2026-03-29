# FCBK FM - Plateforme Média

Ce projet est une plateforme média moderne pour FCBK FM, construite avec React, Vite, Tailwind CSS et Firebase.

## Déploiement sur Vercel

Pour déployer ce projet sur Vercel, suivez ces étapes :

1.  **Exportez le code vers GitHub** depuis le menu "Settings" de AI Studio.
2.  **Connectez votre dépôt GitHub à Vercel**.
3.  **Configurez les variables d'environnement** dans le tableau de bord Vercel. Vous devez copier les valeurs de votre fichier `firebase-applet-config.json` vers ces variables :
    *   `VITE_FIREBASE_API_KEY`
    *   `VITE_FIREBASE_AUTH_DOMAIN`
    *   `VITE_FIREBASE_PROJECT_ID`
    *   `VITE_FIREBASE_STORAGE_BUCKET`
    *   `VITE_FIREBASE_MESSAGING_SENDER_ID`
    *   `VITE_FIREBASE_APP_ID`
    *   `VITE_FIREBASE_DATABASE_ID` (Optionnel, si vous utilisez une base de données nommée)
4.  **Déployez !** Vercel utilisera automatiquement le fichier `vercel.json` pour configurer le routage.

## Développement Local

1.  Installez les dépendances : `npm install`
2.  Lancez le serveur de développement : `npm run dev`
3.  Ouvrez `http://localhost:3000`

## Structure du Projet

*   `src/App.tsx` : Composant principal et routage.
*   `src/lib/firebase.ts` : Configuration et initialisation de Firebase.
*   `src/pages/` : Pages de l'application (Accueil, Article, Admin, etc.).
*   `src/components/` : Composants réutilisables (Navbar, Footer, etc.).
*   `firestore.rules` : Règles de sécurité pour la base de données.
