// Tests des générateurs d'additions et de soustractions.
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  genererAddition,
  genererSoustraction,
  distracteursProches,
  MAX_PAR_NIVEAU,
} from "../src/js/matieres/calcul.js";

// Lit "a + b = ?" ou "a − b = ?" et renvoie [a, b].
function operandes(enonce) {
  return enonce.match(/\d+/g).map(Number);
}

for (const niveau of [1, 2, 3]) {
  const max = MAX_PAR_NIVEAU[niveau];

  test(`addition niveau ${niveau} : résultat juste et ≤ ${max}`, () => {
    for (let k = 0; k < 500; k++) {
      const q = genererAddition(niveau);
      const [a, b] = operandes(q.enonce);
      assert.equal(q.bonneReponse, a + b);
      assert.ok(q.bonneReponse <= max);
      assert.equal(q.choix.length, 4);
      assert.ok(q.choix.every((c) => c >= 0 && c <= max));
    }
  });

  test(`soustraction niveau ${niveau} : résultat juste et jamais négatif`, () => {
    for (let k = 0; k < 500; k++) {
      const q = genererSoustraction(niveau);
      const [a, b] = operandes(q.enonce);
      assert.equal(q.bonneReponse, a - b);
      assert.ok(q.bonneReponse >= 0);
      assert.ok(a <= max);
      assert.equal(q.choix.length, 4);
    }
  });
}

test("distracteurs : différents de la bonne réponse, uniques et dans les bornes", () => {
  for (let bonne = 0; bonne <= 5; bonne++) {
    const d = distracteursProches(bonne, 5, 3);
    assert.equal(d.length, 3);
    assert.equal(new Set(d).size, 3);
    assert.ok(!d.includes(bonne));
    assert.ok(d.every((x) => x >= 0 && x <= 5));
  }
});

test("niveau inconnu : erreur claire", () => {
  assert.throws(() => genererAddition(4), /Niveau inconnu/);
});
