# cookbook-app

Early monorepo setup for a cookbook application. The project is organized into separate packages for the web app, server, and shared code, with TypeScript tooling configured at the workspace level.

## Current structure

- `packages/web`: React 19 + Vite frontend. Right now this is mostly the starter UI with custom styling and assets.
- `packages/server`: TypeScript server package. The package exists and is wired into the workspace, but the entry point is still empty.
- `packages/shared`: Shared TypeScript package intended for common types / DTOs. It is scaffolded but does not contain much yet.

## Tooling

- npm workspaces
- TypeScript
- ESLint
- Prettier
- Jest
- Vite for the web app
- ts-mockito
- SAM for AWS deployment

## Scripts

From the repo root:

- `npm install`: install workspace dependencies
- `npm run build`: build `shared`, `server`, and `web`
- `npm run compile`: run tests, linting, type checks, and builds across packages
- `npm run lint`: run ESLint
- `npm run typecheck`: run TypeScript checks across workspaces
- `npm test`: run Jest

Web package:

- `npm run dev -w @cookbook/web`: start the Vite dev server
- `npm run build -w @cookbook/web`: build the frontend

## Status

This repo is still at the scaffold stage. The frontend is the only package with visible app code right now, while the server and shared packages are in place for the next round of implementation.
