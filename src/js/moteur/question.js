// Moteur d'une question à choix multiples, avec les règles anti-triche.
// Ce fichier ne touche pas à l'écran : il ne fait que des calculs,
// ce qui permet de le tester entièrement avec des tests unitaires.

import { melanger } from "../aleatoire.js";

// Après une erreur, tous les boutons sont bloqués pendant ce temps (en millisecondes).
// Empêche de cliquer très vite sur toutes les réponses.
export const DELAI_BLOCAGE_MS = 1000;

// Au bout de ce nombre d'erreurs, on montre la bonne réponse, sans étoile gagnée.
export const ERREURS_MAX = 2;

/**
 * Crée une question.
 * - enonce : le texte affiché (ex. "3 + 4")
 * - aLire : le texte lu à voix haute (par défaut, l'énoncé)
 * - illustration : dessin SVG affiché sous l'énoncé (horloge, formes), facultatif
 * - dessins : facultatif, associe à une réponse le dessin SVG à montrer sur son bouton
 *             à la place du texte (ex. { orange: "<svg>…</svg>" } pour les couleurs)
 * - langue : langue de la voix ("fr-FR" par défaut, "en-GB" pour l'anglais)
 * - consigne : petite phrase affichée au-dessus (ex. "Combien y en a-t-il ?")
 * - cle : ce qui identifie la question pour éviter les répétitions
 *         (par défaut, l'énoncé ; utile quand l'énoncé est juste "🔊")
 * - bonneReponse : la réponse attendue
 * - distracteurs : les mauvaises réponses proposées
 *
 * Les doublons sont supprimés : l'enfant ne voit jamais deux boutons identiques.
 */
export function creerQuestion({
  enonce,
  aLire = enonce,
  consigne = "",
  cle = enonce,
  langue = "fr-FR",
  illustration = "",
  dessins = null,
  bonneReponse,
  distracteurs,
  hasard = Math.random,
}) {
  // On compare les réponses sous forme de texte : 7 et "7" sont la même réponse.
  const texte = (valeur) => String(valeur);
  const dejaVues = new Set([texte(bonneReponse)]);
  const mauvaises = [];
  for (const d of distracteurs) {
    if (!dejaVues.has(texte(d))) {
      dejaVues.add(texte(d));
      mauvaises.push(d);
    }
  }
  if (mauvaises.length === 0) {
    throw new Error(`Question "${enonce}" : il faut au moins une mauvaise réponse différente.`);
  }

  return {
    enonce,
    aLire,
    consigne,
    cle,
    langue,
    illustration,
    dessins,
    bonneReponse,
    // Mélange : la bonne réponse n'est jamais toujours à la même place.
    choix: melanger([bonneReponse, ...mauvaises], hasard),
    desactives: new Set(), // réponses fausses déjà cliquées
    erreurs: 0,
    terminee: false,
    bloqueeJusqua: 0, // instant (en ms) jusqu'auquel les clics sont ignorés
  };
}

/** Vrai si les boutons sont momentanément bloqués après une erreur. */
export function estBloquee(question, maintenant = Date.now()) {
  return maintenant < question.bloqueeJusqua;
}

/**
 * Traite un clic de l'enfant sur une réponse.
 * Renvoie un objet { type, etoiles } :
 * - type "bonne"    : bonne réponse, etoiles = +1
 * - type "mauvaise" : erreur, etoiles = -1, la réponse est désactivée
 * - type "revelee"  : 2e erreur, etoiles = -1, la question est finie
 * - type "ignore"   : clic refusé (question finie, boutons bloqués,
 *                     réponse déjà désactivée ou inconnue), etoiles = 0
 *
 * "maintenant" est passé en paramètre pour que les tests contrôlent le temps.
 */
export function repondre(question, reponse, maintenant = Date.now()) {
  const ignore = { type: "ignore", etoiles: 0 };
  const cle = String(reponse);

  if (question.terminee) return ignore;
  if (estBloquee(question, maintenant)) return ignore;
  if (question.desactives.has(cle)) return ignore;
  if (!question.choix.some((c) => String(c) === cle)) return ignore;

  if (cle === String(question.bonneReponse)) {
    question.terminee = true;
    return { type: "bonne", etoiles: 1 };
  }

  question.erreurs += 1;
  question.desactives.add(cle);
  question.bloqueeJusqua = maintenant + DELAI_BLOCAGE_MS;

  if (question.erreurs >= ERREURS_MAX) {
    question.terminee = true;
    return { type: "revelee", etoiles: -1 };
  }
  return { type: "mauvaise", etoiles: -1 };
}

/** Ajoute (ou retire) des étoiles sans jamais descendre sous zéro. */
export function ajouterEtoiles(total, delta) {
  return Math.max(0, total + delta);
}

/**
 * Enveloppe un générateur de questions pour qu'il ne produise jamais
 * deux fois de suite la même question (même "cle").
 */
export function sansRepetition(generer, essaisMax = 50) {
  let precedent = null;
  return function suivante() {
    let question = generer();
    for (let i = 0; i < essaisMax && precedent !== null && question.cle === precedent; i++) {
      question = generer();
    }
    if (precedent !== null && question.cle === precedent) {
      throw new Error("Impossible de trouver une question différente de la précédente.");
    }
    precedent = question.cle;
    return question;
  };
}
