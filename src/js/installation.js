// Tout ce qui permet d'installer l'appli sur l'appareil.

/**
 * Détecte un iPhone ou un iPad. Les iPad récents se présentent comme un Mac :
 * on les reconnaît à leur écran tactile.
 * Fonction "pure" (elle reçoit les infos au lieu de lire le navigateur) : testable.
 */
export function estAppareilApple(userAgent, plateforme = "", pointsTactiles = 0) {
  if (/iPhone|iPad|iPod/.test(userAgent)) return true;
  return plateforme === "MacIntel" && pointsTactiles > 1;
}

/** Vrai si l'appli tourne déjà en mode installé (ouverte depuis l'écran d'accueil). */
export function estInstallee() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true // ancienne façon de faire sur iPhone
  );
}

/** Enregistre le service worker (fonctionnement hors connexion). */
export function activerHorsConnexion() {
  // Les navigateurs n'autorisent le service worker que sur https ou localhost.
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js").catch(() => {
      // Si ça échoue, l'appli marche quand même, mais seulement en ligne.
    });
  }
}

/**
 * Prépare le bouton "Installer" (Android, PC) ou le guide (iPhone, iPad).
 * bouton : le bouton à afficher ; guide : le bloc d'explication pour Apple.
 */
export function preparerInstallation(bouton, guide) {
  if (estInstallee()) return; // déjà installée : rien à proposer

  // iPhone / iPad : Safari n'a pas de bouton d'installation automatique,
  // on montre donc la marche à suivre.
  if (estAppareilApple(navigator.userAgent, navigator.platform, navigator.maxTouchPoints)) {
    bouton.hidden = false;
    bouton.addEventListener("click", () => {
      guide.hidden = !guide.hidden;
    });
    return;
  }

  // Android et PC (Chrome, Edge) : le navigateur prévient qu'il peut installer l'appli.
  let demande = null;
  window.addEventListener("beforeinstallprompt", (evenement) => {
    evenement.preventDefault(); // on garde la demande pour notre propre bouton
    demande = evenement;
    bouton.hidden = false;
  });
  bouton.addEventListener("click", async () => {
    if (!demande) return;
    demande.prompt(); // ouvre la fenêtre "Installer Super CP ?"
    await demande.userChoice;
    demande = null;
    bouton.hidden = true;
  });
  window.addEventListener("appinstalled", () => {
    bouton.hidden = true;
  });
}
