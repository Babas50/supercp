// Tout ce qui permet d'installer l'appli sur l'appareil.

// Case du stockage où l'on retient que l'appli a été installée (ou que le
// parent ne veut plus voir le bouton). Le navigateur ne peut pas toujours
// savoir tout seul qu'une appli est installée : on le lui dit.
export const CLE_INSTALLEE = "supercp-installee";

/**
 * Détecte un iPhone ou un iPad. Les iPad récents se présentent comme un Mac :
 * on les reconnaît à leur écran tactile.
 */
export function estAppareilApple(userAgent, plateforme = "", pointsTactiles = 0) {
  if (/iPhone|iPad|iPod/.test(userAgent)) return true;
  return plateforme === "MacIntel" && pointsTactiles > 1;
}

/** Firefox (sur Android : "Firefox" ; sur iPhone : "FxiOS"). */
export function estFirefox(userAgent) {
  return /Firefox|FxiOS/.test(userAgent);
}

/**
 * Décide quoi proposer pour l'installation. Fonction "pure" : testable.
 * Renvoie :
 * - "aucun"   : appli déjà installée (ou bouton masqué par le parent) : rien à montrer
 * - "apple"   : guide iPhone / iPad (bouton Partager)
 * - "firefox" : guide Firefox (menu ⋮)
 * - "invite"  : bouton qui ouvre la fenêtre d'installation du navigateur (Chrome, Edge)
 */
export function modeInstallation({ userAgent, plateforme = "", pointsTactiles = 0, installee = false }) {
  if (installee) return "aucun";
  if (estAppareilApple(userAgent, plateforme, pointsTactiles)) return "apple";
  if (estFirefox(userAgent)) return "firefox";
  return "invite";
}

/** Vrai si l'appli tourne en mode installé (ouverte depuis son icône). */
export function estEnModeAppli() {
  // Selon le navigateur, une appli installée s'affiche en "standalone",
  // "fullscreen" ou "minimal-ui" : on accepte les trois.
  const modes = ["standalone", "fullscreen", "minimal-ui"];
  return (
    modes.some((m) => window.matchMedia(`(display-mode: ${m})`).matches) ||
    window.navigator.standalone === true // ancienne façon de faire sur iPhone
  );
}

function lireInstallee() {
  try {
    return window.localStorage.getItem(CLE_INSTALLEE) === "oui";
  } catch {
    return false;
  }
}

function retenirInstallee() {
  try {
    window.localStorage.setItem(CLE_INSTALLEE, "oui");
  } catch {
    // Stockage interdit : le bouton reviendra au prochain lancement, sans gravité.
  }
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
 * Prépare le bouton "Installer" et les guides.
 * elements : { bouton, guideApple, guideFirefox, boutonsCestFait }
 */
export function preparerInstallation({ bouton, guideApple, guideFirefox, boutonsCestFait }) {
  // Lancée depuis son icône : l'appli est forcément installée, on le retient.
  if (estEnModeAppli()) retenirInstallee();

  const mode = modeInstallation({
    userAgent: navigator.userAgent,
    plateforme: navigator.platform,
    pointsTactiles: navigator.maxTouchPoints,
    installee: lireInstallee(),
  });

  const toutCacher = () => {
    bouton.hidden = true;
    guideApple.hidden = true;
    guideFirefox.hidden = true;
  };
  toutCacher();

  // Bouton "C'est fait" sous chaque guide : on retient et on cache tout.
  for (const b of boutonsCestFait) {
    b.addEventListener("click", () => {
      retenirInstallee();
      toutCacher();
    });
  }

  if (mode === "aucun") return;

  if (mode === "apple" || mode === "firefox") {
    const guide = mode === "apple" ? guideApple : guideFirefox;
    bouton.hidden = false;
    bouton.addEventListener("click", () => {
      guide.hidden = !guide.hidden;
    });
    return;
  }

  // Chrome, Edge : le navigateur prévient quand il peut installer l'appli.
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
    retenirInstallee();
    toutCacher();
  });
}
