// Activité Jours et mois.
// Niveau 1 : le jour qui vient après. Niveau 2 : le mois qui vient après.
// Niveau 3 : le jour ou le mois qui vient AVANT.

import { entierAleatoire, melanger } from "../aleatoire.js";
import { creerQuestion } from "../moteur/question.js";

export const JOURS = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"];
export const MOIS = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre",
];

function question(liste, sens, hasard) {
  const i = entierAleatoire(0, liste.length - 1, hasard);
  const decalage = sens === "après" ? 1 : -1;
  // "%" fait le tour : après dimanche vient lundi, avant janvier vient décembre.
  const bonne = liste[(i + decalage + liste.length) % liste.length];
  const type = liste === JOURS ? "jour" : "mois";
  const autres = melanger(liste.filter((x) => x !== bonne && x !== liste[i]), hasard).slice(0, 3);
  return creerQuestion({
    consigne: `Quel ${type} vient ${sens} ?`,
    enonce: sens === "après" ? `${liste[i]} ➜ ?` : `? ➜ ${liste[i]}`,
    cle: `${sens}-${liste[i]}`,
    aLire: `Quel ${type} vient ${sens} ${liste[i]} ?`,
    bonneReponse: bonne,
    distracteurs: autres,
    hasard,
  });
}

export function genererCalendrier(niveau, hasard = Math.random) {
  if (niveau === 1) return question(JOURS, "après", hasard);
  if (niveau === 2) return question(MOIS, "après", hasard);
  if (niveau === 3) {
    return question(hasard() < 0.5 ? JOURS : MOIS, "avant", hasard);
  }
  throw new Error(`Niveau inconnu : ${niveau}`);
}
