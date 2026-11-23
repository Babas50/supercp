// Progression de l'enfant : étoiles, niveaux débloqués et stickers gagnés.
// Tout est enregistré UNIQUEMENT sur l'appareil (localStorage du navigateur).
// Comme le moteur de question, ce fichier ne touche pas à l'écran : il est testable.

import { ajouterEtoiles } from "./question.js";

// Nom de la "case" dans laquelle on range les données sur l'appareil.
export const CLE_STOCKAGE = "supercp-progression";

// Nombre de bonnes réponses à un niveau pour débloquer le niveau suivant.
export const SEUIL_DEBLOCAGE = 10;

// Un nouveau sticker tous les ÉTOILES_PAR_STICKER étoiles.
export const ETOILES_PAR_STICKER = 5;

// L'album : des images (emoji) dans l'ordre où on les gagne.
export const STICKERS = [
  "🐶", "🐱", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯",
  "🦁", "🐮", "🐷", "🐸", "🐵", "🐔", "🐧", "🦉",
  "🦄", "🐙", "🦋", "🐢", "🐬", "🦖", "🚀", "🌈",
];

/** Progression d'un enfant qui commence. */
export function etatInitial() {
  return {
    version: 1, // permettra de faire évoluer le format plus tard
    etoiles: 0, // étoiles actuelles (montent et descendent)
    etoilesRecord: 0, // plus haut total atteint (ne descend jamais)
    reussites: {}, // ex. { additions: { 1: 12, 2: 3 } } = bonnes réponses par niveau
  };
}

/**
 * Lit la progression enregistrée.
 * "stockage" est window.localStorage dans l'appli, un faux stockage dans les tests.
 * Si les données sont absentes ou abîmées, on repart de zéro sans planter.
 */
export function charger(stockage) {
  try {
    const texte = stockage.getItem(CLE_STOCKAGE);
    if (!texte) return etatInitial();
    const donnees = JSON.parse(texte); // JSON : format texte pour ranger des objets
    if (donnees?.version !== 1) return etatInitial();
    return { ...etatInitial(), ...donnees };
  } catch {
    return etatInitial();
  }
}

/** Enregistre la progression (sans planter si le stockage est plein ou interdit). */
export function sauvegarder(stockage, etat) {
  try {
    stockage.setItem(CLE_STOCKAGE, JSON.stringify(etat));
  } catch {
    // Navigation privée ou stockage plein : le jeu continue, sans sauvegarde.
  }
}

/** Nombre de bonnes réponses d'une matière à un niveau. */
export function reussitesNiveau(etat, matiere, niveau) {
  return etat.reussites[matiere]?.[niveau] ?? 0;
}

/** Le niveau 1 est toujours ouvert ; les autres demandent des réussites au niveau d'avant. */
export function niveauDebloque(etat, matiere, niveau) {
  if (niveau <= 1) return true;
  return reussitesNiveau(etat, matiere, niveau - 1) >= SEUIL_DEBLOCAGE;
}

/** Combien de bonnes réponses manquent pour débloquer ce niveau. */
export function reussitesManquantes(etat, matiere, niveau) {
  if (niveau <= 1) return 0;
  return Math.max(0, SEUIL_DEBLOCAGE - reussitesNiveau(etat, matiere, niveau - 1));
}

/** Les stickers déjà gagnés (ils restent gagnés même si les étoiles baissent). */
export function stickersGagnes(etat) {
  const nombre = Math.floor(etat.etoilesRecord / ETOILES_PAR_STICKER);
  return STICKERS.slice(0, nombre);
}

/**
 * Enregistre le résultat d'une réponse et dit ce qui vient d'être gagné.
 * Renvoie { etat, nouveauSticker, niveauDebloque } :
 * - etat : la nouvelle progression (l'ancienne n'est pas modifiée)
 * - nouveauSticker : l'emoji gagné, ou null
 * - niveauDebloque : le numéro du niveau qui vient de s'ouvrir, ou null
 */
export function enregistrerResultat(etat, matiere, niveau, resultat, niveauMax = 3) {
  const stickersAvant = stickersGagnes(etat).length;
  const niveauSuivantAvant = niveauDebloque(etat, matiere, niveau + 1);

  const etoiles = ajouterEtoiles(etat.etoiles, resultat.etoiles);
  // Copie de l'objet "reussites" pour ne pas modifier l'ancien état.
  const reussites = { ...etat.reussites, [matiere]: { ...etat.reussites[matiere] } };
  if (resultat.type === "bonne") {
    reussites[matiere][niveau] = reussitesNiveau(etat, matiere, niveau) + 1;
  }

  const nouvelEtat = {
    ...etat,
    etoiles,
    etoilesRecord: Math.max(etat.etoilesRecord, etoiles),
    reussites,
  };

  const stickers = stickersGagnes(nouvelEtat);
  const vientDOuvrir =
    niveau < niveauMax && !niveauSuivantAvant && niveauDebloque(nouvelEtat, matiere, niveau + 1);

  return {
    etat: nouvelEtat,
    nouveauSticker: stickers.length > stickersAvant ? stickers[stickers.length - 1] : null,
    niveauDebloque: vientDOuvrir ? niveau + 1 : null,
  };
}

/**
 * Efface toute la progression (étoiles, niveaux, stickers) et renvoie un état neuf.
 * L'information "appli installée" n'est pas touchée : elle est rangée ailleurs.
 */
export function reinitialiser(stockage) {
  try {
    stockage.removeItem(CLE_STOCKAGE);
  } catch {
    // Stockage interdit : rien à effacer.
  }
  return etatInitial();
}

/**
 * Question de calcul pour adulte (tables de 6 à 9), qui protège l'effacement :
 * un enfant de CP ne peut pas y répondre par hasard.
 */
export function questionParent(hasard = Math.random) {
  const a = 6 + Math.floor(hasard() * 4);
  const b = 6 + Math.floor(hasard() * 4);
  return { texte: `${a} × ${b}`, reponse: a * b };
}

/** Vérifie la réponse tapée (espaces tolérés). */
export function reponseParentJuste(question, saisie) {
  return String(saisie).trim() === String(question.reponse);
}
