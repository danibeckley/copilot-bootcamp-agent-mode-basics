const js = require('@eslint/js');

module.exports = [
    js.configs.recommended,
    {
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            globals: {
                // Node.js globals
                process: 'readonly',
                Buffer: 'readonly',
                __dirname: 'readonly',
                __filename: 'readonly',
                global: 'readonly',
                module: 'readonly',
                require: 'readonly',
                exports: 'readonly',
                console: 'readonly',

                // Browser globals
                window: 'readonly',
                document: 'readonly',
                navigator: 'readonly',
                fetch: 'readonly',

                // Jest globals
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
                varsIgnorePattern: '^(React|App)$'
            }],
            'no-console': 'off',
            'prefer-const': 'error',
            'no-var': 'error',

            // Formatting rules (handled by Prettier)
            'indent': 'off',
            'quotes': 'off',
            'semi': 'off',
            'comma-dangle': 'off',
            'max-len': 'off',

            // Best practices
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
            'radix': 'error'
        }
    },
    {
        // React-specific configuration for frontend
        files: ['packages/frontend/**/*.{js,jsx}'],
        languageOptions: {
            parserOptions: {
                ecmaFeatures: {
                    jsx: true
                }
            },
            globals: {
                React: 'readonly',
                ReactDOM: 'readonly'
            }
        },
        rules: {
            // React rules - allow React and component imports that might not be explicitly used
            'no-unused-vars': ['error', {
                argsIgnorePattern: '^_',
                varsIgnorePattern: '^(React|App)$'
            }]
        }
    },
    {
        // Node.js specific configuration for backend
        files: ['packages/backend/**/*.js'],
        languageOptions: {
            sourceType: 'commonjs'
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
                varsIgnorePattern: '^(React|App|screen|render|waitFor|fireEvent|userEvent|act)$'
            }]
        }
    },
    {
        // Ignore patterns
        ignores: [
            'node_modules/**',
            'packages/*/node_modules/**',
            'packages/frontend/build/**',
            'packages/backend/dist/**',
            '*.config.js'
        ]
    }
];
