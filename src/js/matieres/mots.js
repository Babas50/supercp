// Activité Mots.
// Niveau 1 : lire le mot qui correspond à l'image.
// Niveau 2 : écouter un mot et le retrouver écrit.
// Niveau 3 : trouver la voyelle qui manque.

import { entierAleatoire, melanger } from "../aleatoire.js";
import { creerQuestion } from "../moteur/question.js";
import { MOTS } from "../donnees/mots.js";

const VOYELLES = ["a", "e", "i", "o", "u"];

function auHasard(tableau, hasard) {
  return tableau[entierAleatoire(0, tableau.length - 1, hasard)];
}

/**
 * Choisit 3 autres mots. On préfère des mots qui commencent par la même
 * lettre : l'enfant doit lire tout le mot, pas seulement la 1re lettre.
 */
export function motsProches(mot, hasard = Math.random) {
  const autres = MOTS.map((m) => m.mot).filter((m) => m !== mot);
  const memeDebut = melanger(autres.filter((m) => m[0] === mot[0]), hasard);
  const reste = melanger(autres.filter((m) => m[0] !== mot[0]), hasard);
  return [...memeDebut, ...reste].slice(0, 3);
}

/** Positions des voyelles simples (a, e, i, o, u) dans un mot. */
export function positionsVoyelles(mot) {
  return [...mot].flatMap((lettre, i) => (VOYELLES.includes(lettre) ? [i] : []));
}

export function genererMot(niveau, hasard = Math.random) {
  if (niveau === 1) {
    const { mot, image } = auHasard(MOTS, hasard);
    return creerQuestion({
      consigne: "Quel est le bon mot ?",
      enonce: image,
      cle: mot,
      aLire: "Lis les mots. Lequel va avec l'image ?",
      bonneReponse: mot,
      distracteurs: motsProches(mot, hasard),
      hasard,
    });
  }
  if (niveau === 2) {
    const { mot } = auHasard(MOTS, hasard);
    return creerQuestion({
      consigne: "Écoute et trouve le mot",
      enonce: "🔊",
      cle: mot,
      aLire: mot,
      bonneReponse: mot,
      distracteurs: motsProches(mot, hasard),
      hasard,
    });
  }
  if (niveau === 3) {
    // On ne garde que les mots qui ont au moins une voyelle simple.
    const candidats = MOTS.filter(({ mot }) => positionsVoyelles(mot).length > 0);
    const { mot, image } = auHasard(candidats, hasard);
    const position = auHasard(positionsVoyelles(mot), hasard);
    const voyelle = mot[position];
    const aTrous = mot.slice(0, position) + "_" + mot.slice(position + 1);
    return creerQuestion({
      consigne: "Quelle lettre manque ?",
      enonce: `${image} ${aTrous}`,
      cle: aTrous,
      aLire: `Quelle lettre manque dans le mot ${mot} ?`,
      bonneReponse: voyelle,
      distracteurs: melanger(VOYELLES.filter((v) => v !== voyelle), hasard).slice(0, 3),
      hasard,
    });
  }
  throw new Error(`Niveau inconnu : ${niveau}`);
}
