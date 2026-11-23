// Petits sons générés par le navigateur (pas de fichier audio à télécharger).

let contexte; // créé au premier son : les navigateurs exigent un clic avant de jouer un son

function note(frequence, debut, duree) {
  contexte ??= new AudioContext(); // "??=" : crée le contexte seulement s'il n'existe pas
  const oscillateur = contexte.createOscillator();
  const volume = contexte.createGain();
  oscillateur.frequency.value = frequence; // hauteur de la note en hertz
  volume.gain.setValueAtTime(0.2, contexte.currentTime + debut);
  volume.gain.exponentialRampToValueAtTime(0.001, contexte.currentTime + debut + duree);
  oscillateur.connect(volume).connect(contexte.destination);
  oscillateur.start(contexte.currentTime + debut);
  oscillateur.stop(contexte.currentTime + debut + duree);
}

/** Petite mélodie joyeuse qui monte. */
export function sonBravo() {
  note(523, 0, 0.15); // do
  note(659, 0.12, 0.15); // mi
  note(784, 0.24, 0.3); // sol
}

/** Son doux qui descend (pas effrayant). */
export function sonErreur() {
  note(330, 0, 0.2);
  note(262, 0.15, 0.3);
}
