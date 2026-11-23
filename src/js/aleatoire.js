// Outils de hasard utilisés par tous les exercices.
// Chaque fonction accepte un paramètre "hasard" (par défaut Math.random) :
// cela permet aux tests de remplacer le hasard par des valeurs prévisibles.

/**
 * Renvoie un entier entre min et max (inclus).
 * Exemple : entierAleatoire(1, 6) se comporte comme un dé.
 */
export function entierAleatoire(min, max, hasard = Math.random) {
  // hasard() donne un nombre entre 0 (inclus) et 1 (exclu).
  // On l'étire sur la plage voulue puis on arrondit vers le bas.
  return Math.floor(hasard() * (max - min + 1)) + min;
}

/**
 * Renvoie une COPIE du tableau, mélangée (algorithme de Fisher-Yates).
 * Sert à placer la bonne réponse à une position aléatoire.
 */
export function melanger(tableau, hasard = Math.random) {
  const copie = [...tableau]; // "..." copie le tableau pour ne pas modifier l'original
  for (let i = copie.length - 1; i > 0; i--) {
    const j = entierAleatoire(0, i, hasard);
    // Échange des cases i et j en une ligne.
    [copie[i], copie[j]] = [copie[j], copie[i]];
  }
  return copie;
}

/**
 * Crée un "tireur" qui pioche dans une liste sans jamais renvoyer
 * deux fois de suite le même élément (règle anti-répétition).
 *
 * Exemple :
 *   const tirer = creerTireurSansRepetition(["a", "b", "c"]);
 *   tirer(); // "b"
 *   tirer(); // jamais "b" ici
 *
 * "egal" permet de dire quand deux éléments sont identiques
 * (utile pour des questions qui sont des objets).
 */
export function creerTireurSansRepetition(
  elements,
  { hasard = Math.random, egal = (a, b) => a === b } = {},
) {
  if (elements.length === 0) {
    throw new Error("La liste est vide : impossible de tirer un élément.");
  }
  let precedent; // dernier élément renvoyé (undefined au départ)
  let premierTirage = true;

  return function tirer() {
    // On garde seulement les éléments différents du précédent.
    // S'il n'y a qu'un seul élément possible, on n'a pas le choix.
    const candidats = premierTirage
      ? elements
      : elements.filter((e) => !egal(e, precedent));
    const choix = candidats.length > 0 ? candidats : elements;

    precedent = choix[entierAleatoire(0, choix.length - 1, hasard)];
    premierTirage = false;
    return precedent;
  };
}
