const js = require('@eslint/js');

module.exports = [
    js.configs.recommended,
    {
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'commonjs',
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
                setTimeout: 'readonly',
                clearTimeout: 'readonly',
                setInterval: 'readonly',
                clearInterval: 'readonly',
                setImmediate: 'readonly',
                clearImmediate: 'readonly',

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
                varsIgnorePattern: '^(req|res|next)$' // Common Express.js unused vars
            }],
            'no-console': 'off', // Console is commonly used in backend
            'prefer-const': 'error',
            'no-var': 'error',

            // Node.js specific rules
            'no-path-concat': 'error',
            'no-process-exit': 'warn',

            // Best practices for Node.js
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

            // Security-related rules
            'no-eval': 'error',
            'no-implied-eval': 'error',
            'no-new-func': 'error'
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
                varsIgnorePattern: '^(request|app|db|insertStmt)$'
            }]
        }
    },
    {
        ignores: [
            'node_modules/**',
            'dist/**',
            'coverage/**'
        ]
    }
];
