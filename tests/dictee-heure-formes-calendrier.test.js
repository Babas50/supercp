// Tests des activités Dictée, L'heure, Formes, Jours et mois.
import { test } from "node:test";
import assert from "node:assert/strict";
import { genererDictee, fautesPlausibles } from "../src/js/matieres/dictee.js";
import { genererHeure, ecrireHeure, anglesAiguilles, horlogeSVG } from "../src/js/matieres/heure.js";
import { genererForme, FORMES } from "../src/js/matieres/formes.js";
import { genererCalendrier, JOURS, MOIS } from "../src/js/matieres/calendrier.js";
import { MOTS } from "../src/js/donnees/mots.js";
import { PHRASES } from "../src/js/donnees/phrases.js";
import { sansRepetition } from "../src/js/moteur/question.js";

const ESSAIS = 300;
const ACTIVITES = [
  ["dictée", genererDictee],
  ["heure", genererHeure],
  ["formes", genererForme],
  ["jours et mois", genererCalendrier],
];

for (const [nom, generer] of ACTIVITES) {
  for (const niveau of [1, 2, 3]) {
    test(`${nom} niveau ${niveau} : 4 réponses différentes, jamais deux questions identiques de suite`, () => {
      const suivante = sansRepetition(() => generer(niveau));
      let precedente = null;
      for (let k = 0; k < ESSAIS; k++) {
        const q = suivante();
        const textes = q.choix.map(String);
        assert.equal(textes.length, 4, `${q.cle} : ${textes}`);
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

// ----- Dictée -----

test("fautesPlausibles : jamais le mot juste ni un autre mot connu", () => {
  const connus = new Set(MOTS.map((m) => m.mot));
  for (const { mot } of MOTS) {
    const fautes = fautesPlausibles(mot, 3);
    assert.equal(fautes.length, 3, `pas assez de fautes pour ${mot}`);
    for (const f of fautes) {
      assert.notEqual(f, mot);
      assert.ok(!connus.has(f), `${f} est un vrai mot`);
    }
  }
});

test("dictée : le mot (ou la phrase) lu à voix haute est la bonne réponse", () => {
  for (let k = 0; k < ESSAIS; k++) {
    const q = genererDictee((k % 3) + 1);
    assert.equal(q.aLire, q.bonneReponse);
  }
});

test("dictée : mots courts au niveau 1, longs au niveau 2", () => {
  for (let k = 0; k < ESSAIS; k++) {
    assert.ok(genererDictee(1).bonneReponse.length <= 5);
    assert.ok(genererDictee(2).bonneReponse.length >= 6);
  }
});

test("dictée niveau 3 : les mauvaises phrases ne diffèrent que d'un mot", () => {
  for (let k = 0; k < ESSAIS; k++) {
    const q = genererDictee(3);
    assert.ok(PHRASES.some((p) => p.phrase === q.bonneReponse));
    for (const c of q.choix) {
      const a = c.split(" ");
      const b = q.bonneReponse.split(" ");
      assert.equal(a.length, b.length);
      assert.ok(a.filter((mot, i) => mot !== b[i]).length <= 1);
    }
  }
});

// ----- Heure -----

test("ecrireHeure écrit comme à l'école", () => {
  assert.equal(ecrireHeure(3, 0), "3 h");
  assert.equal(ecrireHeure(3, 30), "3 h 30");
  assert.equal(ecrireHeure(12, 15), "12 h 15");
});

test("les aiguilles sont au bon endroit", () => {
  assert.deepEqual(anglesAiguilles(12, 0), { heures: 0, minutes: 0 });
  assert.deepEqual(anglesAiguilles(3, 0), { heures: 90, minutes: 0 });
  // À 3 h 30, la petite aiguille est entre le 3 et le 4.
  assert.deepEqual(anglesAiguilles(3, 30), { heures: 105, minutes: 180 });
  assert.deepEqual(anglesAiguilles(9, 45), { heures: 292.5, minutes: 270 });
});

test("l'horloge dessinée contient les 12 chiffres", () => {
  const svg = horlogeSVG(3, 0);
  for (let n = 1; n <= 12; n++) assert.ok(svg.includes(`>${n}</text>`));
});

test("heure : minutes pile au niveau 1, demies au niveau 2, quarts au niveau 3", () => {
  const minutes = (texte) => Number(texte.split(" h ")[1] ?? 0);
  for (let k = 0; k < ESSAIS; k++) {
    assert.equal(minutes(genererHeure(1).bonneReponse), 0);
    assert.ok([0, 30].includes(minutes(genererHeure(2).bonneReponse)));
    assert.ok([0, 15, 30, 45].includes(minutes(genererHeure(3).bonneReponse)));
  }
});

test("heure : chaque question a une horloge", () => {
  assert.ok(genererHeure(1).illustration.startsWith("<svg"));
});

// ----- Formes -----

test("formes : la réponse correspond au dessin", () => {
  for (let k = 0; k < ESSAIS; k++) {
    const q = genererForme(2);
    assert.ok(q.illustration.includes(FORMES[q.bonneReponse]));
  }
});

test("formes niveau 3 : on compte le bon nombre de formes", () => {
  for (let k = 0; k < ESSAIS; k++) {
    const q = genererForme(3);
    const cible = q.cle.replace(/\d+$/, "");
    const compte = [...q.enonce].filter((c) => c === cible).length;
    assert.equal(compte, q.bonneReponse);
  }
});

// ----- Jours et mois -----

test("7 jours et 12 mois", () => {
  assert.equal(JOURS.length, 7);
  assert.equal(MOIS.length, 12);
});

test("après dimanche vient lundi, avant janvier vient décembre", () => {
  const vu = { dimanche: false, janvier: false };
  for (let k = 0; k < 3000 && !(vu.dimanche && vu.janvier); k++) {
    const q1 = genererCalendrier(1);
    if (q1.cle === "après-dimanche") {
      assert.equal(q1.bonneReponse, "lundi");
      vu.dimanche = true;
    }
    const q3 = genererCalendrier(3);
    if (q3.cle === "avant-janvier") {
      assert.equal(q3.bonneReponse, "décembre");
      vu.janvier = true;
    }
  }
  assert.ok(vu.dimanche && vu.janvier);
});

test("jours et mois : la bonne réponse suit (ou précède) bien", () => {
  for (let k = 0; k < ESSAIS; k++) {
    const q = genererCalendrier((k % 3) + 1);
    const [sens, depart] = q.cle.split("-");
    const liste = JOURS.includes(depart) ? JOURS : MOIS;
    const i = liste.indexOf(depart);
    const attendu = liste[(i + (sens === "après" ? 1 : -1) + liste.length) % liste.length];
    assert.equal(q.bonneReponse, attendu);
    assert.ok(!q.choix.includes(depart), "le mot de départ n'est pas proposé");
  }
});
