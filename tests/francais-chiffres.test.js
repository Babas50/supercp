// Tests des activités Lettres, Chiffres et Mots.
import { test } from "node:test";
import assert from "node:assert/strict";
import { genererLettre, ALPHABET } from "../src/js/matieres/lettres.js";
import { genererChiffre } from "../src/js/matieres/chiffres.js";
import { genererMot, motsProches, positionsVoyelles } from "../src/js/matieres/mots.js";
import { MOTS } from "../src/js/donnees/mots.js";
import { sansRepetition } from "../src/js/moteur/question.js";

const NIVEAUX = [1, 2, 3];
const ESSAIS = 300;

// Vérifications communes à toutes les questions.
function verifierQuestion(q) {
  assert.equal(q.choix.length, 4, `4 réponses attendues : ${q.enonce}`);
  const textes = q.choix.map(String);
  assert.equal(new Set(textes).size, 4, `réponses en double : ${textes}`);
  assert.ok(textes.includes(String(q.bonneReponse)));
  assert.ok(q.consigne.length > 0, "chaque question a une consigne");
}

for (const [nom, generer] of [["lettres", genererLettre], ["chiffres", genererChiffre], ["mots", genererMot]]) {
  for (const niveau of NIVEAUX) {
    test(`${nom} niveau ${niveau} : 4 réponses différentes dont la bonne`, () => {
      for (let k = 0; k < ESSAIS; k++) verifierQuestion(generer(niveau));
    });

    test(`${nom} niveau ${niveau} : jamais deux fois la même question de suite`, () => {
      const suivante = sansRepetition(() => generer(niveau));
      let precedente = suivante().cle;
      for (let k = 0; k < ESSAIS; k++) {
        const cle = suivante().cle;
        assert.notEqual(cle, precedente);
        precedente = cle;
      }
    });
  }
  test(`${nom} : niveau inconnu refusé`, () => {
    assert.throws(() => generer(4), /Niveau inconnu/);
  });
}

test("lettres niveau 1 : la réponse est la lettre affichée", () => {
  for (let k = 0; k < ESSAIS; k++) {
    const q = genererLettre(1);
    assert.equal(q.bonneReponse, q.enonce);
    assert.ok(q.choix.every((c) => ALPHABET.includes(c)));
  }
});

test("lettres niveau 2 : toutes les réponses sont en minuscules", () => {
  for (let k = 0; k < ESSAIS; k++) {
    const q = genererLettre(2);
    assert.equal(q.bonneReponse, q.enonce.toLowerCase());
    assert.ok(q.choix.every((c) => /^[a-z]$/.test(c)));
  }
});

test("lettres niveau 3 : la réponse est l'initiale du mot", () => {
  for (let k = 0; k < ESSAIS; k++) {
    const q = genererLettre(3);
    assert.equal(q.bonneReponse, q.cle[0].toUpperCase());
  }
});

test("chiffres niveaux 1 et 2 : on compte le bon nombre d'objets, jamais 0", () => {
  for (const [niveau, max] of [[1, 5], [2, 10]]) {
    for (let k = 0; k < ESSAIS; k++) {
      const q = genererChiffre(niveau);
      // [...texte] découpe correctement les emoji (un emoji = un élément).
      assert.equal([...q.enonce].length, q.bonneReponse);
      assert.ok(q.choix.every((c) => c >= 1 && c <= max), `hors limites : ${q.choix}`);
    }
  }
});

test("chiffres niveau 3 : le nombre suivant, jusqu'à 20", () => {
  for (let k = 0; k < ESSAIS; k++) {
    const q = genererChiffre(3);
    const n = Number(q.enonce.match(/\d+/)[0]);
    assert.equal(q.bonneReponse, n + 1);
    assert.ok(q.choix.every((c) => c >= 0 && c <= 20));
  }
});

test("mots niveau 1 : la réponse correspond à l'image", () => {
  for (let k = 0; k < ESSAIS; k++) {
    const q = genererMot(1);
    assert.equal(MOTS.find((m) => m.mot === q.bonneReponse).image, q.enonce);
  }
});

test("mots niveau 2 : le mot lu à voix haute est la bonne réponse", () => {
  for (let k = 0; k < ESSAIS; k++) {
    const q = genererMot(2);
    assert.equal(q.aLire, q.bonneReponse);
  }
});

test("mots niveau 3 : remettre la voyelle dans le trou redonne le mot", () => {
  for (let k = 0; k < ESSAIS; k++) {
    const q = genererMot(3);
    const motATrous = q.cle;
    const reconstitue = motATrous.replace("_", q.bonneReponse);
    assert.ok(MOTS.some((m) => m.mot === reconstitue), `mot inconnu : ${reconstitue}`);
  }
});

test("motsProches préfère les mots qui commencent pareil", () => {
  const proches = motsProches("poule");
  assert.equal(proches.length, 3);
  assert.ok(!proches.includes("poule"));
  assert.ok(proches.every((m) => m.startsWith("p")), proches.join(","));
});

test("positionsVoyelles", () => {
  assert.deepEqual(positionsVoyelles("chat"), [2]);
  assert.deepEqual(positionsVoyelles("vélo"), [3]); // é n'est pas une voyelle simple
});

test("la liste de mots n'a pas de doublon", () => {
  const mots = MOTS.map((m) => m.mot);
  const images = MOTS.map((m) => m.image);
  assert.equal(new Set(mots).size, mots.length);
  assert.equal(new Set(images).size, images.length);
});
