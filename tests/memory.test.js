// Tests du jeu de memory.
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  creerPartie,
  toucherCarte,
  cacherRatees,
  partieFinie,
  PAIRES_PAR_NIVEAU,
} from "../src/js/moteur/memory.js";
import { DELAI_BLOCAGE_MS } from "../src/js/moteur/question.js";

// Positions de deux cartes identiques, et d'une carte différente de la 1re.
function trouverPaire(partie) {
  const libres = partie.cartes.map((c, i) => i).filter((i) => !partie.cartes[i].trouvee);
  const i = libres[0];
  const j = libres.find((k) => k !== i && partie.cartes[k].image === partie.cartes[i].image);
  const autre = libres.find((k) => partie.cartes[k].image !== partie.cartes[i].image);
  return { i, j, autre };
}

for (const niveau of [1, 2, 3]) {
  test(`niveau ${niveau} : chaque image apparaît exactement deux fois`, () => {
    const partie = creerPartie(niveau);
    assert.equal(partie.cartes.length, PAIRES_PAR_NIVEAU[niveau] * 2);
    const compte = {};
    for (const c of partie.cartes) compte[c.image] = (compte[c.image] ?? 0) + 1;
    assert.ok(Object.values(compte).every((n) => n === 2));
    assert.ok(partie.cartes.every((c) => !c.visible && !c.trouvee));
  });
}

test("trouver une paire : +1 étoile, les cartes restent visibles", () => {
  const partie = creerPartie(1);
  const { i, j } = trouverPaire(partie);
  assert.equal(toucherCarte(partie, i, 0).type, "premiere");
  assert.deepEqual(toucherCarte(partie, j, 0), { type: "paire", etoiles: 1 });
  assert.ok(partie.cartes[i].trouvee && partie.cartes[j].trouvee);
});

test("anti-triche : toucher deux fois la même carte ne fait pas une paire", () => {
  const partie = creerPartie(1);
  toucherCarte(partie, 0, 0);
  assert.equal(toucherCarte(partie, 0, 0).type, "ignore");
});

test("anti-triche : pas de 3e carte pendant la seconde d'attente après un raté", () => {
  const partie = creerPartie(2);
  const { i, autre } = trouverPaire(partie);
  toucherCarte(partie, i, 0);
  assert.equal(toucherCarte(partie, autre, 0).type, "ratee");
  const troisieme = partie.cartes.findIndex((c) => !c.visible);
  assert.equal(toucherCarte(partie, troisieme, 500).type, "ignore");
  assert.equal(partie.cartes.filter((c) => c.visible).length, 2);
  // Après le délai, les deux cartes ratées se recachent et on peut rejouer.
  assert.equal(toucherCarte(partie, troisieme, DELAI_BLOCAGE_MS).type, "premiere");
  assert.equal(partie.cartes[i].visible, false);
  assert.equal(partie.cartes[autre].visible, false);
});

test("une paire ratée ne coûte pas d'étoile", () => {
  const partie = creerPartie(1);
  const { i, autre } = trouverPaire(partie);
  toucherCarte(partie, i, 0);
  assert.deepEqual(toucherCarte(partie, autre, 0), { type: "ratee", etoiles: 0 });
});

test("cacherRatees retourne les deux cartes ratées", () => {
  const partie = creerPartie(1);
  const { i, autre } = trouverPaire(partie);
  toucherCarte(partie, i, 0);
  toucherCarte(partie, autre, 0);
  cacherRatees(partie);
  assert.equal(partie.selection.length, 0);
  assert.ok(!partie.cartes[i].visible && !partie.cartes[autre].visible);
});

test("une partie complète se termine par 'finie' et rapporte une étoile par paire", () => {
  for (const niveau of [1, 2, 3]) {
    const partie = creerPartie(niveau);
    let etoiles = 0;
    let dernier;
    while (!partieFinie(partie)) {
      const { i, j } = trouverPaire(partie);
      toucherCarte(partie, i, 0);
      dernier = toucherCarte(partie, j, 0);
      etoiles += dernier.etoiles;
    }
    assert.equal(dernier.type, "finie");
    assert.equal(etoiles, PAIRES_PAR_NIVEAU[niveau]);
    assert.equal(toucherCarte(partie, 0, 0).type, "ignore");
  }
});

test("une position qui n'existe pas est ignorée", () => {
  assert.equal(toucherCarte(creerPartie(1), 99, 0).type, "ignore");
});

test("niveau inconnu refusé", () => {
  assert.throws(() => creerPartie(4), /Niveau inconnu/);
});
