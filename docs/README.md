# Cookbook App Documentation

This folder documents the current server-side auth and user behavior for the cookbook app.

The code is authoritative. The older files in `notes/` are useful historical context, but several details there are now out of date. In particular, the current server is an AWS SAM HTTP API backed by Lambda handlers in `packages/server`, DynamoDB tables for users and auth tokens, and S3 plus CloudFront for profile pictures.

## Contents

- `server/overview.md`: server package structure, deployment resources, request validation, response handling, and error behavior.
- `server/endpoints.md`: endpoint-by-endpoint behavior for auth and user routes.
- `server/shared-contracts.md`: request, response, and DTO shapes exported by `@cookbook/shared`.
- `server/data-model.md`: DynamoDB rows, `User`, `AuthToken`, token lifecycle, and uniqueness model.
- `server/profile-pictures.md`: profile picture upload, replacement, S3 keys, CloudFront URLs, and failure behavior.
- `server/implementation-notes.md`: package boundaries, build model, handler conventions, and known current-code inconsistencies.

## Primary Source Files

- `packages/server/template.yaml`: deployed HTTP routes and AWS resources.
- `packages/server/src/handlers`: Lambda handler entrypoints.
- `packages/server/src/service/UserService.ts`: user-facing business logic.
- `packages/server/src/service/AuthService.ts`: auth token creation, validation, revocation, and expiry rules.
- `packages/server/src/model/entity`: server-side entity models.
- `packages/server/src/dao`: DynamoDB persistence behavior.
- `packages/server/src/storage`: S3 profile picture storage behavior.
- `packages/shared/src`: request/response schemas and client-facing DTOs.
