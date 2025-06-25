# ESLint and Prettier Setup

This repository includes ESLint and Prettier for code quality and formatting, with configurations at both the root level and individual package levels.

## Package-Level Configuration

Each package (frontend and backend) has its own ESLint and Prettier configuration files:

### Frontend Package
- `packages/frontend/eslint.config.js` - React-specific ESLint rules
- `packages/frontend/.prettierrc` - Frontend Prettier configuration

### Backend Package  
- `packages/backend/eslint.config.js` - Node.js-specific ESLint rules
- `packages/backend/.prettierrc` - Backend Prettier configuration

## Available Scripts

### Root Level Scripts
- `npm run lint` - Run ESLint on all packages
- `npm run lint:fix` - Run ESLint and automatically fix issues on all packages
- `npm run format` - Format all packages with Prettier
- `npm run format:check` - Check if all packages are properly formatted

### Individual Package Scripts
- `npm run lint:frontend` - Run ESLint only on frontend code
- `npm run lint:backend` - Run ESLint only on backend code
- `npm run lint:fix:frontend` - Auto-fix ESLint issues in frontend
- `npm run lint:fix:backend` - Auto-fix ESLint issues in backend
- `npm run format:frontend` - Format only frontend code
- `npm run format:backend` - Format only backend code
- `npm run format:check:frontend` - Check frontend formatting
- `npm run format:check:backend` - Check backend formatting

### Package-Level Scripts
You can also run commands directly in each package:

#### Frontend Package
```bash
cd packages/frontend
npm run lint
npm run lint:fix
npm run format
npm run format:check
```

#### Backend Package
```bash
cd packages/backend
npm run lint
npm run lint:fix
npm run format
npm run format:check
```

## Configuration Details

### Frontend ESLint Configuration
- React and JSX support
- Browser globals (window, document, fetch, etc.)
- Jest testing globals
- React-specific variable allowances
- Console warnings (allowed but warned)

### Backend ESLint Configuration
- Node.js CommonJS modules
- Node.js globals (process, Buffer, __dirname, etc.)
- Express.js common patterns
- Jest testing globals
- Console statements allowed (common in backend)

## VS Code Integration

The repository includes VS Code settings that will:
- Auto-format files on save using Prettier
- Auto-fix ESLint issues on save
- Show linting errors in the editor
- Work with both package-level configurations

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

### Root Level
- `.vscode/settings.json` - VS Code editor settings
- `.vscode/extensions.json` - Recommended VS Code extensions

### Frontend Package
- `packages/frontend/eslint.config.js` - Frontend ESLint configuration
- `packages/frontend/.prettierrc` - Frontend Prettier configuration

### Backend Package
- `packages/backend/eslint.config.js` - Backend ESLint configuration  
- `packages/backend/.prettierrc` - Backend Prettier configuration
