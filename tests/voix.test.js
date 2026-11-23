// Tests du choix de la voix (sans navigateur : on fabrique de fausses voix).
import { test } from "node:test";
import assert from "node:assert/strict";
import { choisirVoix, noterVoix, vitesse } from "../src/js/voix.js";

const VOIX = [
  { name: "Français", lang: "fr-FR", localService: true },
  { name: "English United States", lang: "en-US", localService: true },
  { name: "English United Kingdom", lang: "en-GB", localService: true },
  { name: "Google UK English Female", lang: "en-GB", localService: false },
  { name: "Deutsch", lang: "de-DE", localService: true },
];

test("préfère une voix anglaise de qualité supérieure", () => {
  assert.equal(choisirVoix(VOIX, "en-GB").name, "Google UK English Female");
});

test("sans voix de qualité, préfère l'anglais britannique, puis américain", () => {
  const simples = VOIX.filter((v) => !v.name.startsWith("Google"));
  assert.equal(choisirVoix(simples, "en-GB").name, "English United Kingdom");
  const sansGB = simples.filter((v) => v.lang !== "en-GB");
  assert.equal(choisirVoix(sansGB, "en-GB").name, "English United States");
});

test("ne choisit jamais une voix d'une autre langue", () => {
  assert.equal(noterVoix(VOIX[4], "en-GB"), -1);
  assert.equal(choisirVoix([VOIX[0], VOIX[4]], "en-GB"), null);
  assert.equal(choisirVoix(VOIX, "fr-FR").name, "Français");
});

test("accepte les codes de langue écrits avec _ (certains Android)", () => {
  assert.ok(noterVoix({ name: "x", lang: "en_GB" }, "en-GB") > 0);
});

test("aucune voix disponible : null, sans planter", () => {
  assert.equal(choisirVoix([], "en-GB"), null);
});

test("débit plus lent en anglais, et encore plus lent pour réécouter", () => {
  assert.ok(vitesse("en-GB") < vitesse("fr-FR"));
  assert.ok(vitesse("en-GB", true) < vitesse("en-GB"));
  assert.ok(vitesse("fr-FR", true) > 0.5);
});
