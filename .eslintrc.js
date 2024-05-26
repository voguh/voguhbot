/*! *****************************************************************************
Copyright 2024 Voguh

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
***************************************************************************** */

module.exports = {
  env: {
    node: true
  },
  extends: ['standard', 'plugin:@typescript-eslint/recommended', 'plugin:prettier/recommended', 'prettier'],
  parser: '@typescript-eslint/parser',
  plugins: ['import', '@typescript-eslint', 'prettier', 'eslint-plugin-import-helpers'],
  rules: {
    'prettier/prettier': 'warn',

    /* ============================ TYPESCRIPT ============================ */
    '@typescript-eslint/explicit-function-return-type': ['warn', { allowExpressions: true }],

    /* Enable any type */
    '@typescript-eslint/no-explicit-any': 'off',

    /* Enable empty functions */
    '@typescript-eslint/no-empty-function': 'off',

    /* Enable require */
    '@typescript-eslint/no-var-requires': 'off',

    // "@typescript-eslint/explicit-module-boundary-types": "off",
    /* ========================== END TYPESCRIPT ========================== */

    /* ============================== IMPORT ============================== */
    'import/newline-after-import': 'warn',

    /* Enable devDependencies import */
    // "import/no-extraneous-dependencies": "off",

    /* Disable force default export */
    // "import/prefer-default-export": "off",

    /* Disable need of extension */
    // "import/extensions": "off",
    // "import/no-unresolved": "off",

    /* Enable and add import order helpers */
    'import-helpers/order-imports': [
      'warn',
      {
        newlinesBetween: 'always',
        groups: ['/^node:/', 'module', '/^voguhbot/', ['parent', 'sibling', 'index']],
        alphabetize: { order: 'asc', ignoreCase: true }
      }
    ],
    /* ============================ END IMPORT ============================ */

    /* ============================== COMMON ============================== */
    'prefer-const': 'warn',

    'array-callback-return': 'off',

    /* Enable use of globals */
    // "no-restricted-globals": "off",

    /* Disable force compact arrow functions */
    // "arrow-body-style": "off",

    /* Enable nameless functions */
    // "func-names": "off",

    /* Enable plus plus */
    // "no-plusplus": "off",

    /* Disable object new life forced */
    // "object-curly-newline": "off",

    /* Disable error on class methods without this */
    // "class-methods-use-this": "off",

    /* Fix unused vars */
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': [
      'warn',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }
    ],

    /* Fix use before define */
    'no-use-before-define': 'off',
    '@typescript-eslint/no-use-before-define': 'error',

    /* Enable empty constructors */
    'no-useless-constructor': 'off',

    /* Remove need for empty line in classes */
    // "lines-between-class-members": "off",

    'object-shorthand': 'off'
    /* ============================ END COMMON ============================ */
  }
}
