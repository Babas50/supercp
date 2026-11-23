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
  for (const liste of [COULEURS, ANIMAUX]) {
    assert.equal(new Set(liste.map((x) => x.mot)).size, liste.length);
    assert.equal(new Set(liste.map((x) => x.image)).size, liste.length);
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
    if (niveau === 1) assert.equal(COULEURS.find((c) => c.mot === q.aLire).image, q.bonneReponse);
    if (niveau === 2) assert.equal(ANIMAUX.find((c) => c.mot === q.aLire).image, q.bonneReponse);
    if (niveau === 3) assert.equal(NOMBRES[q.bonneReponse], q.aLire);
  }
});

test("les questions en français gardent la voix française", () => {
  assert.equal(genererPhrase(1).langue, "fr-FR");
});
