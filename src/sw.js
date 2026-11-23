// Service worker : un petit programme que le navigateur garde en arrière-plan.
// Il enregistre les fichiers de l'appli sur l'appareil, pour qu'elle
// fonctionne même SANS connexion internet (dans la voiture, en avion...).

// IMPORTANT : changez ce numéro à chaque mise à jour de l'appli,
// sinon les appareils garderont l'ancienne version en mémoire.
const VERSION = "supercp-v4";

// Liste des fichiers à garder sur l'appareil.
const FICHIERS = [
  "./",
  "./index.html",
  "./styles.css",
  "./manifest.webmanifest",
  "./js/app.js",
  "./js/aleatoire.js",
  "./js/voix.js",
  "./js/son.js",
  "./js/installation.js",
  "./js/moteur/question.js",
  "./js/moteur/progression.js",
  "./js/moteur/memory.js",
  "./js/matieres/calcul.js",
  "./js/matieres/lettres.js",
  "./js/matieres/chiffres.js",
  "./js/matieres/mots.js",
  "./js/matieres/phrases.js",
  "./js/matieres/anglais.js",
  "./js/matieres/dictee.js",
  "./js/matieres/heure.js",
  "./js/matieres/formes.js",
  "./js/matieres/calendrier.js",
  "./js/donnees/mots.js",
  "./js/donnees/phrases.js",
  "./js/donnees/anglais.js",
  "./icones/icone-192.png",
  "./icones/icone-512.png",
  "./icones/apple-touch-icon.png",
  "./icones/favicon-32.png",
];

// 1. Installation : on télécharge et on range tous les fichiers.
self.addEventListener("install", (evenement) => {
  evenement.waitUntil(
    caches.open(VERSION).then((cache) => cache.addAll(FICHIERS)),
  );
  self.skipWaiting(); // la nouvelle version prend la main tout de suite
});

// 2. Activation : on supprime les anciennes versions rangées.
self.addEventListener("activate", (evenement) => {
  evenement.waitUntil(
    caches
      .keys()
      .then((noms) =>
        Promise.all(noms.filter((nom) => nom !== VERSION).map((nom) => caches.delete(nom))),
      )
      .then(() => self.clients.claim()),
  );
});

// 3. Chaque fois que l'appli demande un fichier : on le sert depuis l'appareil
//    s'il y est, sinon on va le chercher sur internet.
self.addEventListener("fetch", (evenement) => {
  if (evenement.request.method !== "GET") return;
  evenement.respondWith(
    caches
      .match(evenement.request, { ignoreSearch: true })
      .then((reponse) => reponse ?? fetch(evenement.request)),
  );
});
