// Activité Anglais : on ENTEND un mot anglais et on touche l'image.
// Niveau 1 : les couleurs. Niveau 2 : les animaux. Niveau 3 : les nombres de 0 à 10.

import { entierAleatoire, melanger } from "../aleatoire.js";
import { creerQuestion } from "../moteur/question.js";
import { COULEURS, ANIMAUX, NOMBRES } from "../donnees/anglais.js";

export const LANGUE_ANGLAIS = "en-GB";

function questionImage(liste, consigne, hasard) {
  const { mot, image } = liste[entierAleatoire(0, liste.length - 1, hasard)];
  const autres = melanger(liste.filter((x) => x.mot !== mot), hasard).slice(0, 3);
  return creerQuestion({
    consigne,
    enonce: "🔊",
    cle: mot,
    aLire: mot,
    langue: LANGUE_ANGLAIS,
    bonneReponse: image,
    distracteurs: autres.map((x) => x.image),
    hasard,
  });
}

export function genererAnglais(niveau, hasard = Math.random) {
  if (niveau === 1) return questionImage(COULEURS, "Écoute et touche la couleur", hasard);
  if (niveau === 2) return questionImage(ANIMAUX, "Écoute et touche l'animal", hasard);
  if (niveau === 3) {
    const n = entierAleatoire(0, 10, hasard);
    const autres = melanger([...Array(11).keys()].filter((x) => x !== n), hasard).slice(0, 3);
    return creerQuestion({
      consigne: "Écoute et touche le nombre",
      enonce: "🔊",
      cle: NOMBRES[n],
      aLire: NOMBRES[n],
      langue: LANGUE_ANGLAIS,
      bonneReponse: n,
      distracteurs: autres,
      hasard,
    });
  }
  throw new Error(`Niveau inconnu : ${niveau}`);
}
