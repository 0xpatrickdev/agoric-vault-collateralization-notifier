module.exports = {
  root: true,
  env: { es2023: true },
  extends: ["eslint:recommended"],
  ignorePatterns: [".eslintrc.cjs"],
  parserOptions: { ecmaVersion: 12, sourceType: "module" },
  plugins: [],
  rules: {
    "no-unused-vars": [
      "error",
      { vars: "all", args: "all", argsIgnorePattern: "^_" },
    ],
  },
};
