# Auth And User Data Model

This document describes the current server entities and DynamoDB rows. It is grounded in `packages/server/src/model/entity`, `packages/server/src/dao`, and `packages/server/template.yaml`.

## User Entity

The server-side `User` entity has:

| Field               | Type   | Notes                                                                                   |
| ------------------- | ------ | --------------------------------------------------------------------------------------- |
| `userId`            | string | Generated with UUID v4 during registration.                                             |
| `username`          | string | Normalized by shared schemas before reaching the service. Stored on canonical user row. |
| `email`             | string | Normalized by shared schemas before reaching the service. Stored on canonical user row. |
| `hashedPassword`    | string | Bcrypt hash. Never returned in DTOs.                                                    |
| `profilePictureUrl` | string | Empty string when no picture exists; otherwise CloudFront URL.                          |
| `createdAt`         | `Date` | Stored as ISO string. Returned in `UserDto`.                                            |
| `updatedAt`         | `Date` | Stored as ISO string. Not returned in DTOs.                                             |

## User DTOs

`User.toUserDto()` returns:

- `userId`
- `username`
- `email`
- `profilePictureUrl`
- `createdAt`

`User.toPublicUserDto()` returns:

- `username`
- `profilePictureUrl`

Neither DTO includes `hashedPassword` or `updatedAt`.

## `cookbook_users` Table

The user table is a single-table design with one partition key:

| Key           | Value |
| ------------- | ----- |
| Partition key | `pk`  |
| Sort key      | none  |

Each user is represented by three rows.

### Canonical User Row

Partition key:

```text
USERID#<userId>
```

Shape:

| Attribute             | Value                          |
| --------------------- | ------------------------------ |
| `pk`                  | `USERID#<userId>`              |
| `type`                | `user`                         |
| `username`            | normalized username            |
| `email`               | normalized email               |
| `hashed_password`     | bcrypt hash                    |
| `profile_picture_url` | empty string or CloudFront URL |
| `created_at`          | ISO string                     |
| `updated_at`          | ISO string                     |

### Username Lookup Row

Partition key:

```text
USERNAME#<normalizedUsername>
```

Shape:

| Attribute    | Value                           |
| ------------ | ------------------------------- |
| `pk`         | `USERNAME#<normalizedUsername>` |
| `type`       | `username_lookup`               |
| `user_id`    | canonical user ID               |
| `created_at` | ISO string                      |

### Email Lookup Row

Partition key:

```text
EMAIL#<normalizedEmail>
```

Shape:

| Attribute    | Value                     |
| ------------ | ------------------------- |
| `pk`         | `EMAIL#<normalizedEmail>` |
| `type`       | `email_lookup`            |
| `user_id`    | canonical user ID         |
| `created_at` | ISO string                |

## User Uniqueness

Username and email uniqueness are enforced with lookup rows and conditional DynamoDB writes.

Registration:

- `UserService.registerUser` first checks if the username exists.
- It then checks if the email exists.
- `DynamoUserDao.createUser` writes canonical, username lookup, and email lookup rows in one transaction.
- Each put uses `attribute_not_exists(pk)`, so DynamoDB also enforces uniqueness if a race occurs after the service checks.

Username update:

- Service validates short-term auth and password.
- Service checks whether the requested new username exists.
- If the lookup exists and belongs to the same current username value, the service returns `400`.
- If the lookup exists for another user, the service returns `409`.
- DAO transaction puts the new username lookup row, updates the canonical row, and deletes the old username lookup row.

Email update follows the same pattern using email lookup rows.

## Auth Token Entity

`AuthToken` exists server-side only. Clients receive an `AuthDto`, not the persisted row.

Fields:

| Field         | Type                  | Notes                                                                   |
| ------------- | --------------------- | ----------------------------------------------------------------------- |
| `tokenId`     | string                | Generated with `crypto.randomUUID()`. Stored as DynamoDB partition key. |
| `hashedToken` | string                | SHA-256 hash of the raw token. The raw token is never stored.           |
| `type`        | `"short"` or `"long"` | Determines the DynamoDB table.                                          |
| `userId`      | string                | Associated user ID.                                                     |
| `createdAt`   | `Date`                | Creation time.                                                          |
| `lastUsedAt`  | `Date`                | Updated on successful validation.                                       |
| `expiresAt`   | `Date`                | Sliding expiration, bounded by maximum lifetime.                        |
| `revokedAt`   | `Date` or `null`      | Set when revoked.                                                       |
| `ttlAt`       | number                | In-memory epoch milliseconds; persisted to DynamoDB as epoch seconds.   |

