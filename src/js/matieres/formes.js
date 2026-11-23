// Activité Formes.
// Niveau 1 : reconnaître cercle, carré, triangle, rectangle.
// Niveau 2 : ajouter losange et ovale.
// Niveau 3 : compter une forme parmi d'autres.

import { entierAleatoire, melanger } from "../aleatoire.js";
import { creerQuestion } from "../moteur/question.js";
import { distracteursProches } from "./calcul.js";

// Chaque forme : son nom et son dessin SVG (dans un carré de 100 x 100).
export const FORMES = {
  cercle: '<circle cx="50" cy="50" r="40" fill="#e74c3c"/>',
  carré: '<rect x="12" y="12" width="76" height="76" fill="#3498db"/>',
  triangle: '<polygon points="50,8 92,88 8,88" fill="#2ecc71"/>',
  rectangle: '<rect x="4" y="25" width="92" height="50" fill="#f39c12"/>',
  losange: '<polygon points="50,4 90,50 50,96 10,50" fill="#9b59b6"/>',
  ovale: '<ellipse cx="50" cy="50" rx="45" ry="28" fill="#e84393"/>',
};

const FORMES_PAR_NIVEAU = {
  1: ["cercle", "carré", "triangle", "rectangle"],
  2: ["cercle", "carré", "triangle", "rectangle", "losange", "ovale"],
};

// Formes en emoji pour le comptage (niveau 3).
const EMOJI_FORMES = { "🔺": "triangles", "🟦": "carrés", "🔴": "ronds" };

export function dessinForme(nom) {
  return `<svg class="forme" viewBox="0 0 100 100" role="img" aria-label="Forme">${FORMES[nom]}</svg>`;
}

export function genererForme(niveau, hasard = Math.random) {
  if (niveau === 1 || niveau === 2) {
    const noms = FORMES_PAR_NIVEAU[niveau];
    const nom = noms[entierAleatoire(0, noms.length - 1, hasard)];
    return creerQuestion({
      consigne: "Comment s'appelle cette forme ?",
      enonce: "",
      cle: nom,
      illustration: dessinForme(nom),
      aLire: "Comment s'appelle cette forme ?",
      bonneReponse: nom,
      distracteurs: melanger(noms.filter((n) => n !== nom), hasard).slice(0, 3),
      hasard,
    });
  }
  if (niveau === 3) {
    const emojis = Object.keys(EMOJI_FORMES);
    const cible = emojis[entierAleatoire(0, emojis.length - 1, hasard)];
    const nombre = entierAleatoire(1, 6, hasard);
    // On mélange les formes à compter avec 3 à 5 autres formes.
    const autres = emojis.filter((e) => e !== cible);
    const intrus = Array.from({ length: entierAleatoire(3, 5, hasard) }, () =>
      autres[entierAleatoire(0, autres.length - 1, hasard)],
    );
    const melange = melanger([...Array(nombre).fill(cible), ...intrus], hasard).join("");
    return creerQuestion({
      consigne: `Combien de ${cible} ?`,
      enonce: melange,
      cle: `${cible}${nombre}`,
      aLire: `Combien de ${EMOJI_FORMES[cible]} ?`,
      bonneReponse: nombre,
      distracteurs: distracteursProches(nombre, 8, 3, hasard, 1),
      hasard,
    });
  }
  throw new Error(`Niveau inconnu : ${niveau}`);
}
