import js from '@eslint/js';

/**
 * Shared ESLint flat-config base for all workspace packages.
 *
 * Placeholder for Step 1 — TypeScript type-aware rules, Astro, and
 * Next/Payload presets are layered on in later steps.
 *
 * @type {import('eslint').Linter.Config[]}
 */
export default [
  js.configs.recommended,
  {
    files: ['**/*.{js,mjs,cjs,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
    },
  },
];
