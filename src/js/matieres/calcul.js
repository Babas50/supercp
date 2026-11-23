// Générateur de questions d'additions et de soustractions.
// Niveau 1 : résultats jusqu'à 5, niveau 2 : jusqu'à 10, niveau 3 : jusqu'à 20.

import { entierAleatoire } from "../aleatoire.js";
import { creerQuestion } from "../moteur/question.js";

export const MAX_PAR_NIVEAU = { 1: 5, 2: 10, 3: 20 };

/** Renvoie le plus grand nombre autorisé pour un niveau (erreur si niveau inconnu). */
function maxDuNiveau(niveau) {
  const max = MAX_PAR_NIVEAU[niveau];
  if (max === undefined) throw new Error(`Niveau inconnu : ${niveau}`);
  return max;
}

/**
 * Fabrique "combien" mauvaises réponses proches de la bonne
 * (les erreurs crédibles sont à 1 ou 2 près), comprises entre 0 et max.
 */
export function distracteursProches(bonne, max, combien = 3, hasard = Math.random) {
  const resultat = new Set();
  let ecart = 1;
  // On essaie bonne+1, bonne-1, bonne+2, bonne-2... dans un ordre un peu mélangé.
  while (resultat.size < combien && ecart <= max + 1) {
    const candidats = hasard() < 0.5 ? [bonne + ecart, bonne - ecart] : [bonne - ecart, bonne + ecart];
    for (const c of candidats) {
      if (c >= 0 && c <= max && c !== bonne && resultat.size < combien) resultat.add(c);
    }
    ecart += 1;
  }
  return [...resultat];
}

/** Crée une addition dont le résultat ne dépasse pas le maximum du niveau. */
export function genererAddition(niveau, hasard = Math.random) {
  const max = maxDuNiveau(niveau);
  const somme = entierAleatoire(1, max, hasard);
  const a = entierAleatoire(0, somme, hasard);
  const b = somme - a;
  return creerQuestion({
    enonce: `${a} + ${b} = ?`,
    aLire: `Combien font ${a} plus ${b} ?`,
    bonneReponse: somme,
    distracteurs: distracteursProches(somme, max, 3, hasard),
    hasard,
  });
}

/** Crée une soustraction dont le résultat n'est jamais négatif. */
export function genererSoustraction(niveau, hasard = Math.random) {
  const max = maxDuNiveau(niveau);
  const a = entierAleatoire(1, max, hasard);
  const b = entierAleatoire(0, a, hasard); // b ≤ a, donc a - b ≥ 0
  const difference = a - b;
  return creerQuestion({
    enonce: `${a} − ${b} = ?`,
    aLire: `Combien font ${a} moins ${b} ?`,
    bonneReponse: difference,
    distracteurs: distracteursProches(difference, max, 3, hasard),
    hasard,
  });
}
