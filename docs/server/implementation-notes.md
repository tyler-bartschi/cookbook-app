# Implementation Notes

## Package Boundaries

`@cookbook/shared` contains network contracts and DTO schemas. Server handlers import those contracts for validation and typing. The shared package is built separately and exported from `packages/shared/dist`.

`@cookbook/server` owns:

- AWS Lambda handlers.
- Business services.
- DynamoDB DAOs.
- S3 storage adapter.
- Server-only entity models.
- HTTP response and validation utilities.

The server package imports `@cookbook/shared` through the npm workspace dependency.

## Deployment Build Model

The SAM template builds each Lambda handler with esbuild:

- `CodeUri: ./`
- handler path such as `src/handlers/auth/LoginHandler.handler`
- `BuildMethod: esbuild`
- ESM output with `.mjs`
- TypeScript entrypoint per handler

The notes mention why this matters: compiled server output can still contain bare imports from `@cookbook/shared`; SAM/esbuild bundles reachable shared code into each Lambda artifact.

## Current Route Source Of Truth

Use `packages/server/template.yaml` as the source of truth for deployed endpoints.

Older notes include historical routes such as `/api/user/create`, `/api/user/login`, `/api/user/logout`, and `/api/user/change`. Those are not the current SAM HTTP API routes.

## Handler Pattern

Most body-bearing handlers follow this pattern:

1. Create `FieldValidator` with `event.body ?? ""`.
2. Return validator error if invalid.
3. Validate authorization header if the endpoint requires auth.
4. Call `UserService`.
5. Return `HttpResponseBuilder.successfulJsonResponse(...)` or `buildCustomResponse(...)`.
6. Catch unknown errors and pass them to `HttpResponseBuilder.buildErrorResponse(...)`.

`POST /auth/logout` is slightly different because it validates `event.body ?? "{}"`, making a missing body valid.

## Response Builder Behavior

`HttpResponseBuilder.successfulJsonResponse`:

- Requires an object body.
- Returns status `200`.
- Adds `content-type: application/json`.
- JSON-stringifies the body.

`HttpResponseBuilder.buildCustomResponse`:

- Accepts an object body, string body, or no body.
- Uses the caller-provided status code.
- Merges default CORS headers and caller-provided headers.
- JSON-stringifies object bodies.

`HttpResponseBuilder.buildErrorResponse`:

- Uses `UserServiceError.httpCode` for informative user-service errors.
- Uses `500` for other custom `BaseError` subclasses.
- Uses `500` for non-custom errors.
- Emits a JSON body with a `message` field.

## Known Current-Code Inconsistencies

### Public User Lookup By `userId`

`UserService.getPublicUser` has a branch for `type === "userId"`. `GetPublicUserHandler` lowercases `type` before passing it to the service, so an incoming `userId` becomes `userid` and misses the branch. As written, public lookup by user ID does not work through `/user/{type}/{id}`.

### Auth DAO Comment Typo

`DynamoAuthDao` has a private `_indexSortKey` line commented out. The GSI sort key exists in the SAM template as `created_at`, but the current DAO query only key-conditions on `user_id`.

### Password Update Response Schema Allows More Than Service Returns

`UpdatePasswordResponseSchema` allows optional `longTermAuth`, but `UserService.updatePassword` currently returns only a new short-term token. The long-term token creation lines are present as comments in the service.

### Handler Comments And Old Notes

The current handler comments mostly match the template, but older notes should not be treated as route source of truth.

## Current Test Coverage

Existing tests cover:

- Creating short-term and long-term auth tokens in `AuthService`.
- Field validation behavior.
- HTTP response builder behavior.
- Simple object utility behavior.

There are not currently endpoint-level tests for all handlers, service tests for user flows, DAO integration tests, or S3 storage tests.
