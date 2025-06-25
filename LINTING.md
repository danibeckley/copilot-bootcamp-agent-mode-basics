# Pre-commit Hook Setup

This repository includes ESLint and Prettier for code quality and formatting. 

## Available Scripts

### Linting
- `npm run lint` - Run ESLint on the entire codebase
- `npm run lint:fix` - Run ESLint and automatically fix issues
- `npm run lint:frontend` - Run ESLint only on frontend code
- `npm run lint:backend` - Run ESLint only on backend code

### Formatting
- `npm run format` - Format all code with Prettier
- `npm run format:check` - Check if code is properly formatted
- `npm run format:frontend` - Format only frontend code
- `npm run format:backend` - Format only backend code

## VS Code Integration

The repository includes VS Code settings that will:
- Auto-format files on save using Prettier
- Auto-fix ESLint issues on save
- Show linting errors in the editor

Make sure you have the following VS Code extensions installed:
- ESLint (dbaeumer.vscode-eslint)
- Prettier - Code formatter (esbenp.prettier-vscode)

## Pre-commit Workflow

Before committing code, run:
```bash
npm run lint:fix
npm run format
npm test
```

Or simply run:
```bash
npm run lint && npm run format:check && npm test
```

## Configuration Files

- `eslint.config.js` - ESLint configuration
- `.prettierrc` - Prettier configuration  
- `.prettierignore` - Files to ignore for Prettier
- `.vscode/settings.json` - VS Code editor settings
- `.vscode/extensions.json` - Recommended VS Code extensions
