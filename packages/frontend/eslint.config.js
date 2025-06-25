const js = require('@eslint/js');

module.exports = [
    js.configs.recommended,
    {
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            parserOptions: {
                ecmaFeatures: {
                    jsx: true
                }
            },
            globals: {
                // Browser globals
                window: 'readonly',
                document: 'readonly',
                navigator: 'readonly',
                fetch: 'readonly',
                localStorage: 'readonly',
                sessionStorage: 'readonly',
                console: 'readonly',

                // React globals
                React: 'readonly',
                ReactDOM: 'readonly',

                // Jest globals for testing
                describe: 'readonly',
                it: 'readonly',
                test: 'readonly',
                expect: 'readonly',
                beforeAll: 'readonly',
                afterAll: 'readonly',
                beforeEach: 'readonly',
                afterEach: 'readonly',
                jest: 'readonly'
            }
        },
        rules: {
            // General rules
            'no-unused-vars': ['error', {
                argsIgnorePattern: '^_',
                varsIgnorePattern: '^(React|ReactDOM|App)$'
            }],
            'no-console': 'warn', // Allow console but warn
            'prefer-const': 'error',
            'no-var': 'error',

            // React-specific rules
            'react-hooks/rules-of-hooks': 'off', // We don't have the plugin, but this would be 'error'
            'react-hooks/exhaustive-deps': 'off', // We don't have the plugin, but this would be 'warn'

            // Best practices for React
            'eqeqeq': ['error', 'always'],
            'no-eval': 'error',
            'no-implied-eval': 'error',
            'no-new-func': 'error',
            'no-return-assign': 'error',
            'no-sequences': 'error',
            'no-throw-literal': 'error',
            'no-unmodified-loop-condition': 'error',
            'no-unused-expressions': 'error',
            'no-useless-concat': 'error',
            'no-useless-return': 'error',
            'radix': 'error',

            // JSX-specific rules
            'no-undef': 'error'
        }
    },
    {
        // Test files configuration
        files: ['**/__tests__/**/*.js', '**/*.test.js', '**/*.spec.js'],
        rules: {
            // Allow more flexible rules in tests
            'no-unused-expressions': 'off',
            'no-unused-vars': ['error', {
                argsIgnorePattern: '^_',
                varsIgnorePattern: '^(React|ReactDOM|App|screen|render|waitFor|fireEvent|userEvent|act|rest|setupServer)$'
            }]
        }
    },
    {
        ignores: [
            'build/**',
            'node_modules/**',
            'coverage/**',
            'public/**'
        ]
    }
];
