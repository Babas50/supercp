// Activité Phrases.
// Niveau 1 : trouver le mot qui manque dans la phrase.
// Niveau 2 : trouver la phrase qui va avec l'image.
// Niveau 3 : trouver la phrase dont les mots sont dans le bon ordre.

import { entierAleatoire, melanger } from "../aleatoire.js";
import { creerQuestion } from "../moteur/question.js";
import { PHRASES } from "../donnees/phrases.js";

function auHasard(tableau, hasard) {
  return tableau[entierAleatoire(0, tableau.length - 1, hasard)];
}

/** 3 éléments au hasard d'une liste, en excluant "sauf". */
function troisAutres(liste, sauf, hasard) {
  return melanger(liste.filter((x) => x !== sauf), hasard).slice(0, 3);
}

/**
 * Fabrique des versions mélangées d'une phrase ("chat Le dort.").
 * Le point reste à la fin, la majuscule reste sur le même mot :
 * l'enfant doit vraiment regarder l'ordre des mots.
 */
export function phrasesMelangees(phrase, combien = 3, hasard = Math.random) {
  const mots = phrase.replace(/\.$/, "").split(" ");
  const resultat = new Set();
  for (let essai = 0; essai < 200 && resultat.size < combien; essai++) {
    const version = melanger(mots, hasard).join(" ") + ".";
    if (version !== phrase) resultat.add(version);
  }
  return [...resultat];
}

export function genererPhrase(niveau, hasard = Math.random) {
  const { phrase, image, trou } = auHasard(PHRASES, hasard);
  if (niveau === 1) {
    return creerQuestion({
      consigne: "Quel mot manque ?",
      enonce: `${image} ${phrase.replace(trou, "___")}`,
      cle: phrase,
      aLire: "Lis la phrase. Quel mot manque ?",
      bonneReponse: trou,
      distracteurs: troisAutres(PHRASES.map((p) => p.trou), trou, hasard),
      hasard,
    });
  }
  if (niveau === 2) {
    return creerQuestion({
      consigne: "Quelle phrase va avec l'image ?",
      enonce: image,
      cle: phrase,
      aLire: "Lis les phrases. Laquelle va avec l'image ?",
      bonneReponse: phrase,
      distracteurs: troisAutres(PHRASES.map((p) => p.phrase), phrase, hasard),
      hasard,
    });
  }
  if (niveau === 3) {
    // Il faut au moins 3 mots pour fabriquer 3 mauvais ordres différents.
    const { phrase, image } = auHasard(PHRASES.filter((p) => p.phrase.split(" ").length >= 3), hasard);
    return creerQuestion({
      consigne: "Quelle phrase est bien écrite ?",
      enonce: image,
      cle: phrase,
      aLire: "Quelle phrase a les mots dans le bon ordre ?",
      bonneReponse: phrase,
      distracteurs: phrasesMelangees(phrase, 3, hasard),
      hasard,
    });
  }
  throw new Error(`Niveau inconnu : ${niveau}`);
}
