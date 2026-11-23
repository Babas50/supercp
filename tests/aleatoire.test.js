// Tests unitaires du module aleatoire.js.
// "node --test" exécute automatiquement les fichiers qui finissent par .test.js
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  entierAleatoire,
  melanger,
  creerTireurSansRepetition,
} from "../src/js/aleatoire.js";

// Petit générateur de hasard "prévisible" : renvoie toujours les mêmes
// valeurs dans le même ordre, pour que les tests donnent toujours le même résultat.
function hasardFixe(valeurs) {
  let i = 0;
  return () => valeurs[i++ % valeurs.length];
}

test("entierAleatoire reste entre min et max", () => {
  for (let k = 0; k < 1000; k++) {
    const n = entierAleatoire(1, 6);
    assert.ok(n >= 1 && n <= 6, `valeur hors limites : ${n}`);
    assert.ok(Number.isInteger(n));
  }
});

test("entierAleatoire atteint bien les deux bornes", () => {
  assert.equal(entierAleatoire(1, 6, () => 0), 1);
  assert.equal(entierAleatoire(1, 6, () => 0.9999), 6);
});

test("melanger garde exactement les mêmes éléments", () => {
  const depart = [1, 2, 3, 4, 5];
  const resultat = melanger(depart);
  assert.deepEqual([...resultat].sort(), depart);
});

test("melanger ne modifie pas le tableau d'origine", () => {
  const depart = [1, 2, 3];
  melanger(depart);
  assert.deepEqual(depart, [1, 2, 3]);
});

test("melanger place la bonne réponse à toutes les positions possibles", () => {
  // Sur 500 mélanges, la réponse "OK" doit apparaître au moins une fois
  // à chacune des 4 positions : sinon l'enfant pourrait deviner la place.
  const positionsVues = new Set();
  for (let k = 0; k < 500; k++) {
    positionsVues.add(melanger(["OK", "x", "y", "z"]).indexOf("OK"));
  }
  assert.deepEqual([...positionsVues].sort(), [0, 1, 2, 3]);
});

test("le tireur ne renvoie jamais deux fois de suite le même élément", () => {
  const tirer = creerTireurSansRepetition(["a", "b", "c"]);
  let precedent = tirer();
  for (let k = 0; k < 1000; k++) {
    const actuel = tirer();
    assert.notEqual(actuel, precedent, "deux éléments identiques à la suite");
    precedent = actuel;
  }
});

test("le tireur évite la répétition même si le hasard insiste", () => {
  // Le hasard renvoie toujours 0 : un tirage naïf donnerait "a", "a", "a"...
  const tirer = creerTireurSansRepetition(["a", "b"], { hasard: hasardFixe([0]) });
  assert.deepEqual([tirer(), tirer(), tirer(), tirer()], ["a", "b", "a", "b"]);
});

test("le tireur compare des questions-objets avec la fonction egal", () => {
  const questions = [
    { texte: "2 + 3" },
    { texte: "2 + 3" }, // doublon : même question, autre objet
    { texte: "4 + 1" },
  ];
  const tirer = creerTireurSansRepetition(questions, {
    egal: (a, b) => a.texte === b.texte,
  });
  let precedent = tirer();
  for (let k = 0; k < 500; k++) {
    const actuel = tirer();
    assert.notEqual(actuel.texte, precedent.texte);
    precedent = actuel;
  }
});

test("le tireur fonctionne avec un seul élément (pas de blocage)", () => {
  const tirer = creerTireurSansRepetition(["seul"]);
  assert.equal(tirer(), "seul");
  assert.equal(tirer(), "seul");
});

test("le tireur refuse une liste vide", () => {
  assert.throws(() => creerTireurSansRepetition([]));
});
