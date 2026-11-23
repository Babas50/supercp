// Tests du moteur de question et des règles anti-triche.
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  creerQuestion,
  repondre,
  estBloquee,
  ajouterEtoiles,
  sansRepetition,
  DELAI_BLOCAGE_MS,
} from "../src/js/moteur/question.js";

// Question type utilisée dans plusieurs tests : la bonne réponse est 5.
function questionExemple() {
  return creerQuestion({ enonce: "2 + 3 = ?", bonneReponse: 5, distracteurs: [4, 6, 7] });
}

test("les choix contiennent la bonne réponse et les distracteurs", () => {
  const q = questionExemple();
  assert.deepEqual([...q.choix].sort(), [4, 5, 6, 7]);
});

test("aucune réponse en double dans les choix", () => {
  const q = creerQuestion({ enonce: "x", bonneReponse: 5, distracteurs: [4, 4, "5", 5, 6] });
  const textes = q.choix.map(String);
  assert.equal(new Set(textes).size, textes.length);
  assert.deepEqual(textes.sort(), ["4", "5", "6"]);
});

test("refuse une question sans mauvaise réponse", () => {
  assert.throws(() => creerQuestion({ enonce: "x", bonneReponse: 1, distracteurs: [1] }));
});

test("bonne réponse : +1 étoile et question terminée", () => {
  const q = questionExemple();
  assert.deepEqual(repondre(q, 5, 0), { type: "bonne", etoiles: 1 });
  assert.equal(q.terminee, true);
});

test("mauvaise réponse : -1 étoile et réponse désactivée", () => {
  const q = questionExemple();
  assert.deepEqual(repondre(q, 4, 0), { type: "mauvaise", etoiles: -1 });
  assert.ok(q.desactives.has("4"));
});

test("anti-triche : recliquer une réponse désactivée est ignoré", () => {
  const q = questionExemple();
  repondre(q, 4, 0);
  assert.equal(repondre(q, 4, DELAI_BLOCAGE_MS + 1).type, "ignore");
});

test("anti-triche : tous les clics sont bloqués 1 seconde après une erreur", () => {
  const q = questionExemple();
  repondre(q, 4, 1000);
  assert.ok(estBloquee(q, 1500));
  // Même la bonne réponse est refusée pendant le blocage.
  assert.equal(repondre(q, 5, 1500).type, "ignore");
  assert.equal(q.terminee, false);
  // Après le délai, on peut répondre de nouveau.
  assert.ok(!estBloquee(q, 1000 + DELAI_BLOCAGE_MS));
  assert.equal(repondre(q, 5, 1000 + DELAI_BLOCAGE_MS).type, "bonne");
});

test("anti-triche : après 2 erreurs la réponse est révélée, sans étoile", () => {
  const q = questionExemple();
  repondre(q, 4, 0);
  assert.deepEqual(repondre(q, 6, 2000), { type: "revelee", etoiles: -1 });
  assert.equal(q.terminee, true);
  // Cliquer ensuite sur la bonne réponse ne rapporte rien.
  assert.deepEqual(repondre(q, 5, 5000), { type: "ignore", etoiles: 0 });
});

test("anti-triche : cliquer sur toutes les réponses ne rapporte jamais d'étoile", () => {
  // Pour chaque position possible de la bonne réponse, on simule un enfant
  // qui clique sur tous les boutons dans l'ordre, très vite puis lentement.
  for (const pause of [0, 10, DELAI_BLOCAGE_MS]) {
    for (let essai = 0; essai < 50; essai++) {
      const q = questionExemple();
      let gagne = 0;
      let temps = 0;
      for (const c of q.choix) {
        gagne += repondre(q, c, temps).etoiles > 0 ? 1 : 0;
        temps += pause;
      }
      // Gagner n'est possible que si la bonne réponse est en 1re ou 2e position
      // (au plus 1 erreur avant). Jamais plus d'une étoile.
      assert.ok(gagne <= 1);
      const position = q.choix.indexOf(5);
      if (pause < DELAI_BLOCAGE_MS && position > 0) assert.equal(gagne, 0);
    }
  }
});

test("une réponse qui n'est pas dans les choix est ignorée", () => {
  const q = questionExemple();
  assert.equal(repondre(q, 99, 0).type, "ignore");
  assert.equal(q.erreurs, 0);
});

test("les étoiles ne descendent jamais sous zéro", () => {
  assert.equal(ajouterEtoiles(0, -1), 0);
  assert.equal(ajouterEtoiles(3, -1), 2);
  assert.equal(ajouterEtoiles(3, 1), 4);
});

test("sansRepetition : jamais deux énoncés identiques de suite", () => {
  // Générateur qui ne connaît que 2 énoncés : le risque de répétition est fort.
  let n = 0;
  const generer = () => {
    const lettre = n++ % 3 === 0 ? "A" : "B";
    return { enonce: lettre, cle: lettre };
  };
  const suivante = sansRepetition(generer);
  let precedent = suivante().cle;
  for (let k = 0; k < 200; k++) {
    const actuel = suivante().cle;
    assert.notEqual(actuel, precedent);
    precedent = actuel;
  }
});

test("sansRepetition : compare la clé, pas l'énoncé affiché", () => {
  // Deux questions "🔊" différentes (mots entendus différents) peuvent se suivre.
  let n = 0;
  const suivante = sansRepetition(() => ({ enonce: "🔊", cle: n++ % 2 ? "chat" : "lune" }));
  assert.doesNotThrow(() => {
    for (let k = 0; k < 10; k++) suivante();
  });
});

test("une question garde sa consigne et sa clé", () => {
  const q = creerQuestion({ enonce: "🔊", cle: "chat", consigne: "Écoute", bonneReponse: "chat", distracteurs: ["chien"] });
  assert.equal(q.cle, "chat");
  assert.equal(q.consigne, "Écoute");
  assert.equal(questionExemple().cle, "2 + 3 = ?");
});

test("sansRepetition : signale un générateur qui ne sait faire qu'un énoncé", () => {
  const suivante = sansRepetition(() => ({ enonce: "🔊", cle: "toujours pareil" }));
  suivante();
  assert.throws(() => suivante());
});
