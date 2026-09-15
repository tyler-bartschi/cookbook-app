# Server Endpoints

Routes below come from `packages/server/template.yaml`. Request and response body schemas come from `packages/shared/src`.

## Common Conventions

All JSON request bodies must match their schema exactly. Extra fields are rejected. Usernames and emails are normalized by the shared schemas with `trim().toLowerCase()`.

Authenticated endpoints require:

```text
Authorization: Bearer tokenId.rawToken
```

Short-term tokens are used for normal authenticated account operations. Long-term tokens are only used by `GET /auth/session`.

Error responses usually have:

```json
{
  "message": "..."
}
```

Validation errors may also include an `error` field with serialized validation details.

## `POST /auth/register`

Creates a new user, optionally uploads a profile picture, creates a short-term auth token, and optionally creates a long-term auth token.

Handler: `packages/server/src/handlers/auth/RegisterHandler.ts`

Service method: `UserService.registerUser`

Authorization: none.

Request body without image:

```json
{
  "username": "tyler",
  "email": "tyler@example.com",
  "password": "password123",
  "rememberMe": true
}
```

Request body with image:

```json
{
  "username": "tyler",
  "email": "tyler@example.com",
  "password": "password123",
  "rememberMe": true,
  "imageBytesAsBase64String": "...",
  "imageFileExtension": "png"
}
```

Success status: `201`.

Success response:

```json
{
  "user": {
    "userId": "...",
    "username": "tyler",
    "email": "tyler@example.com",
    "profilePictureUrl": "https://...",
    "createdAt": "2026-07-27T00:00:00.000Z"
  },
  "shortTermAuth": {
    "authToken": "tokenId.rawToken",
    "userId": "...",
    "type": "short"
  },
  "longTermAuth": {
    "authToken": "tokenId.rawToken",
    "userId": "...",
    "type": "long"
  }
}
```

`longTermAuth` is only present when `rememberMe` is `true`.

Behavior:

- Checks username uniqueness before creating the user.
- Checks email uniqueness before creating the user.
- Hashes the password with bcrypt using 10 salt rounds.
- Creates a UUID user ID.
- Writes three DynamoDB rows in a transaction: canonical user row, username lookup row, and email lookup row.
- If an image is provided, uploads it before creating the user.
- If image upload fails during registration, the error is logged and registration continues with an empty `profilePictureUrl`.

Notable errors:

- `400`: malformed JSON or schema validation failure.
- `409`: username already taken.
- `409`: email already in use.
- `500`: DynamoDB write failure or other internal failure.

## `POST /auth/login`

Authenticates by either email or username, returns the user and a new short-term token, and optionally returns a new long-term token.

Handler: `packages/server/src/handlers/auth/LoginHandler.ts`

Service method: `UserService.loginUser`

Authorization: none.

Request body with email:

```json
{
  "email": "tyler@example.com",
  "password": "password123",
  "rememberMe": false
}
```

Request body with username:

```json
{
  "username": "tyler",
  "password": "password123",
  "rememberMe": false
}
```

The request must match exactly one branch of the union. Providing both `email` and `username` fails because both strict object branches reject the extra field.

Success status: `200`.

Success response shape matches register, except `longTermAuth` is optional and only returned when `rememberMe` is `true`.

Behavior:

- If `username` is present, login uses username lookup.
- Otherwise login uses email lookup.
- Compares the supplied password against the stored bcrypt hash.
- Creates a new short-term auth token on every successful login.
- Creates a new long-term auth token when `rememberMe` is `true`.

Notable errors:

- `400`: malformed JSON or schema validation failure.
- `401`: no matching username/email.
- `401`: wrong password.
- `500`: lower-level data access or auth token creation failure.

## `GET /auth/session`

Validates a long-term auth token and returns a fresh short-term auth token.

Handler: `packages/server/src/handlers/auth/SessionHandler.ts`

Service method: `UserService.validateSession`

Authorization: required, using a long-term token.

Request body: ignored by the handler.

Success status: `200`.

Success response:

