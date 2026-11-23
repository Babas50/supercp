// Configuration d'ESLint, le "linter" : un outil qui relit le code
// et signale les erreurs probables (variable mal écrite, code inutile...).
import js from "@eslint/js";
import globals from "globals";

export default [
  // On part des règles recommandées par ESLint.
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module", // nos fichiers utilisent import / export
      // Déclare les variables fournies par le navigateur (window, document...)
      // et par Node.js (pour les tests), sinon ESLint les croit inconnues.
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      // Une variable déclarée mais jamais utilisée est une erreur.
      "no-unused-vars": "error",
    },
  },
];
