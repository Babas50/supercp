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
│       ├── app.js            ← écrans et déroulement du jeu
│       ├── aleatoire.js      ← hasard et anti-répétition
│       ├── voix.js           ← lecture à voix haute
│       ├── son.js            ← sons de réussite et d'erreur
│       ├── moteur/
│       │   ├── question.js   ← règles d'une question et anti-triche
│       │   └── progression.js← étoiles, niveaux, stickers, sauvegarde
│       └── matieres/
│           └── calcul.js     ← additions et soustractions
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

## Règles du jeu (anti-triche)

- Bonne réponse : +1 étoile, son joyeux, animation.
- Mauvaise réponse : -1 étoile (jamais sous zéro), message doux, la réponse
  cliquée est grisée.
- Après une erreur, tous les boutons sont bloqués 1 seconde.
- Après 2 erreurs, la bonne réponse est montrée, sans étoile.
- La bonne réponse change de place à chaque question.
- Jamais deux fois la même question de suite, jamais deux réponses identiques.

## Progression et récompenses

- 3 niveaux par matière. Le niveau 1 est ouvert ; le niveau suivant s'ouvre
  après 10 bonnes réponses au niveau d'avant.
- Un sticker pour l'album toutes les 5 étoiles. Un sticker gagné n'est
  jamais perdu.

## Vérification automatique (CI)

À chaque `push` et à chaque pull request, GitHub Actions installe les
dépendances, lance le linter puis les tests. Le résultat apparaît dans
l'onglet **Actions** du dépôt (coche verte = tout va bien, croix rouge =
quelque chose à corriger).

## Données

La progression de l'enfant reste **uniquement sur l'appareil**. Aucune donnée
personnelle n'est envoyée, aucun compte n'est nécessaire.
