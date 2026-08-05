import js from '@eslint/js';
import globals from 'globals';
import prettier from 'eslint-config-prettier/flat';

export default [
    js.configs.recommended,
    {
        languageOptions: {
            ecmaVersion: 2024,
            sourceType: 'module',
            globals: {
                ...globals.browser,
                ...globals.node
            }
        },
        rules: {
            'no-unused-vars': 'warn'
        }
    },
    {
        ignores: ['public/**', 'coverage/**', 'test/**', '*.config.js']
    },
    prettier
];
