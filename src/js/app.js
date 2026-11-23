// Point d'entrée de l'application : gère les écrans et le déroulement du jeu.

import { repondre, ajouterEtoiles, sansRepetition, DELAI_BLOCAGE_MS } from "./moteur/question.js";
import { genererAddition, genererSoustraction } from "./matieres/calcul.js";
import { lire } from "./voix.js";
import { sonBravo, sonErreur } from "./son.js";

// Liste des matières : nom affiché, icône (emoji), couleur de la tuile
// et "generer" = la fonction qui fabrique une question (absente = pas encore prête).
const MATIERES = [
  { id: "lettres", nom: "Lettres", icone: "🔤", couleur: "#e74c3c" },
  { id: "chiffres", nom: "Chiffres", icone: "🔢", couleur: "#e67e22" },
  { id: "mots", nom: "Mots", icone: "📖", couleur: "#d4a20b" },
  { id: "phrases", nom: "Phrases", icone: "✏️", couleur: "#2ecc71" },
  { id: "additions", nom: "Additions", icone: "➕", couleur: "#1abc9c", generer: genererAddition },
  { id: "soustractions", nom: "Soustractions", icone: "➖", couleur: "#3498db", generer: genererSoustraction },
  { id: "anglais", nom: "Anglais", icone: "🇬🇧", couleur: "#9b59b6" },
  { id: "memory", nom: "Memory", icone: "🃏", couleur: "#e84393" },
  { id: "dictee", nom: "Dictée", icone: "👂", couleur: "#16a085" },
  { id: "heure", nom: "L'heure", icone: "🕒", couleur: "#d35400" },
  { id: "formes", nom: "Formes", icone: "🔺", couleur: "#2980b9" },
  { id: "calendrier", nom: "Jours et mois", icone: "📅", couleur: "#8e44ad" },
];

const NIVEAUX = [
  { numero: 1, nom: "Niveau 1 🐣", couleur: "#2ecc71" },
  { numero: 2, nom: "Niveau 2 🐥", couleur: "#f39c12" },
  { numero: 3, nom: "Niveau 3 🦅", couleur: "#e74c3c" },
];

const BRAVOS = ["Bravo !", "Super !", "Génial !", "Excellent !", "Trop fort !"];

// Raccourci pour trouver un élément de la page par son id.
const $ = (id) => document.getElementById(id);

// État du jeu en cours.
let etoiles = 0;
let questionSuivante = null; // fonction qui donne la prochaine question
let question = null; // question affichée
let minuteur = null; // délai en attente (passage à la question suivante, déblocage)

// ---------- Navigation entre les écrans ----------

function afficherEcran(id) {
  for (const ecran of document.querySelectorAll("main > section")) {
    ecran.hidden = ecran.id !== id;
  }
}

function retourAccueil() {
  clearTimeout(minuteur);
  window.speechSynthesis?.cancel(); // "?." : seulement si la synthèse vocale existe
  $("message-accueil").textContent = "";
  afficherEcran("ecran-accueil");
}

// ---------- Écran d'accueil ----------

for (const matiere of MATIERES) {
  const bouton = document.createElement("button");
  bouton.type = "button";
  bouton.className = "tuile";
  bouton.style.background = matiere.couleur;
  // aria-hidden : l'icône décorative n'est pas lue par les lecteurs d'écran.
  bouton.innerHTML = `<span class="icone" aria-hidden="true">${matiere.icone}</span>${matiere.nom}`;
  bouton.addEventListener("click", () => {
    if (matiere.generer) {
      afficherNiveaux(matiere);
    } else {
      $("message-accueil").textContent = `${matiere.nom} : bientôt disponible !`;
    }
  });
  $("matieres").appendChild(bouton);
}

for (const bouton of document.querySelectorAll("[data-retour]")) {
  bouton.addEventListener("click", retourAccueil);
}

// ---------- Choix du niveau ----------

