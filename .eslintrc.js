module.exports = {
  root: true,
  env: {
    browser: true,   // for React Native
    es2021: true,    // latest JS features
    node: true,      // allow Node globals like __dirname
  },
  extends: [
    "eslint:recommended",      // base recommended rules
    "plugin:react/recommended", // React rules
    "plugin:react-native/all",  // React Native rules
  ],
  parserOptions: {
    ecmaVersion: 12,      // modern JS
    sourceType: "module", // use import/export
    ecmaFeatures: {
      jsx: true,          // enable JSX
    },
  },
  plugins: [
    "react",
    "react-native",
  ],
  rules: {
    // Common style rules you can tweak:
    semi: ["error", "always"],         // require semicolons
    quotes: ["error", "double"],       // enforce double quotes
    "no-unused-vars": ["warn"],        // warn instead of error for unused vars
    "react/prop-types": "off",         // turn off if not using PropTypes
    "react-native/no-inline-styles": "off", // inline styles are common in RN
  },
  settings: {
    react: {
      version: "detect", // auto-detect React version
    },
  },
};
