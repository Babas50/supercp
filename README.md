# Super CP

Application d'apprentissage pour les enfants de CP : lettres, chiffres, mots,
phrases, additions, soustractions, anglais, memory, dictée, heure, formes,
jours et mois. Fun, colorée, avec niveaux de difficulté et récompenses.

Elle fonctionne dans un navigateur et s'**installe** sur Android, iPhone,
iPad, tablettes et PC Windows (technologie PWA), puis marche sans connexion.

Adresse : **https://babas50.github.io/supercp/**

## Structure du projet

```
supercp/
├── .github/workflows/
│   ├── ci.yml                ← vérification automatique sur GitHub
│   └── deploy.yml            ← publication sur GitHub Pages
├── src/                      ← l'application (ce que voit l'enfant)
│   ├── index.html            ← la page
│   ├── styles.css            ← couleurs et mise en page
│   ├── manifest.webmanifest  ← nom, icônes, couleurs pour l'installation
│   ├── sw.js                 ← service worker (fonctionnement hors connexion)
│   ├── icones/               ← icônes de l'appli
│   └── js/
│       ├── app.js            ← écrans et déroulement du jeu
│       ├── aleatoire.js      ← hasard et anti-répétition
│       ├── voix.js           ← lecture à voix haute
│       ├── son.js            ← sons de réussite et d'erreur
│       ├── installation.js   ← bouton Installer et guide iPhone/iPad
│       ├── moteur/
│       │   ├── question.js   ← règles d'une question et anti-triche
│       │   ├── memory.js     ← règles du memory
│       │   └── progression.js← étoiles, niveaux, stickers, sauvegarde
│       ├── donnees/
│       │   ├── mots.js       ← liste des mots et images (à relire)
│       │   ├── phrases.js    ← phrases et images (à relire)
│       │   └── anglais.js    ← vocabulaire anglais (à relire)
│       └── matieres/
│           ├── calcul.js     ← additions et soustractions
│           ├── lettres.js    ← lettres
│           ├── chiffres.js   ← compter, nombre suivant
│           ├── mots.js       ← lire et écouter des mots
│           ├── phrases.js    ← mot manquant, phrase de l'image, ordre des mots
│           ├── anglais.js    ← couleurs, animaux, nombres (voix anglaise)
│           ├── dictee.js     ← mot ou phrase entendus, bonne orthographe
│           ├── heure.js      ← horloge à aiguilles
│           ├── formes.js     ← reconnaître et compter des formes
│           └── calendrier.js ← jours de la semaine et mois
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

## Installer l'appli

- **Android, PC Windows (Chrome ou Edge)** : bouton « 📲 Installer l'appli »
  sur l'accueil, ou icône d'installation dans la barre d'adresse.
- **iPhone, iPad** : ouvrir l'adresse dans **Safari**, bouton Partager,
  puis « Sur l'écran d'accueil ». Le bouton de l'appli affiche ce guide.

Si le bouton « Installer » apparaît alors que l'appli est déjà installée
(le navigateur ne peut pas toujours le savoir), toucher « C'est fait, ne
plus afficher » sous le guide.

## Voix

L'appli utilise la synthèse vocale de l'appareil et choisit la meilleure voix
installée. Le bouton « 🔊 Écouter » relit plus lentement. Pour une voix
anglaise plus claire sur Android : Paramètres → Accessibilité (ou Système)
→ Synthèse vocale → moteur « Services vocaux Google » → télécharger une voix
anglaise (Royaume-Uni).

## Espace parents

En bas de « Mon album » : « ⚙️ Espace parents » permet d'effacer toute la
progression (étoiles, stickers, niveaux). Une multiplication est demandée
pour confirmer, afin qu'un enfant ne puisse pas tout effacer par accident.

## Publier une nouvelle version

1. Fusionner la pull request dans `main` : le workflow **Publication**
   vérifie le code puis met l'appli en ligne (2 minutes environ).
2. **Important** : dans `src/sw.js`, augmenter le numéro `VERSION`
   (`supercp-v1` → `supercp-v2`) quand des fichiers de l'appli changent,
   sinon les appareils garderont l'ancienne version.
3. Si la publication échoue quand même (croix rouge dans **Actions** >
   **Publication**) : bouton **Run workflow** sur la branche `main`.
   Éviter « Re-run failed jobs », qui peut créer un paquet en double.

## Vérification automatique (CI)

À chaque `push` et à chaque pull request, GitHub Actions installe les
dépendances, lance le linter puis les tests. Le résultat apparaît dans
l'onglet **Actions** du dépôt (coche verte = tout va bien, croix rouge =
quelque chose à corriger).

## Données

La progression de l'enfant reste **uniquement sur l'appareil**. Aucune donnée
personnelle n'est envoyée, aucun compte n'est nécessaire.
