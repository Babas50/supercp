// Lecture à voix haute avec la synthèse vocale intégrée au navigateur.
// Aucune connexion internet ni compte n'est nécessaire.

/** Lit un texte. langue : "fr-FR" (français) ou "en-GB" (anglais). */
export function lire(texte, langue = "fr-FR") {
  // Certains navigateurs anciens n'ont pas de synthèse vocale : on ne fait rien.
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel(); // coupe la phrase précédente
  const phrase = new SpeechSynthesisUtterance(texte);
  phrase.lang = langue;
  phrase.rate = 0.9; // un peu plus lent, pour un enfant
  window.speechSynthesis.speak(phrase);
}
