// Activité Dictée : on ENTEND un mot (ou une phrase) et on choisit la bonne écriture.
// Niveau 1 : mots courts. Niveau 2 : mots longs. Niveau 3 : phrases.

import { entierAleatoire, melanger } from "../aleatoire.js";
import { creerQuestion } from "../moteur/question.js";
import { MOTS } from "../donnees/mots.js";
import { PHRASES } from "../donnees/phrases.js";

const VOYELLES = "aeiou";

function auHasard(tableau, hasard) {
  return tableau[entierAleatoire(0, tableau.length - 1, hasard)];
}

/**
 * Fabrique des fautes d'orthographe plausibles pour un mot :
 * deux lettres inversées, une voyelle changée, une lettre oubliée.
 * Jamais le mot juste, jamais un autre mot de la liste, jamais en double.
 */
export function fautesPlausibles(mot, combien = 3, hasard = Math.random) {
  const motsConnus = new Set(MOTS.map((m) => m.mot));
  const candidats = new Set();
  const lettres = [...mot];
  // Deux lettres voisines inversées : "chta"
  for (let i = 0; i < lettres.length - 1; i++) {
    if (lettres[i] === lettres[i + 1]) continue;
    const copie = [...lettres];
    [copie[i], copie[i + 1]] = [copie[i + 1], copie[i]];
    candidats.add(copie.join(""));
  }
  // Une voyelle remplacée : "chot"
  lettres.forEach((l, i) => {
    if (!VOYELLES.includes(l)) return;
    for (const v of VOYELLES) {
      if (v !== l) candidats.add(mot.slice(0, i) + v + mot.slice(i + 1));
    }
  });
  // Une lettre oubliée : "cht" (seulement pour les mots de 4 lettres ou plus)
  if (lettres.length >= 4) {
    lettres.forEach((_, i) => candidats.add(mot.slice(0, i) + mot.slice(i + 1)));
  }
  const valides = [...candidats].filter((c) => c !== mot && !motsConnus.has(c));
  return melanger(valides, hasard).slice(0, combien);
}

export function genererDictee(niveau, hasard = Math.random) {
  if (niveau === 1 || niveau === 2) {
    // Niveau 1 : mots de 5 lettres au plus ; niveau 2 : 6 lettres et plus.
    const liste = MOTS.filter(({ mot }) => (niveau === 1 ? mot.length <= 5 : mot.length >= 6));
    const { mot } = auHasard(liste, hasard);
    return creerQuestion({
      consigne: "Écoute et trouve le mot bien écrit",
      enonce: "🔊",
      cle: mot,
      aLire: mot,
      bonneReponse: mot,
      distracteurs: fautesPlausibles(mot, 3, hasard),
      hasard,
    });
  }
  if (niveau === 3) {
    // Une phrase entendue ; dans les mauvaises réponses, un mot est mal écrit.
    const { phrase, trou } = auHasard(PHRASES.filter((p) => p.trou.length >= 3), hasard);
    return creerQuestion({
      consigne: "Écoute et trouve la phrase bien écrite",
      enonce: "🔊",
      cle: phrase,
      aLire: phrase,
      bonneReponse: phrase,
      distracteurs: fautesPlausibles(trou, 3, hasard).map((faute) => phrase.replace(trou, faute)),
      hasard,
    });
  }
  throw new Error(`Niveau inconnu : ${niveau}`);
}
