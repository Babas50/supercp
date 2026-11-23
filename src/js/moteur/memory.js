// Règles du jeu de memory : retrouver les paires de cartes identiques.
// Comme les autres moteurs, ce fichier ne touche pas à l'écran : il est testable.

import { melanger } from "../aleatoire.js";
import { DELAI_BLOCAGE_MS } from "./question.js";

// Nombre de paires selon le niveau : 6, 12 puis 16 cartes.
export const PAIRES_PAR_NIVEAU = { 1: 3, 2: 6, 3: 8 };

export const IMAGES_MEMORY = [
  "🐶", "🐱", "🐰", "🦊", "🐻", "🐼", "🐸", "🐵",
  "🦁", "🐮", "🐷", "🐙", "🦋", "🐢", "🦄", "🐧",
];

/** Crée une partie : chaque image apparaît deux fois, cartes mélangées. */
export function creerPartie(niveau, hasard = Math.random) {
  const nombre = PAIRES_PAR_NIVEAU[niveau];
  if (nombre === undefined) throw new Error(`Niveau inconnu : ${niveau}`);
  const images = melanger(IMAGES_MEMORY, hasard).slice(0, nombre);
  return {
    cartes: melanger([...images, ...images], hasard).map((image) => ({
      image,
      visible: false, // face visible ?
      trouvee: false, // paire déjà trouvée ?
    })),
    selection: [], // positions des cartes retournées en attente (0, 1 ou 2)
    bloqueeJusqua: 0,
    coups: 0, // nombre d'essais (paires de cartes retournées)
  };
}

/** Retourne face cachée les deux cartes d'une paire ratée. */
export function cacherRatees(partie) {
  if (partie.selection.length === 2) {
    for (const i of partie.selection) partie.cartes[i].visible = false;
    partie.selection = [];
  }
}

export function partieFinie(partie) {
  return partie.cartes.every((c) => c.trouvee);
}

/**
 * L'enfant touche une carte. Renvoie { type, etoiles } :
 * - "ignore"   : clic refusé (carte déjà visible ou trouvée, attente après un raté,
 *                position inconnue, partie finie)
 * - "premiere" : 1re carte retournée
 * - "paire"    : 2e carte identique, +1 étoile
 * - "ratee"    : 2e carte différente ; les deux restent visibles 1 seconde
 * - "finie"    : dernière paire trouvée, +1 étoile
 *
 * Choix : une paire ratée ne coûte pas d'étoile (au memory, se tromper fait
 * partie du jeu), mais les clics sont bloqués 1 seconde.
 */
export function toucherCarte(partie, position, maintenant = Date.now()) {
  const ignore = { type: "ignore", etoiles: 0 };
  const carte = partie.cartes[position];
  if (!carte || partieFinie(partie)) return ignore;
  if (maintenant < partie.bloqueeJusqua) return ignore;

  // Le délai est passé : on recache la paire ratée précédente.
  cacherRatees(partie);
  if (carte.visible || carte.trouvee) return ignore;

  carte.visible = true;
  partie.selection.push(position);
  if (partie.selection.length === 1) return { type: "premiere", etoiles: 0 };

  partie.coups += 1;
  const [a, b] = partie.selection.map((i) => partie.cartes[i]);
  if (a.image === b.image) {
    a.trouvee = true;
    b.trouvee = true;
    partie.selection = [];
    return { type: partieFinie(partie) ? "finie" : "paire", etoiles: 1 };
  }
  partie.bloqueeJusqua = maintenant + DELAI_BLOCAGE_MS;
  return { type: "ratee", etoiles: 0 };
}
