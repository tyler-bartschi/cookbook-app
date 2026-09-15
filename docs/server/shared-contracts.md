# Shared Request And Response Contracts

The shared package exports Zod schemas and TypeScript types from `packages/shared/src/index.ts`. Server handlers import these schemas and validate incoming request bodies with them.

## Normalization And Strictness

All request object schemas are strict. Extra keys are rejected.

`EmailSchema`:

- Trims whitespace.
- Lowercases the value.
- Requires a valid email format.

`UsernameSchema`:

- Trims whitespace.
- Lowercases the value.
- Requires length from 3 to 32 characters.

Password fields are plain strings with length from 8 to 32 characters. There is no shared schema requirement for character classes.

## DTOs

### `AuthDto`

```json
{
  "authToken": "tokenId.rawToken",
  "userId": "user-id",
  "type": "short"
}
```

Fields:

| Field       | Type                  | Notes                                             |
| ----------- | --------------------- | ------------------------------------------------- |
| `authToken` | non-empty string      | Client-facing token in `tokenId.rawToken` format. |
| `userId`    | non-empty string      | Associated user ID.                               |
| `type`      | `"short"` or `"long"` | Indicates which auth table validates the token.   |

### `UserDto`

```json
{
  "userId": "user-id",
  "username": "tyler",
  "email": "tyler@example.com",
  "profilePictureUrl": "https://...",
  "createdAt": "2026-07-27T00:00:00.000Z"
}
```

Fields:

| Field               | Type                | Notes                                          |
| ------------------- | ------------------- | ---------------------------------------------- |
| `userId`            | non-empty string    | Generated UUID from the server.                |
| `username`          | normalized username | Private user DTO includes username.            |
| `email`             | normalized email    | Private user DTO includes email.               |
| `profilePictureUrl` | empty string or URL | Empty string means no current profile picture. |
| `createdAt`         | string              | Server emits ISO timestamp.                    |

`UserDto` intentionally does not include `updatedAt` or `hashedPassword`.

### `PublicUserDto`

```json
{
  "username": "tyler",
  "profilePictureUrl": "https://..."
}
```

Fields:

| Field               | Type                | Notes                                    |
| ------------------- | ------------------- | ---------------------------------------- |
| `username`          | normalized username | Public identifier.                       |
| `profilePictureUrl` | empty string or URL | Public profile image URL when available. |

`PublicUserDto` intentionally omits `userId`, `email`, `createdAt`, `updatedAt`, and password hash.

## Auth Requests

### `RegisterRequest`

Without image:

```json
{
  "username": "tyler",
  "email": "tyler@example.com",
  "password": "password123",
  "rememberMe": true
}
```

With image:

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

Notes:

- `rememberMe` is required.
- The image fields must either both be present or both be absent.
- `imageFileExtension` is only checked as a non-empty string. It is not currently restricted to a known image extension.
- The base64 string is only checked as non-empty by the schema. The S3 layer attempts to decode it with `Buffer.from(value, "base64")`.

### `LoginRequest`

With email:

```json
{
  "email": "tyler@example.com",
  "password": "password123",
  "rememberMe": false
}
```

With username:

```json
{
  "username": "tyler",
  "password": "password123",
  "rememberMe": false
}
```

Notes:

- `rememberMe` is required.
- Exactly one of `email` or `username` should be supplied.
- Because both union branches are strict, supplying both fields fails validation.

### `LogoutRequest`

```json
{
  "invalidateLongTermAuth": true
}
```

Notes:

- `invalidateLongTermAuth` is optional.
- An empty object is valid.
- The handler defaults a missing request body to `{}`, so bodyless logout is valid.

### `UpdatePasswordRequest`

```json
{
  "password": "oldPassword123",
  "newPassword": "newPassword123"
}
```

Both fields are required and must be 8 to 32 characters.

## User Requests

### `UpdateUsernameRequest`

```json
{
  "newUsername": "newname",
  "password": "password123"
}
```

The new username is normalized and must be 3 to 32 characters. Password verification is required.

### `UpdateEmailRequest`

```json
{
  "newEmail": "new@example.com",
  "password": "password123"
}
```

The new email is normalized and must be a valid email. Password verification is required.

### `UpdateProfilePictureRequest`

```json
{
  "imageBytesAsBase64String": "...",
  "imageFileExtension": "png"
}
```

Password verification is not required. Both fields are required and only checked as non-empty strings by the schema.

## Auth Responses

### `RegisterResponse`

```json
{
  "user": {},
  "shortTermAuth": {},
  "longTermAuth": {}
}
```

`user` is a `UserDto`. `shortTermAuth` is always present. `longTermAuth` is optional and only returned when `rememberMe` is `true`.

### `LoginResponse`

Same shape as `RegisterResponse`.

### `SessionResponse`

```json
{
  "user": {},
  "shortTermAuth": {}
}
```

`user` is a `UserDto`. `shortTermAuth` is a newly created short-term `AuthDto`.

### `UpdatePasswordResponse`

```json
{
  "shortTermAuth": {}
}
```

The shared schema allows optional `longTermAuth`, but the current service returns only `shortTermAuth`.

## User Responses

### `GetPublicUserResponse`

```json
{
  "user": {}
}
```

`user` is a `PublicUserDto`.

### `GetUserResponse`

```json
{
  "user": {}
}
```

`user` is a `UserDto`.

### `UpdateUsernameResponse`

```json
{
  "user": {}
}
```

`user` is the updated `UserDto`.

### `UpdateEmailResponse`

```json
{
  "user": {}
}
```

`user` is the updated `UserDto`.

### `UpdateProfilePictureResponse`

```json
{
  "user": {}
}
```

`user` is the updated `UserDto`.

## Error Response

The shared error response shape is:

```json
{
  "message": "..."
}
```

Validation failures generated by `FieldValidator` may also include an `error` field.
