# Super CP

Application d'apprentissage pour les enfants de CP : lettres, chiffres, mots,
phrases, additions, soustractions, anglais, memory, dictée, heure, formes,
jours et mois. Fun, colorée, avec niveaux de difficulté et récompenses.

Elle fonctionne dans un navigateur et sera **installable** sur Android,
iPhone, iPad, tablettes et PC Windows (technologie PWA, ajoutée dans une
prochaine étape).

## Structure du projet

```
supercp/
├── .github/workflows/ci.yml  ← vérification automatique sur GitHub
├── src/                      ← l'application (ce que voit l'enfant)
│   ├── index.html            ← la page
│   ├── styles.css            ← couleurs et mise en page
│   └── js/
│       ├── app.js            ← écran d'accueil
│       └── aleatoire.js      ← hasard et anti-répétition
├── tests/                    ← tests unitaires
├── eslint.config.js          ← règles du linter
├── package.json              ← nom du projet, commandes, dépendances
└── package-lock.json         ← versions exactes des dépendances
```

## Prérequis (Windows 11)

1. Installer **Node.js** version 22 (LTS) depuis https://nodejs.org
2. Installer **Git** depuis https://git-scm.com
3. Vérifier dans un terminal (PowerShell) :
   ```
   node -v
   git --version
   ```

## Commandes

À lancer dans le dossier du projet :

| Commande          | Rôle                                                  |
| ----------------- | ----------------------------------------------------- |
| `npm install`     | télécharge les outils (une seule fois)                |
| `npm run lint`    | vérifie le code avec ESLint                           |
| `npm test`        | lance les tests unitaires                             |
| `npm start`       | ouvre l'application sur http://localhost:3000         |

## Vérification automatique (CI)

À chaque `push` et à chaque pull request, GitHub Actions installe les
dépendances, lance le linter puis les tests. Le résultat apparaît dans
l'onglet **Actions** du dépôt (coche verte = tout va bien, croix rouge =
quelque chose à corriger).

## Données

La progression de l'enfant reste **uniquement sur l'appareil**. Aucune donnée
personnelle n'est envoyée, aucun compte n'est nécessaire.