```json
{
  "user": {
    "userId": "...",
    "username": "tyler",
    "email": "tyler@example.com",
    "profilePictureUrl": "https://...",
    "createdAt": "2026-07-27T00:00:00.000Z"
  },
  "shortTermAuth": {
    "authToken": "tokenId.rawToken",
    "userId": "...",
    "type": "short"
  }
}
```

Behavior:

- Validates the bearer token against the long-term auth table.
- On successful validation, updates the long-term token's `lastUsedAt`, sliding `expiresAt`, and `ttlAt`.
- Loads the associated user by user ID.
- Creates and returns a new short-term token.

Notable errors:

- `401`: missing or malformed authorization header.
- `401`: long-term auth token missing, mismatched, revoked, expired, or beyond maximum lifetime.
- `500`: authenticated token has no user ID, associated user cannot be found, or lower-level failure.

## `POST /auth/logout`

Revokes the current short-term auth token and optionally revokes all active long-term tokens for the same user.

Handler: `packages/server/src/handlers/auth/LogoutHandler.ts`

Service method: `UserService.logoutUser`

Authorization: required, using a short-term token.

Request body:

```json
{
  "invalidateLongTermAuth": true
}
```

The body may be omitted because the handler validates `{}` by default. `invalidateLongTermAuth` is optional.

Success status: `204`.

Success response body: none.

Behavior:

- Validates the short-term token.
- Revokes the short-term token by setting `revokedAt` and moving `ttlAt` to about one day after revocation.
- If `invalidateLongTermAuth` is truthy, queries all active long-term tokens for the user and revokes them.

Notable errors:

- `400`: malformed JSON or schema validation failure.
- `401`: missing or malformed authorization header.
- `401`: invalid short-term token.
- `500`: failure revoking one or more tokens.

## `POST /auth/update-password`

Changes the authenticated user's password, revokes the current short-term token, revokes all active long-term tokens, and returns a fresh short-term token.

Handler: `packages/server/src/handlers/auth/UpdatePasswordHandler.ts`

Service method: `UserService.updatePassword`

Authorization: required, using a short-term token.

Request body:

```json
{
  "password": "oldPassword123",
  "newPassword": "newPassword123"
}
```

Success status: `200`.

Success response:

```json
{
  "shortTermAuth": {
    "authToken": "tokenId.rawToken",
    "userId": "...",
    "type": "short"
  }
}
```

The shared response schema allows `longTermAuth`, but the current service does not return one.

Behavior:

- Validates the current short-term auth token.
- Loads the associated user.
- Verifies the current password.
- Bcrypt-hashes the new password.
- Updates `hashed_password` and `updated_at` in the canonical user row.
- Revokes the current short-term token.
- Revokes all active long-term auth tokens for the user.
- Creates and returns a new short-term token.

Notable errors:

- `400`: malformed JSON or schema validation failure.
- `401`: missing or malformed authorization header.
- `401`: invalid short-term token.
- `401`: wrong current password.
- `500`: lower-level data access or auth token failure.

## `GET /user/{type}/{id}`

Returns public user information by lookup key.

Handler: `packages/server/src/handlers/user/GetPublicUserHandler.ts`

Service method: `UserService.getPublicUser`

Authorization: none.

Path parameters:

| Parameter | Behavior                                                                 |
| --------- | ------------------------------------------------------------------------ |
| `type`    | Intended lookup type. Current working values are `username` and `email`. |
| `id`      | Lookup value. The handler trims and lowercases this value.               |

Success status: `200`.

Success response:

```json
{
  "user": {
    "username": "tyler",
    "profilePictureUrl": "https://..."
  }
}
```

Behavior:

- Rejects missing `type` with `400`.
- Rejects missing `id` with `400`.
- Trims and lowercases both path values.
- Looks up the user and returns only public fields.

Current inconsistency:

- The service contains a branch for `type === "userId"`, but the handler lowercases the type before calling the service. That means an incoming `userId` becomes `userid` and does not match the service branch. As written, lookup by user ID does not work through this endpoint.

Notable errors:

- `400`: missing `type` path parameter.
- `400`: missing `id` path parameter.
- `404`: no matching user.
- `500`: lower-level data access failure.

