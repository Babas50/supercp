// Point d'entrée de l'application : construit l'écran d'accueil.
// Les activités seront branchées aux étapes suivantes.

// Liste des matières : nom affiché, icône (emoji) et couleur de la tuile.
const MATIERES = [
  { id: "lettres", nom: "Lettres", icone: "🔤", couleur: "#e74c3c" },
  { id: "chiffres", nom: "Chiffres", icone: "🔢", couleur: "#e67e22" },
  { id: "mots", nom: "Mots", icone: "📖", couleur: "#d4a20b" },
  { id: "phrases", nom: "Phrases", icone: "✏️", couleur: "#2ecc71" },
  { id: "additions", nom: "Additions", icone: "➕", couleur: "#1abc9c" },
  { id: "soustractions", nom: "Soustractions", icone: "➖", couleur: "#3498db" },
  { id: "anglais", nom: "Anglais", icone: "🇬🇧", couleur: "#9b59b6" },
  { id: "memory", nom: "Memory", icone: "🃏", couleur: "#e84393" },
  { id: "dictee", nom: "Dictée", icone: "👂", couleur: "#16a085" },
  { id: "heure", nom: "L'heure", icone: "🕒", couleur: "#d35400" },
  { id: "formes", nom: "Formes", icone: "🔺", couleur: "#2980b9" },
  { id: "calendrier", nom: "Jours et mois", icone: "📅", couleur: "#8e44ad" },
];

const zoneMatieres = document.getElementById("matieres");
const zoneMessage = document.getElementById("message");

for (const matiere of MATIERES) {
  const bouton = document.createElement("button");
  bouton.type = "button";
  bouton.className = "tuile";
  bouton.style.background = matiere.couleur;
  // aria-hidden : l'icône décorative n'est pas lue par les lecteurs d'écran.
  bouton.innerHTML = `<span class="icone" aria-hidden="true">${matiere.icone}</span>${matiere.nom}`;
  bouton.addEventListener("click", () => {
    zoneMessage.textContent = `${matiere.nom} : bientôt disponible !`;
  });
  zoneMatieres.appendChild(bouton);
}
