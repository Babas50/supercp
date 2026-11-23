// Activité Chiffres.
// Niveau 1 : compter jusqu'à 5 objets.
// Niveau 2 : compter jusqu'à 10 objets.
// Niveau 3 : trouver le nombre qui vient après (jusqu'à 20).

import { entierAleatoire } from "../aleatoire.js";
import { creerQuestion } from "../moteur/question.js";
import { distracteursProches } from "./calcul.js";
import { OBJETS_A_COMPTER } from "../donnees/mots.js";

function compter(max, hasard) {
  const nombre = entierAleatoire(1, max, hasard);
  const objet = OBJETS_A_COMPTER[entierAleatoire(0, OBJETS_A_COMPTER.length - 1, hasard)];
  // Distracteurs entre 1 et max (pas 0 : il y a toujours au moins un objet).
  const distracteurs = distracteursProches(nombre, max, 3, hasard, 1);
  return creerQuestion({
    consigne: "Combien y en a-t-il ?",
    enonce: objet.repeat(nombre), // "repeat" répète l'emoji : 🍎🍎🍎
    cle: `${objet}${nombre}`,
    aLire: "Compte. Combien y en a-t-il ?",
    bonneReponse: nombre,
    distracteurs,
    hasard,
  });
}

export function genererChiffre(niveau, hasard = Math.random) {
  if (niveau === 1) return compter(5, hasard);
  if (niveau === 2) return compter(10, hasard);
  if (niveau === 3) {
    const n = entierAleatoire(0, 19, hasard);
    return creerQuestion({
      consigne: "Quel nombre vient après ?",
      enonce: `${n} ➜ ?`,
      aLire: `Quel nombre vient après ${n} ?`,
      bonneReponse: n + 1,
      distracteurs: distracteursProches(n + 1, 20, 3, hasard),
      hasard,
    });
  }
  throw new Error(`Niveau inconnu : ${niveau}`);
}