function afficherNiveaux(matiere) {
  $("titre-niveaux").textContent = `${matiere.icone} ${matiere.nom} : choisis ton niveau`;
  const zone = $("niveaux");
  zone.innerHTML = ""; // vide les boutons de la matière précédente
  for (const niveau of NIVEAUX) {
    const bouton = document.createElement("button");
    bouton.type = "button";
    bouton.className = "tuile";
    bouton.style.background = niveau.couleur;
    bouton.textContent = niveau.nom;
    bouton.addEventListener("click", () => demarrer(matiere, niveau.numero));
    zone.appendChild(bouton);
  }
  afficherEcran("ecran-niveaux");
}

// ---------- Jeu ----------

function demarrer(matiere, niveau) {
  // sansRepetition : jamais deux fois la même question de suite.
  questionSuivante = sansRepetition(() => matiere.generer(niveau));
  afficherEcran("ecran-jeu");
  poserQuestion();
}

function poserQuestion() {
  question = questionSuivante();
  $("enonce").textContent = question.enonce;
  $("message-jeu").textContent = "";
  const zone = $("reponses");
  zone.innerHTML = "";
  zone.classList.remove("bloquee");
  for (const choix of question.choix) {
    const bouton = document.createElement("button");
    bouton.type = "button";
    bouton.className = "reponse";
    bouton.textContent = choix;
    bouton.dataset.valeur = String(choix); // garde la valeur pour la retrouver plus tard
    bouton.addEventListener("click", () => cliquer(choix, bouton));
    zone.appendChild(bouton);
  }
  lire(question.aLire);
}

function boutonsReponse() {
  return [...$("reponses").querySelectorAll(".reponse")];
}

function changerEtoiles(delta) {
  etoiles = ajouterEtoiles(etoiles, delta);
  const score = document.querySelector(".score");
  $("etoiles").textContent = etoiles;
  // Relance l'animation : on retire la classe, on force le navigateur
  // à recalculer (offsetWidth), puis on la remet.
  score.classList.remove("change");
  void score.offsetWidth;
  score.classList.add("change");
}

function cliquer(choix, bouton) {
  const resultat = repondre(question, choix);
  if (resultat.type === "ignore") return; // clic refusé par l'anti-triche

  changerEtoiles(resultat.etoiles);

  if (resultat.type === "bonne") {
    bouton.classList.add("juste");
    for (const b of boutonsReponse()) b.disabled = true;
    const bravo = BRAVOS[Math.floor(Math.random() * BRAVOS.length)];
    $("message-jeu").textContent = `${bravo} ⭐`;
    sonBravo();
    lire(bravo);
    minuteur = setTimeout(poserQuestion, 1500);
    return;
  }

  // Mauvaise réponse : ce bouton est grisé pour de bon.
  bouton.classList.add("fausse");
  bouton.disabled = true;
  sonErreur();

  if (resultat.type === "revelee") {
    // 2e erreur : on montre la bonne réponse, puis question suivante.
    for (const b of boutonsReponse()) {
      b.disabled = true;
      if (b.dataset.valeur === String(question.bonneReponse)) b.classList.add("juste");
    }
    const texte = `La bonne réponse était ${question.bonneReponse}.`;
    $("message-jeu").textContent = texte;
    lire(texte);
    minuteur = setTimeout(poserQuestion, 3000);
    return;
  }

  // 1re erreur : message doux et blocage de tous les boutons pendant 1 seconde.
  $("message-jeu").textContent = "Presque ! Essaie encore.";
  lire("Presque ! Essaie encore.");
  const zone = $("reponses");
  zone.classList.add("bloquee");
  for (const b of boutonsReponse()) b.disabled = true;
  minuteur = setTimeout(() => {
    zone.classList.remove("bloquee");
    for (const b of boutonsReponse()) {
      b.disabled = question.desactives.has(b.dataset.valeur);
    }
  }, DELAI_BLOCAGE_MS);
}

$("ecouter").addEventListener("click", () => lire(question.aLire));