## `GET /user/me`

Returns the private user DTO for the authenticated user.

Handler: `packages/server/src/handlers/user/GetUserHandler.ts`

Service method: `UserService.getUser`

Authorization: required, using a short-term token.

Request body: ignored by the handler.

Success status: `200`.

Success response:

```json
{
  "user": {
    "userId": "...",
    "username": "tyler",
    "email": "tyler@example.com",
    "profilePictureUrl": "https://...",
    "createdAt": "2026-07-27T00:00:00.000Z"
  }
}
```

Behavior:

- Validates the short-term auth token.
- Loads the associated user by user ID.
- Returns the private user DTO.

Notable errors:

- `401`: missing or malformed authorization header.
- `401`: invalid short-term token.
- `500`: associated user cannot be found or lower-level failure.

## `PATCH /user/me/username`

Changes the authenticated user's username.

Handler: `packages/server/src/handlers/user/UpdateUsernameHandler.ts`

Service method: `UserService.updateUsername`

Authorization: required, using a short-term token.

Request body:

```json
{
  "newUsername": "newname",
  "password": "password123"
}
```

Success status: `200`.

Success response:

```json
{
  "user": {
    "userId": "...",
    "username": "newname",
    "email": "tyler@example.com",
    "profilePictureUrl": "https://...",
    "createdAt": "2026-07-27T00:00:00.000Z"
  }
}
```

Behavior:

- Validates the short-term auth token.
- Verifies the password.
- Checks whether the new username already exists.
- Returns `400` when the new username is already the user's current username.
- Returns `409` when another user already owns the new username.
- Performs a DynamoDB transaction that creates the new username lookup row, updates the canonical user row, and deletes the old username lookup row.

Notable errors:

- `400`: malformed JSON, schema validation failure, or same username.
- `401`: missing or malformed authorization header.
- `401`: invalid short-term token.
- `401`: wrong password.
- `409`: username already in use.
- `500`: lower-level data access failure.

## `PATCH /user/me/email`

Changes the authenticated user's email address.

Handler: `packages/server/src/handlers/user/UpdateEmailHandler.ts`

Service method: `UserService.updateEmail`

Authorization: required, using a short-term token.

Request body:

```json
{
  "newEmail": "new@example.com",
  "password": "password123"
}
```

Success status: `200`.

Success response shape matches `PATCH /user/me/username`, with the updated email.

Behavior:

- Validates the short-term auth token.
- Verifies the password.
- Checks whether the new email already exists.
- Returns `400` when the new email is already the user's current email.
- Returns `409` when another user already owns the new email.
- Performs a DynamoDB transaction that creates the new email lookup row, updates the canonical user row, and deletes the old email lookup row.

Notable errors:

- `400`: malformed JSON, schema validation failure, or same email.
- `401`: missing or malformed authorization header.
- `401`: invalid short-term token.
- `401`: wrong password.
- `409`: email already in use.
- `500`: lower-level data access failure.

## `PATCH /user/me/profile-picture`

Replaces the authenticated user's profile picture.

Handler: `packages/server/src/handlers/user/UpdateProfilePictureHandler.ts`

Service method: `UserService.updateProfilePicture`

Authorization: required, using a short-term token.

Request body:

```json
{
  "imageBytesAsBase64String": "...",
  "imageFileExtension": "png"
}
```

Success status: `200`.

Success response shape matches `GET /user/me`, with the updated `profilePictureUrl`.

Behavior:

- Validates the short-term auth token.
- Uploads the new profile picture to S3.
- If the user already has a profile picture, attempts to delete the old image.
- If old-image deletion fails, attempts to delete the newly uploaded image as rollback and returns `500`.
- Updates the canonical user row's `profile_picture_url` and `updated_at`.

Password verification is not required for this endpoint.

Notable errors:

- `400`: malformed JSON or schema validation failure.
- `401`: missing or malformed authorization header.
- `401`: invalid short-term token.
- `500`: upload failure, delete failure, rollback-related failure, or lower-level data access failure.
