module.exports = {
  root: false,
  env: { node: true, es2023: true },
  extends: ["eslint:recommended", "plugin:node/recommended"],
  ignorePatterns: ["database", "coverage", ".eslintrc.cjs"],
  parserOptions: { ecmaVersion: 12, sourceType: "module" },
  plugins: [],
  rules: {
    "no-unused-vars": ["error", { args: "all", argsIgnorePattern: "^_" }],
    "node/no-unsupported-features/es-syntax": "off",
    "node/no-unpublished-import": "off",
    "node/no-missing-import": [
      "error",
      {
        allowModules: ["ava"],
      },
    ],
  },
};
