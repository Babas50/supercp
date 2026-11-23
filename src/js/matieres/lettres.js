// Activité Lettres.
// Niveau 1 : retrouver la même lettre majuscule.
// Niveau 2 : retrouver la minuscule d'une majuscule.
// Niveau 3 : trouver la première lettre d'un mot illustré.

import { entierAleatoire, melanger } from "../aleatoire.js";
import { creerQuestion } from "../moteur/question.js";
import { MOTS } from "../donnees/mots.js";

export const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

// Choisit un élément au hasard dans un tableau.
function auHasard(tableau, hasard) {
  return tableau[entierAleatoire(0, tableau.length - 1, hasard)];
}

// "combien" lettres de l'alphabet, toutes différentes de "sauf".
function autresLettres(sauf, combien, hasard) {
  return melanger(ALPHABET.filter((l) => l !== sauf), hasard).slice(0, combien);
}

// Mots qui commencent par une lettre sans accent (pas de "é" : trop difficile au CP).
const MOTS_SANS_ACCENT_INITIAL = MOTS.filter(({ mot }) => /^[a-z]/.test(mot));

export function genererLettre(niveau, hasard = Math.random) {
  if (niveau === 1) {
    const lettre = auHasard(ALPHABET, hasard);
    return creerQuestion({
      consigne: "Trouve la même lettre",
      enonce: lettre,
      aLire: `Trouve la lettre ${lettre}`,
      bonneReponse: lettre,
      distracteurs: autresLettres(lettre, 3, hasard),
      hasard,
    });
  }
  if (niveau === 2) {
    const lettre = auHasard(ALPHABET, hasard);
    return creerQuestion({
      consigne: "Trouve la même lettre en minuscule",
      enonce: lettre,
      aLire: `Trouve la lettre ${lettre} en minuscule`,
      bonneReponse: lettre.toLowerCase(),
      distracteurs: autresLettres(lettre, 3, hasard).map((l) => l.toLowerCase()),
      hasard,
    });
  }
  if (niveau === 3) {
    const { mot, image } = auHasard(MOTS_SANS_ACCENT_INITIAL, hasard);
    const initiale = mot[0].toUpperCase();
    return creerQuestion({
      consigne: "Par quelle lettre commence ce mot ?",
      enonce: image,
      cle: mot,
      aLire: `Par quelle lettre commence le mot ${mot} ?`,
      bonneReponse: initiale,
      distracteurs: autresLettres(initiale, 3, hasard),
      hasard,
    });
  }
  throw new Error(`Niveau inconnu : ${niveau}`);
}
