# Lambda esbuild packaging for `@cookbook/shared`

## Problem

The server package imports shared request/response schemas and DTOs with package imports:

```ts
import { LoginRequestSchema } from "@cookbook/shared";
```

This is correct for an npm workspace, but it creates a deployment concern. The compiled server output still contains
bare imports from `@cookbook/shared`. If Lambda receives only `packages/server/dist`, Node must still be able to
resolve `@cookbook/shared` at runtime.

That means one of these must be true:

- `@cookbook/shared` is bundled into the Lambda handler output.
- `@cookbook/shared` is present in the Lambda deployment artifact under `node_modules`.
- `@cookbook/shared` is present in an attached Lambda layer under `nodejs/node_modules`.

The simplest approach for this project is to let SAM use esbuild and bundle each handler.

## What esbuild does

When SAM builds a Node.js Lambda with `BuildMethod: esbuild`, esbuild starts at the handler entrypoint and follows
imports. If the handler imports server code, and server code imports `@cookbook/shared`, esbuild can include the used
shared code in the Lambda output bundle.

That avoids relying on workspace symlinks or manually copying `packages/shared` into the deployment artifact.

## Expected workflow

The CI/deploy build should install workspace dependencies from the repo root, then build shared before SAM builds the
server package:

```sh
npm ci
npm run build -w @cookbook/shared
cd packages/server
sam build --template-file template.yaml
sam deploy --template-file .aws-sam/build/template.yaml
```

Building shared first matters because `packages/shared/package.json` points its package entrypoints at `dist`:

```json
{
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  }
}
```

On a clean GitHub Actions runner, `packages/shared/dist` will not exist until this build runs.

## Template shape

Instead of compiling the whole server package to `dist` and setting every Lambda to `CodeUri: ./dist/`, each Lambda
function should point SAM/esbuild at its TypeScript entrypoint.

The shape is:

```yaml
SomeFunction:
  Type: AWS::Serverless::Function
  Properties:
    CodeUri: ./
    Handler: src/handlers/auth/LoginHandler.handler
    Runtime: nodejs24.x
  Metadata:
    BuildMethod: esbuild
    BuildProperties:
      Format: esm
      Target: es2022
      Sourcemap: true
      EntryPoints:
        - src/handlers/auth/LoginHandler.ts
```

The exact handler path must match the exported function name in the handler file.

## What not to rely on

Do not rely on `CodeUri: ./dist/` by itself unless the deployed artifact also contains runtime dependencies. The server
`dist` output can still contain imports such as:

```js
import { LoginRequestSchema } from "@cookbook/shared";
```

Lambda cannot resolve that unless the module is bundled, copied into `node_modules`, or supplied by a layer.

Also, switching server/web dependencies from:

```json
"@cookbook/shared": "*"
```

to:

```json
"@cookbook/shared": "file:../shared"
```

is not the main fix. This repo already uses npm workspaces, and npm links `@cookbook/shared` locally. The deployment
problem is that Lambda needs deployable JavaScript, not a workspace relationship from the source repo.

## Notes

- Bundling is usually simpler than a Lambda layer for this shared package.
- A Lambda layer is useful if many functions need the same large dependency and the layer versioning overhead is worth it.
- Vite has a similar idea on the frontend: it bundles imported shared code into the static web build.
- If esbuild externalizes a dependency, that dependency must be available at runtime through `node_modules` or a layer.

References:

- AWS SAM esbuild TypeScript builds: https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-using-build-typescript.html
- AWS Lambda Node.js deployment packages: https://docs.aws.amazon.com/lambda/latest/dg/nodejs-package.html
- AWS Lambda Node.js layers: https://docs.aws.amazon.com/lambda/latest/dg/nodejs-layers.html
