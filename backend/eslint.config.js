const globals = require('globals');

module.exports = [
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: {
        ...globals.node,
        ...globals.es2021,
      },
    },
    rules: {
      // Possible Problems
      'no-console': 'off', // Allow console for backend logging
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }],
      'no-undef': 'error',
      'no-constant-condition': 'warn',
      'no-dupe-keys': 'error',
      'no-duplicate-case': 'error',
      'no-empty': 'warn',
      'no-extra-semi': 'error',
      'no-func-assign': 'error',
      'no-irregular-whitespace': 'error',
      'no-unreachable': 'error',
      'valid-typeof': 'error',

      // Best Practices
      'eqeqeq': ['error', 'always'],
      'curly': ['error', 'all'],
      'default-case': 'warn',
      'dot-notation': 'warn',
      'no-alert': 'error',
      'no-caller': 'error',
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-return-await': 'warn',
      'no-useless-return': 'warn',
      'require-await': 'warn',
      'no-var': 'error',
      'prefer-const': 'warn',
      'prefer-arrow-callback': 'warn',

      // Code Style
      'indent': ['error', 2, { SwitchCase: 1 }],
      'quotes': ['error', 'single', { avoidEscape: true }],
      'semi': ['error', 'always'],
      'comma-dangle': ['error', 'always-multiline'],
      'object-curly-spacing': ['error', 'always'],
      'array-bracket-spacing': ['error', 'never'],
      'space-before-blocks': 'error',
      'keyword-spacing': 'error',
      'space-infix-ops': 'error',
      'eol-last': ['error', 'always'],
      'no-trailing-spaces': 'error',
      'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 0 }],
      'brace-style': ['error', '1tbs', { allowSingleLine: true }],
      'camelcase': ['warn', { properties: 'never' }],
      'max-len': ['warn', { code: 120, ignoreStrings: true, ignoreTemplateLiterals: true }],

      // Node.js Specific
      'no-path-concat': 'error',
      'handle-callback-err': 'warn',
    },
  },
  {
    files: ['**/__tests__/**/*.js', '**/*.test.js', '**/*.spec.js'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.es2021,
        ...globals.jest,
      },
    },
  },
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'build/**',
      'coverage/**',
      '*.config.js',
      'prisma/migrations/**',
    ],
  },
];
