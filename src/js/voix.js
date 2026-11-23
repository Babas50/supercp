// Lecture à voix haute avec la synthèse vocale de l'appareil.
// La qualité dépend des voix installées sur le téléphone ou l'ordinateur :
// on choisit la meilleure disponible pour chaque langue.

// Mots qui signalent en général une voix de meilleure qualité.
const MOTS_QUALITE = /premium|enhanced|améliorée|natural|neural|google|siri|samantha|daniel|serena|amélie|thomas/i;

/**
 * Donne une note à une voix pour une langue demandée (ex. "en-GB").
 * Plus la note est haute, meilleure est la voix. Fonction pure : testable.
 */
export function noterVoix(voix, langue) {
  const demandee = langue.toLowerCase();
  const sienne = (voix.lang || "").toLowerCase().replace("_", "-");
  const prefixe = demandee.split("-")[0]; // "en" pour "en-GB"
  if (!sienne.startsWith(prefixe)) return -1; // mauvaise langue : exclue
  let note = 1;
  if (sienne === demandee) note += 3; // exactement la langue voulue (en-GB)
  else if (prefixe === "en" && sienne === "en-us") note += 2; // anglais américain : bien aussi
  if (MOTS_QUALITE.test(voix.name || "")) note += 4; // voix de qualité supérieure
  if (voix.localService) note += 1; // installée sur l'appareil : marche hors connexion
  return note;
}

/** Choisit la meilleure voix d'une liste pour une langue, ou null s'il n'y en a pas. */
export function choisirVoix(voix, langue) {
  let meilleure = null;
  let meilleureNote = -1;
  for (const v of voix) {
    const note = noterVoix(v, langue);
    if (note > meilleureNote) {
      meilleure = v;
      meilleureNote = note;
    }
  }
  return meilleureNote >= 0 ? meilleure : null;
}

// Vitesse de lecture : 1 = normal. Plus lent pour un enfant, encore plus en anglais.
export function vitesse(langue, lentement = false) {
  const base = langue.startsWith("en") ? 0.8 : 0.9;
  return lentement ? base - 0.25 : base;
}

/**
 * Lit un texte. langue : "fr-FR" ou "en-GB".
 * lentement : true pour relire plus doucement (bouton Écouter).
 */
export function lire(texte, langue = "fr-FR", lentement = false) {
  // Certains navigateurs anciens n'ont pas de synthèse vocale : on ne fait rien.
  if (!("speechSynthesis" in window)) return;
  const synthese = window.speechSynthesis;
  synthese.cancel(); // coupe la phrase précédente
  const phrase = new SpeechSynthesisUtterance(texte);
  phrase.lang = langue;
  phrase.rate = vitesse(langue, lentement);
  const voix = choisirVoix(synthese.getVoices(), langue);
  if (voix) phrase.voice = voix;
  synthese.speak(phrase);
}

// Sur certains appareils, la liste des voix arrive un peu après le chargement :
// demander la liste tout de suite la fait se charger plus tôt.
if (typeof window !== "undefined" && "speechSynthesis" in window) {
  window.speechSynthesis.getVoices();
}
