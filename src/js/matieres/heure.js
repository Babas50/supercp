// Activité L'heure : lire une horloge à aiguilles.
// Niveau 1 : heures pile (3 h). Niveau 2 : et demie (3 h 30). Niveau 3 : quarts (3 h 15, 3 h 45).

import { entierAleatoire, melanger } from "../aleatoire.js";
import { creerQuestion } from "../moteur/question.js";

export const MINUTES_PAR_NIVEAU = { 1: [0], 2: [0, 30], 3: [0, 15, 30, 45] };

/** Écrit une heure comme à l'école : "3 h", "3 h 30". */
export function ecrireHeure(h, m) {
  return m === 0 ? `${h} h` : `${h} h ${m}`;
}

/** Angles des aiguilles en degrés (0 = midi, sens des aiguilles d'une montre). */
export function anglesAiguilles(h, m) {
  return {
    heures: (h % 12) * 30 + m * 0.5, // 360° / 12 heures = 30° par heure
    minutes: m * 6, // 360° / 60 minutes = 6° par minute
  };
}

/** Dessine une horloge en SVG (image vectorielle : nette sur tous les écrans). */
export function horlogeSVG(h, m) {
  const { heures, minutes } = anglesAiguilles(h, m);
  const chiffres = [];
  for (let n = 1; n <= 12; n++) {
    const angle = (n * 30 * Math.PI) / 180;
    const x = 100 + 72 * Math.sin(angle);
    const y = 100 - 72 * Math.cos(angle) + 7; // +7 : centre le texte verticalement
    chiffres.push(`<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="middle" font-size="20" font-weight="bold" fill="#2d2a32">${n}</text>`);
  }
  return `<svg class="horloge" viewBox="0 0 200 200" role="img" aria-label="Horloge">
  <circle cx="100" cy="100" r="95" fill="#fff" stroke="#ff7a59" stroke-width="8"/>
  ${chiffres.join("\n  ")}
  <line x1="100" y1="100" x2="100" y2="62" stroke="#2d2a32" stroke-width="9" stroke-linecap="round" transform="rotate(${heures} 100 100)"/>
  <line x1="100" y1="100" x2="100" y2="42" stroke="#3498db" stroke-width="5" stroke-linecap="round" transform="rotate(${minutes} 100 100)"/>
  <circle cx="100" cy="100" r="6" fill="#2d2a32"/>
</svg>`;
}

export function genererHeure(niveau, hasard = Math.random) {
  const minutesPossibles = MINUTES_PAR_NIVEAU[niveau];
  if (!minutesPossibles) throw new Error(`Niveau inconnu : ${niveau}`);
  const h = entierAleatoire(1, 12, hasard);
  const m = minutesPossibles[entierAleatoire(0, minutesPossibles.length - 1, hasard)];
  const bonne = ecrireHeure(h, m);

  // Mauvaises réponses : l'heure d'à côté, et (si possible) d'autres minutes.
  const candidats = new Set();
  const voisine = (x) => ((x + 11) % 12) + 1; // 12 -> 1, 1 -> 2...
  const precedente = (x) => ((x + 10) % 12) + 1; // 1 -> 12
  for (const autreH of [voisine(h), precedente(h)]) candidats.add(ecrireHeure(autreH, m));
  for (const autreM of minutesPossibles) if (autreM !== m) candidats.add(ecrireHeure(h, autreM));
  // Compléter avec des heures au hasard si besoin.
  while (candidats.size < 6) {
    candidats.add(ecrireHeure(entierAleatoire(1, 12, hasard), m));
  }
  candidats.delete(bonne);

  return creerQuestion({
    consigne: "Quelle heure est-il ?",
    enonce: "",
    cle: bonne,
    illustration: horlogeSVG(h, m),
    aLire: "Quelle heure est-il ?",
    bonneReponse: bonne,
    distracteurs: melanger([...candidats], hasard).slice(0, 3),
    hasard,
  });
}
