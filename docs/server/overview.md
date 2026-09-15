# Server Overview

## Scope

The current server package implements auth and user account endpoints. It does not yet implement recipe, favorite, comment, search, or metrics endpoints from the older notes.

The current deployed API routes are defined in `packages/server/template.yaml`, not in `notes/specifications.md`. The route set is:

| Method  | Path                       |
| ------- | -------------------------- |
| `POST`  | `/auth/register`           |
| `POST`  | `/auth/login`              |
| `POST`  | `/auth/logout`             |
| `GET`   | `/auth/session`            |
| `POST`  | `/auth/update-password`    |
| `GET`   | `/user/{type}/{id}`        |
| `GET`   | `/user/me`                 |
| `PATCH` | `/user/me/username`        |
| `PATCH` | `/user/me/email`           |
| `PATCH` | `/user/me/profile-picture` |

## Runtime Shape

Each endpoint is a separate AWS Lambda function using an `APIGatewayProxyEventV2` input and an `APIGatewayProxyStructuredResultV2` response. The functions are deployed through AWS SAM as HTTP API routes with payload format `2.0`.

The handlers are thin:

1. Parse and validate JSON bodies with `FieldValidator` and Zod schemas from `@cookbook/shared`.
2. Parse `Authorization` headers when required.
3. Delegate behavior to `UserService`.
4. Convert success or error results into API Gateway response objects with `HttpResponseBuilder`.

Service and persistence objects are created in `packages/server/src/handlers/init.ts`:

- `DynamoDaoFactory`
- `S3StorageFactory`
- `UserService`
- `AuthService`

`UserService` internally creates its own `AuthService` using the same DAO factory.

## AWS Resources

The SAM template defines:

- `CookbookHttpApi`: HTTP API stage `prod`.
- `cookbookUsers`: DynamoDB table for canonical user rows plus username/email lookup rows.
- `cookbookLongTermAuth`: DynamoDB table for long-term auth tokens.
- `cookbookShortTermAuth`: DynamoDB table for short-term auth tokens.
- `profilePicturesBucket`: private S3 bucket for profile pictures.
- `profilePicturesDistribution`: CloudFront distribution used to serve profile picture objects.
- `profilePicturesOAC` and bucket policy: CloudFront origin access control for private S3 reads.

The auth token tables have a GSI keyed by `user_id` with sort key `created_at`. They also enable DynamoDB TTL on `ttl_at`.

## Environment

`packages/server/src/config/env.ts` parses these environment variables:

| Variable                              | Purpose                                                                           |
| ------------------------------------- | --------------------------------------------------------------------------------- |
| `AWS_REGION`                          | AWS region; defaults to `us-east-1`.                                              |
| `USERS_DB_NAME`                       | User table name; defaults to `cookbook_users`.                                    |
| `LONG_TERM_AUTH_DB_NAME`              | Long-term auth table; defaults to `cookbook_long_term_auth`.                      |
| `LONG_TERM_AUTH_DB_INDEX_NAME`        | Long-term auth GSI; defaults to `cookbook_long_term_auth_index`.                  |
| `SHORT_TERM_AUTH_DB_NAME`             | Short-term auth table; defaults to `cookbook_short_term_auth`.                    |
| `SHORT_TERM_AUTH_DB_INDEX_NAME`       | Short-term auth GSI; defaults to `cookbook_short_term_auth_index`.                |
| `PROFILE_PICTURE_S3_BUCKET_NAME`      | S3 bucket for profile pictures; defaults to `cookbook-profile-pictures-bartschi`. |
| `PROFILE_PICTURE_CLOUDFRONT_BASE_URL` | Required CloudFront base URL for generated profile picture URLs.                  |

`PROFILE_PICTURE_CLOUDFRONT_BASE_URL` is required because the schema has no default and requires a valid URL.

## CORS And Response Headers

API Gateway CORS is configured in `template.yaml`. Allowed origins are:

- `https://cookbook.tylerbartschi.com`
- `http://localhost:5173`

Allowed methods are `GET`, `POST`, `PATCH`, and `OPTIONS`. Allowed request headers are `content-type` and `authorization`.

Handler-level `DEFAULT_CORS_HEADERS` is currently empty because CORS is expected to be handled by API Gateway. JSON responses add `content-type: application/json` through `APPLICATION_JSON_HEADER`.

## Request Body Validation

Handlers that expect a JSON body use `FieldValidator`. It:

- Parses `event.body` with `JSON.parse`.
- Validates the parsed value with a Zod schema from `@cookbook/shared`.
- Uses strict Zod objects, so extra properties are rejected.
- Returns `400` with `message: "Invalid JSON request body"` for malformed JSON.
- Returns `400` with `message: "Invalid request body"` for schema failures.

For most body-bearing endpoints, an absent body becomes an empty string and fails JSON parsing. `POST /auth/logout` is the exception: the handler defaults a missing body to `{}`, allowing a bodyless logout request.

## Authorization Header Validation

Authenticated endpoints read `event.headers?.authorization` and require this exact shape:

```text
Bearer tokenId.rawToken
```

The parser is case-sensitive and only accepts the prefix `Bearer ` with a trailing space. Missing authorization returns `401` with `message: "Authorization header not given"`. A non-bearer value returns `401` with `message: "Authorization header must begin with 'Bearer' "`.

## Error Responses

Errors become JSON responses with a `message` string. The exact status code depends on the error type:

- `UserServiceError` carries an explicit HTTP status such as `400`, `401`, `404`, or `409`.
- Other custom `BaseError` subclasses are treated as internal errors and return `500`.
- Non-custom errors also return `500` with the error message.

This means some lower-level failures, including DynamoDB access failures and S3 upload/delete failures, are intentionally surfaced as `500`.
