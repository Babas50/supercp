// Tests de la progression : sauvegarde, niveaux, stickers.
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  etatInitial,
  charger,
  sauvegarder,
  niveauDebloque,
  reussitesManquantes,
  stickersGagnes,
  enregistrerResultat,
  CLE_STOCKAGE,
  SEUIL_DEBLOCAGE,
  ETOILES_PAR_STICKER,
  STICKERS,
} from "../src/js/moteur/progression.js";

// Faux localStorage : un simple dictionnaire en mémoire.
function fauxStockage(depart = {}) {
  const donnees = { ...depart };
  return {
    getItem: (cle) => (cle in donnees ? donnees[cle] : null),
    setItem: (cle, valeur) => {
      donnees[cle] = String(valeur);
    },
    donnees,
  };
}

const BONNE = { type: "bonne", etoiles: 1 };
const MAUVAISE = { type: "mauvaise", etoiles: -1 };

// Applique plusieurs résultats à la suite.
function jouer(etat, matiere, niveau, resultats) {
  for (const r of resultats) etat = enregistrerResultat(etat, matiere, niveau, r).etat;
  return etat;
}

test("sauvegarder puis charger redonne la même progression", () => {
  const stockage = fauxStockage();
  const etat = jouer(etatInitial(), "additions", 1, [BONNE, BONNE, MAUVAISE]);
  sauvegarder(stockage, etat);
  assert.deepEqual(charger(stockage), etat);
});

test("charger sans données : progression neuve", () => {
  assert.deepEqual(charger(fauxStockage()), etatInitial());
});

test("charger des données abîmées : progression neuve, sans planter", () => {
  assert.deepEqual(charger(fauxStockage({ [CLE_STOCKAGE]: "{pas du json" })), etatInitial());
  assert.deepEqual(charger(fauxStockage({ [CLE_STOCKAGE]: '{"version":99}' })), etatInitial());
});

test("sauvegarder ne plante pas si le stockage est interdit", () => {
  const stockage = { setItem: () => { throw new Error("plein"); } };
  assert.doesNotThrow(() => sauvegarder(stockage, etatInitial()));
});

test("le niveau 1 est ouvert, les niveaux 2 et 3 sont fermés au départ", () => {
  const etat = etatInitial();
  assert.equal(niveauDebloque(etat, "additions", 1), true);
  assert.equal(niveauDebloque(etat, "additions", 2), false);
  assert.equal(niveauDebloque(etat, "additions", 3), false);
  assert.equal(reussitesManquantes(etat, "additions", 2), SEUIL_DEBLOCAGE);
});

test("le niveau 2 s'ouvre après 10 bonnes réponses au niveau 1, et le signale une seule fois", () => {
  let etat = jouer(etatInitial(), "additions", 1, Array(SEUIL_DEBLOCAGE - 1).fill(BONNE));
  assert.equal(niveauDebloque(etat, "additions", 2), false);
  const r = enregistrerResultat(etat, "additions", 1, BONNE);
  assert.equal(r.niveauDebloque, 2);
  assert.equal(niveauDebloque(r.etat, "additions", 2), true);
  // La bonne réponse suivante ne ré-annonce pas le niveau 2.
  assert.equal(enregistrerResultat(r.etat, "additions", 1, BONNE).niveauDebloque, null);
});

test("les erreurs ne font pas perdre un niveau débloqué", () => {
  let etat = jouer(etatInitial(), "additions", 1, Array(SEUIL_DEBLOCAGE).fill(BONNE));
  etat = jouer(etat, "additions", 1, Array(20).fill(MAUVAISE));
  assert.equal(niveauDebloque(etat, "additions", 2), true);
});

test("chaque matière a ses propres niveaux", () => {
  const etat = jouer(etatInitial(), "additions", 1, Array(SEUIL_DEBLOCAGE).fill(BONNE));
  assert.equal(niveauDebloque(etat, "additions", 2), true);
  assert.equal(niveauDebloque(etat, "soustractions", 2), false);
});

test("réussir le dernier niveau n'annonce pas de niveau 4", () => {
  const etat = jouer(etatInitial(), "additions", 3, Array(SEUIL_DEBLOCAGE - 1).fill(BONNE));
  assert.equal(enregistrerResultat(etat, "additions", 3, BONNE).niveauDebloque, null);
});

test("un sticker est gagné toutes les 5 étoiles", () => {
  let etat = jouer(etatInitial(), "additions", 1, Array(ETOILES_PAR_STICKER - 1).fill(BONNE));
  assert.equal(stickersGagnes(etat).length, 0);
  const r = enregistrerResultat(etat, "additions", 1, BONNE);
  assert.equal(r.nouveauSticker, STICKERS[0]);
  assert.deepEqual(stickersGagnes(r.etat), [STICKERS[0]]);
});

test("un sticker gagné n'est jamais perdu, ni gagné deux fois", () => {
  // 5 étoiles (1 sticker), puis 3 erreurs (2 étoiles), puis 3 bonnes (5 étoiles).
  let etat = jouer(etatInitial(), "additions", 1, Array(5).fill(BONNE));
  etat = jouer(etat, "additions", 1, [MAUVAISE, MAUVAISE, MAUVAISE]);
  assert.equal(stickersGagnes(etat).length, 1);
  let nouveaux = 0;
  for (let k = 0; k < 3; k++) {
    const r = enregistrerResultat(etat, "additions", 1, BONNE);
    if (r.nouveauSticker) nouveaux++;
    etat = r.etat;
  }
  assert.equal(nouveaux, 0);
  assert.equal(stickersGagnes(etat).length, 1);
});

test("l'album ne dépasse pas le nombre de stickers existants", () => {
  const etat = { ...etatInitial(), etoilesRecord: 10_000 };
  assert.equal(stickersGagnes(etat).length, STICKERS.length);
});

test("enregistrerResultat ne modifie pas l'ancien état", () => {
  const avant = etatInitial();
  const copie = structuredClone(avant);
  enregistrerResultat(avant, "additions", 1, BONNE);
  assert.deepEqual(avant, copie);
});
