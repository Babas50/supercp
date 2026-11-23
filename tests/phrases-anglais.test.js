// Tests des activités Phrases et Anglais.
import { test } from "node:test";
import assert from "node:assert/strict";
import { genererPhrase, phrasesMelangees } from "../src/js/matieres/phrases.js";
import { genererAnglais, LANGUE_ANGLAIS } from "../src/js/matieres/anglais.js";
import { PHRASES } from "../src/js/donnees/phrases.js";
import { COULEURS, ANIMAUX, NOMBRES } from "../src/js/donnees/anglais.js";
import { sansRepetition } from "../src/js/moteur/question.js";

const ESSAIS = 300;

for (const [nom, generer] of [["phrases", genererPhrase], ["anglais", genererAnglais]]) {
  for (const niveau of [1, 2, 3]) {
    test(`${nom} niveau ${niveau} : 4 réponses différentes, jamais deux questions identiques de suite`, () => {
      const suivante = sansRepetition(() => generer(niveau));
      let precedente = null;
      for (let k = 0; k < ESSAIS; k++) {
        const q = suivante();
        const textes = q.choix.map(String);
        assert.equal(textes.length, 4, `${q.enonce} : ${textes}`);
        assert.equal(new Set(textes).size, 4);
        assert.ok(textes.includes(String(q.bonneReponse)));
        assert.notEqual(q.cle, precedente);
        precedente = q.cle;
      }
    });
  }
  test(`${nom} : niveau inconnu refusé`, () => {
    assert.throws(() => generer(4), /Niveau inconnu/);
  });
}

test("chaque mot à trouver apparaît une seule fois dans sa phrase", () => {
  for (const { phrase, trou } of PHRASES) {
    assert.equal(phrase.split(trou).length - 1, 1, `${phrase} / ${trou}`);
  }
});

test("pas de doublon : phrases, images et mots à trouver tous différents", () => {
  for (const champ of ["phrase", "image", "trou"]) {
    const valeurs = PHRASES.map((p) => p[champ]);
    assert.equal(new Set(valeurs).size, valeurs.length, `doublon dans "${champ}"`);
  }
});

test("pas de doublon dans le vocabulaire anglais", () => {
  for (const [liste, champ] of [[COULEURS, "teinte"], [ANIMAUX, "image"]]) {
    assert.equal(new Set(liste.map((x) => x.mot)).size, liste.length);
    assert.equal(new Set(liste.map((x) => x[champ])).size, liste.length);
  }
});

// Outils pour comparer deux couleurs "#RRVVBB" comme le ferait un œil humain.
function rvb(teinte) {
  return [1, 3, 5].map((i) => parseInt(teinte.slice(i, i + 2), 16));
}
// Distance "redmean" : une formule simple qui pondère le rouge, le vert et le bleu
// selon la sensibilité de l'œil. Au-dessus de 120, deux couleurs ne se confondent pas.
function ecartCouleurs(a, b) {
  const [r1, v1, b1] = rvb(a);
  const [r2, v2, b2] = rvb(b);
  const rMoyen = (r1 + r2) / 2;
  const [dr, dv, db] = [r1 - r2, v1 - v2, b1 - b2];
  return Math.sqrt((2 + rMoyen / 256) * dr * dr + 4 * dv * dv + (2 + (255 - rMoyen) / 256) * db * db);
}
// Teinte sur le cercle des couleurs, en degrés (0 = rouge, 60 = jaune, 120 = vert...).
function angleTeinte(teinte) {
  const [r, v, b] = rvb(teinte).map((x) => x / 255);
  const max = Math.max(r, v, b);
  const d = max - Math.min(r, v, b);
  if (d === 0) return 0;
  if (max === r) return (60 * ((v - b) / d) + 360) % 360;
  if (max === v) return 60 * ((b - r) / d) + 120;
  return 60 * ((r - v) / d) + 240;
}

test("couleurs anglaises : chaque teinte est un code #RRVVBB valide", () => {
  for (const c of COULEURS) assert.match(c.teinte, /^#[0-9a-f]{6}$/, c.mot);
});

test("couleurs anglaises : deux couleurs ne se ressemblent jamais à l'écran", () => {
  for (const a of COULEURS) {
    for (const b of COULEURS) {
      if (a === b) continue;
      assert.ok(ecartCouleurs(a.teinte, b.teinte) > 120, `${a.mot} et ${b.mot} se ressemblent trop`);
    }
  }
});

test("couleurs anglaises : le jaune, l'orange et le rouge sont bien dans leur zone", () => {
  const teinte = (mot) => angleTeinte(COULEURS.find((c) => c.mot === mot).teinte);
  // Repères du cercle des couleurs : rouge vers 0°, orange vers 30°, jaune vers 55°.
  assert.ok(teinte("red") < 10 || teinte("red") > 350, "red");
  assert.ok(teinte("orange") >= 22 && teinte("orange") <= 38, "orange");
  assert.ok(teinte("yellow") >= 48 && teinte("yellow") <= 62, "yellow");
});

test("anglais couleurs : le bouton de la bonne réponse montre la couleur du mot entendu", () => {
  for (let k = 0; k < ESSAIS; k++) {
    const q = genererAnglais(1);
    const couleur = COULEURS.find((c) => c.mot === q.aLire);
    assert.equal(q.bonneReponse, couleur.mot);
    assert.ok(q.dessins[q.bonneReponse].includes(`fill="${couleur.teinte}"`));
    for (const choix of q.choix) assert.ok(q.dessins[choix], `pas de dessin pour ${choix}`);
  }
});

test("phrases niveau 1 : remettre le mot dans le trou redonne la phrase", () => {
  for (let k = 0; k < ESSAIS; k++) {
    const q = genererPhrase(1);
    assert.ok(q.enonce.replace("___", q.bonneReponse).endsWith(q.cle));
  }
});

test("phrasesMelangees : mêmes mots, ordre différent, point final gardé", () => {
  const versions = phrasesMelangees("Le chat dort.", 3);
  assert.equal(versions.length, 3);
  for (const v of versions) {
    assert.notEqual(v, "Le chat dort.");
    assert.ok(v.endsWith("."));
    assert.deepEqual(v.slice(0, -1).split(" ").sort(), ["Le", "chat", "dort"].sort());
  }
});

test("anglais : la voix est anglaise et lit le mot de la bonne réponse", () => {
  for (let k = 0; k < ESSAIS; k++) {
    const niveau = (k % 3) + 1;
    const q = genererAnglais(niveau);
    assert.equal(q.langue, LANGUE_ANGLAIS);
    if (niveau === 1) assert.equal(q.bonneReponse, q.aLire);
    if (niveau === 2) assert.equal(ANIMAUX.find((c) => c.mot === q.aLire).image, q.bonneReponse);
    if (niveau === 3) assert.equal(NOMBRES[q.bonneReponse], q.aLire);
  }
});

test("les questions en français gardent la voix française", () => {
  assert.equal(genererPhrase(1).langue, "fr-FR");
});