## Client Auth DTO

The client receives:

```json
{
  "authToken": "tokenId.rawToken",
  "userId": "user-id",
  "type": "short"
}
```

`authToken` joins:

- `tokenId`: stored in DynamoDB and used for lookup.
- `rawToken`: sent only to the client, hashed before storage.

Validation splits the string on `.` and hashes the raw token for comparison with the stored hash.

## Auth Token Tables

There are separate DynamoDB tables for short-term and long-term tokens.

### `cookbook_short_term_auth`

| Key               | Value                            |
| ----------------- | -------------------------------- |
| Partition key     | `token_id`                       |
| Sort key          | none                             |
| TTL attribute     | `ttl_at`                         |
| GSI               | `cookbook_short_term_auth_index` |
| GSI partition key | `user_id`                        |
| GSI sort key      | `created_at`                     |

### `cookbook_long_term_auth`

| Key               | Value                           |
| ----------------- | ------------------------------- |
| Partition key     | `token_id`                      |
| Sort key          | none                            |
| TTL attribute     | `ttl_at`                        |
| GSI               | `cookbook_long_term_auth_index` |
| GSI partition key | `user_id`                       |
| GSI sort key      | `created_at`                    |

Both tables store rows with this shape:

| Attribute      | Value                     |
| -------------- | ------------------------- |
| `token_id`     | token ID                  |
| `token`        | SHA-256 hash of raw token |
| `type`         | `short` or `long`         |
| `user_id`      | associated user ID        |
| `created_at`   | ISO string                |
| `last_used_at` | ISO string                |
| `expires_at`   | ISO string                |
| `revoked_at`   | ISO string or `null`      |
| `ttl_at`       | epoch seconds             |

## Token Lifetimes

Constants in `AuthService`:

| Constant                | Current value               |
| ----------------------- | --------------------------- |
| Short-term lifetime     | 2 hours                     |
| Long-term lifetime      | 7 days                      |
| Maximum lifetime        | 30 days from token creation |
| Revoked token TTL delay | 1 day                       |

When a token is created:

- `createdAt` is now.
- `lastUsedAt` is now.
- `expiresAt` is now plus 2 hours for short tokens or 7 days for long tokens.
- `revokedAt` is `null`.
- `ttlAt` is `expiresAt` plus 1 day.

When a token is successfully validated:

- The token ID is used to load the row from the appropriate auth table.
- The raw token is hashed and compared to the stored hash.
- Revoked tokens are rejected.
- Expired tokens are rejected.
- Tokens older than the 30-day maximum lifetime are rejected.
- `lastUsedAt` is updated to now.
- `expiresAt` slides forward by the token type's lifetime, but never beyond `createdAt + 30 days`.
- `ttlAt` becomes the new `expiresAt + 1 day`.

When a token is revoked:

- If the token does not exist, revocation returns without error.
- If the raw token hash does not match, revocation logs a warning and returns without error.
- If already revoked, revocation returns without error.
- Otherwise `revokedAt` is set to now and `ttlAt` is set to about one day from now.

## Active Token Queries

`DynamoAuthDao.getAllActiveLongTermAuthTokens` and `getAllActiveShortTermAuthTokens` query the relevant GSI by `user_id` in pages of 10. Results are filtered in application code to include only tokens where:

- `revokedAt === null`
- `expiresAt` is in the future

`UserService.logoutUser` uses the long-term query when `invalidateLongTermAuth` is true. `UserService.updatePassword` always revokes all active long-term tokens after changing the password.

## TTL Units

The in-memory `AuthToken.ttlAt` value is epoch milliseconds. `AuthToken.convertToAuthTokenRow()` persists it as epoch seconds with `Math.floor(ttlAt / 1000)`.

`AuthToken.toAuthToken()` converts DynamoDB seconds back to milliseconds by multiplying by 1000.

This matches DynamoDB TTL requirements.
