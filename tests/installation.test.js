// Tests de l'installation : détection Apple et fichiers du mode hors connexion.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { estAppareilApple, estFirefox, modeInstallation } from "../src/js/installation.js";

// fileURLToPath donne un chemin valable sur Windows comme sur Linux.
const SRC = fileURLToPath(new URL("../src/", import.meta.url));

test("détecte un iPhone", () => {
  const ua = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15";
  assert.equal(estAppareilApple(ua), true);
});

test("détecte un iPad récent qui se fait passer pour un Mac", () => {
  const ua = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15";
  assert.equal(estAppareilApple(ua, "MacIntel", 5), true);
});

test("ne confond pas un vrai Mac, un Android ou un PC Windows avec un iPhone", () => {
  const mac = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)";
  assert.equal(estAppareilApple(mac, "MacIntel", 0), false);
  assert.equal(estAppareilApple("Mozilla/5.0 (Linux; Android 14; Pixel 8)", "Linux armv8l", 5), false);
  assert.equal(estAppareilApple("Mozilla/5.0 (Windows NT 10.0; Win64; x64)", "Win32", 0), false);
});

// Lit la liste FICHIERS du service worker.
function fichiersDuServiceWorker() {
  const code = readFileSync(join(SRC, "sw.js"), "utf8");
  const liste = code.match(/const FICHIERS = \[([\s\S]*?)\];/)[1];
  return [...liste.matchAll(/"\.\/([^"]*)"/g)].map((m) => m[1]);
}

// Liste tous les fichiers de src/ (sous-dossiers compris).
function fichiersDuDossier(dossier, prefixe = "") {
  return readdirSync(join(dossier, prefixe), { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? fichiersDuDossier(dossier, join(prefixe, e.name)) : [join(prefixe, e.name)],
  );
}

test("tous les fichiers listés dans le service worker existent", () => {
  // Un seul fichier manquant et l'installation hors connexion échoue entièrement.
  for (const f of fichiersDuServiceWorker()) {
    if (f === "") continue; // "./" = la page d'accueil
    assert.ok(existsSync(join(SRC, f)), `fichier introuvable : src/${f}`);
  }
});

test("chaque fichier JavaScript de l'appli est disponible hors connexion", () => {
  // Évite d'oublier d'ajouter un nouveau fichier à la liste du service worker.
  const listes = new Set(fichiersDuServiceWorker());
  const js = fichiersDuDossier(SRC).filter((f) => f.endsWith(".js") && f !== "sw.js");
  for (const f of js) {
    assert.ok(listes.has(f.split("\\").join("/")), `à ajouter dans sw.js : ./${f}`);
  }
});

test("le manifest pointe vers des icônes qui existent", () => {
  const manifest = JSON.parse(readFileSync(join(SRC, "manifest.webmanifest"), "utf8"));
  assert.equal(manifest.display, "standalone");
  assert.ok(manifest.icons.some((i) => i.sizes === "192x192"));
  assert.ok(manifest.icons.some((i) => i.sizes === "512x512"));
  for (const icone of manifest.icons) {
    assert.ok(existsSync(join(SRC, icone.src)), `icône introuvable : ${icone.src}`);
  }
});

const UA = {
  iphoneSafari: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile/15E148 Safari/604.1",
  iphoneFirefox: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 FxiOS/120.0 Mobile/15E148 Safari/605.1.15",
  androidFirefox: "Mozilla/5.0 (Android 14; Mobile; rv:120.0) Gecko/120.0 Firefox/120.0",
  androidChrome: "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/120.0 Mobile Safari/537.36",
  windowsEdge: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0 Safari/537.36 Edg/120.0",
};

test("détecte Firefox sur Android et sur iPhone", () => {
  assert.ok(estFirefox(UA.androidFirefox));
  assert.ok(estFirefox(UA.iphoneFirefox));
  assert.ok(!estFirefox(UA.androidChrome));
  assert.ok(!estFirefox(UA.iphoneSafari));
});

test("appli déjà installée : on ne propose plus rien, quel que soit le navigateur", () => {
  for (const userAgent of Object.values(UA)) {
    assert.equal(modeInstallation({ userAgent, installee: true }), "aucun");
  }
});

test("le bon guide selon l'appareil", () => {
  assert.equal(modeInstallation({ userAgent: UA.iphoneSafari }), "apple");
  // Firefox sur iPhone : l'installation passe par le bouton Partager, comme Safari.
  assert.equal(modeInstallation({ userAgent: UA.iphoneFirefox }), "apple");
  assert.equal(modeInstallation({ userAgent: UA.androidFirefox }), "firefox");
  assert.equal(modeInstallation({ userAgent: UA.androidChrome }), "invite");
  assert.equal(modeInstallation({ userAgent: UA.windowsEdge }), "invite");
});
