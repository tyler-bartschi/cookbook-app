# Backend SAM API and Lambda setup

Goal: define the backend API Gateway HTTP API routes and Lambda functions in `packages/server/template.yaml`, and build
each handler with SAM esbuild so workspace dependencies like `@cookbook/shared` are included in the Lambda artifacts.

This note is a guide for changing the template. It intentionally uses examples instead of listing every full resource.

## Current template issues to fix

- `Globals.Function.CodeUri: ./dist/` should not be the default for the esbuild setup. Each function should point at
  server source and let SAM/esbuild create the deployable artifact.
- `Globals.Function.Layers` references `cookbookLayer`, but no layer resource is defined. Since this setup bundles
  dependencies with esbuild, delete the layer reference and do not add a Lambda layer for `@cookbook/shared`.
- Delete `Metadata.x-common-policies` if it is still present. It currently contains broad managed policies such as
  `AmazonDynamoDBFullAccess`,
  `AmazonS3FullAccess`, `AmazonSQSFullAccess`, `CloudWatchFullAccess`, and `AmazonSESFullAccess`. Replace this with
  narrower function `Policies`.
- Delete `Metadata.x-common-cors-headers` and `x-common-swagger-response-headers`. They are REST API/OpenAPI leftovers
  and should not be used for the chosen `AWS::Serverless::HttpApi` setup. Configure CORS with `CorsConfiguration` on
  the HTTP API resource, and keep response headers in code only where the handler needs to return them.
- `UpdatePasswordHandler.ts` says `Endpoint: /auth/change-password`, while `user.md` says
  `POST /auth/update-password`. Pick one route name and make the handler comment, API route, and frontend client agree.

## Build model

Use SAM esbuild on each `AWS::Serverless::Function`.

SAM/esbuild starts at the function's TypeScript entrypoint, follows imports, and bundles reachable code into the Lambda
artifact. That includes server code and imports from `@cookbook/shared`, as long as `@cookbook/shared` is resolvable
during build.

Keep running type checks separately. esbuild transpiles and bundles TypeScript, but it is not a replacement for:

```sh
npm run typecheck -w @cookbook/server
```

## Build and deploy order

From a clean checkout:

```sh
npm ci
npm run build -w @cookbook/shared
npm run typecheck -w @cookbook/server
cd packages/server
sam build --template-file template.yaml
sam deploy --config-file samconfig.toml --template-file .aws-sam/build/template.yaml
```

The shared build matters because `packages/shared/package.json` exports `dist/index.js` and `dist/index.d.ts`.

## Globals

Keep truly shared Lambda settings in `Globals.Function`.

Recommended shape:

```yaml
Globals:
  Function:
    Runtime: nodejs24.x
    Timeout: 30
    MemorySize: 128
    Architectures:
      - x86_64
    Environment:
      Variables:
        USERS_DB_NAME: !Ref cookbookUsers
        LONG_TERM_AUTH_DB_NAME: !Ref cookbookLongTermAuth
        LONG_TERM_AUTH_DB_INDEX_NAME: cookbook_long_term_auth_index
        SHORT_TERM_AUTH_DB_NAME: !Ref cookbookShortTermAuth
        SHORT_TERM_AUTH_DB_INDEX_NAME: cookbook_short_term_auth_index
        PROFILE_PICTURE_S3_BUCKET_NAME: !Ref profilePicturesBucket
        PROFILE_PICTURE_CLOUDFRONT_BASE_URL: !Sub "https://${profilePicturesDistribution.DomainName}"
        NODE_OPTIONS: --enable-source-maps
```

Notes:

- Do not put `CodeUri` in `Globals` for this setup. Set it per function.
- Do not put `Handler` in `Globals`. Each function has a different handler.
- Do not use `Layers` unless you intentionally keep some dependency out of the bundle.
- `NODE_OPTIONS: --enable-source-maps` is useful if you enable esbuild sourcemaps.

## API Gateway

Use one explicit API Gateway HTTP API resource and attach each Lambda with a `HttpApi` event.

Example:

```yaml
CookbookHttpApi:
  Type: AWS::Serverless::HttpApi
  Properties:
    StageName: Prod
    CorsConfiguration:
      AllowOrigins:
        - "https://cookbook.tylerbartschi.com"
      AllowMethods:
        - GET
        - POST
        - PATCH
        - OPTIONS
      AllowHeaders:
        - content-type
        - authorization
      MaxAge: 600
```

During early development, `AllowOrigins: ["*"]` is convenient, but use the deployed frontend origin before production.

Your handlers use `APIGatewayProxyEventV2`, which matches HTTP API payload format 2.0. Make the event explicit:

```yaml
Events:
  ApiEvent:
    Type: HttpApi
    Properties:
      ApiId: !Ref CookbookHttpApi
      Path: /auth/login
      Method: POST
      PayloadFormatVersion: "2.0"
```

## Lambda function pattern

Each handler file exports:

```ts
export async function handler(...)
```

So each Lambda handler should point at the source file path plus `.handler`.

Example:

```yaml
LoginFunction:
  Type: AWS::Serverless::Function
  Properties:
    CodeUri: ./
    Handler: src/handlers/auth/LoginHandler.handler
    Policies:
      - DynamoDBCrudPolicy:
          TableName: !Ref cookbookUsers
      - DynamoDBCrudPolicy:
          TableName: !Ref cookbookLongTermAuth
      - DynamoDBCrudPolicy:
          TableName: !Ref cookbookShortTermAuth
    Events:
      LoginRoute:
        Type: HttpApi
        Properties:
          ApiId: !Ref CookbookHttpApi
          Path: /auth/login
          Method: POST
          PayloadFormatVersion: "2.0"
  Metadata:
    BuildMethod: esbuild
    BuildProperties:
      Format: esm
      Minify: false
      OutExtension:
        - .js=.mjs
      Target: es2022
      Sourcemap: true
      EntryPoints:
        - src/handlers/auth/LoginHandler.ts
```

Why these pieces matter:

- `CodeUri: ./` lets esbuild resolve package files from the server package context.
- `Handler` names the module and exported function after build.
- `EntryPoints` names the TypeScript file esbuild starts from.
- `Format: esm` matches the current server package's ESM style.
- `OutExtension: .js=.mjs` makes Lambda treat the bundled handler as an ES module.
- `Policies` should grant only what the handler actually uses.

## Shared esbuild metadata

SAM does not use the top-level `Metadata` anchors as function build configuration. `BuildMethod` and `BuildProperties`
belong under each `AWS::Serverless::Function` resource's `Metadata`.

To avoid repeating the same esbuild block manually, use a YAML anchor:

```yaml
Metadata:
  x-esbuild-defaults: &esbuildDefaults
    BuildMethod: esbuild
    BuildProperties:
      Format: esm
      Minify: false
      OutExtension:
        - .js=.mjs
      Target: es2022
      Sourcemap: true
```

Then on each function:

```yaml
Metadata:
  <<: *esbuildDefaults
  BuildProperties:
    Format: esm
    Minify: false
    OutExtension:
      - .js=.mjs
    Target: es2022
    Sourcemap: true
    EntryPoints:
      - src/handlers/auth/LoginHandler.ts
```

YAML merge behavior does not deep-merge nested `BuildProperties` in every parser the way people often expect. The
least surprising approach is to repeat the short `BuildProperties` block per function, or use the anchor only as a
copy/paste aid.

## Endpoint inventory

Based on `notes/user.md` and the current handler files:

| Method | Path | Handler file |
| --- | --- | --- |
| POST | `/auth/register` | `src/handlers/auth/RegisterHandler.ts` |
| POST | `/auth/login` | `src/handlers/auth/LoginHandler.ts` |
| POST | `/auth/logout` | `src/handlers/auth/LogoutHandler.ts` |
| GET | `/auth/session` | `src/handlers/auth/SessionHandler.ts` |
| POST | `/auth/update-password` | `src/handlers/auth/UpdatePasswordHandler.ts` |
| GET | `/user/{type}/{id}` | `src/handlers/user/GetPublicUserHandler.ts` |
| GET | `/user/me` | `src/handlers/user/GetUserHandler.ts` |
| PATCH | `/user/me/username` | `src/handlers/user/UpdateUsernameHandler.ts` |
| PATCH | `/user/me/email` | `src/handlers/user/UpdateEmailHandler.ts` |
| PATCH | `/user/me/profile-picture` | `src/handlers/user/UpdateProfilePictureHandler.ts` |

For path parameters, API Gateway will populate:

```ts
event.pathParameters?.type
event.pathParameters?.id
```

for `/user/{type}/{id}`.

## Policy guidance

Start with SAM policy templates, then tighten further later if needed.

Examples:

```yaml
Policies:
  - DynamoDBCrudPolicy:
      TableName: !Ref cookbookUsers
  - DynamoDBCrudPolicy:
      TableName: !Ref cookbookLongTermAuth
  - DynamoDBCrudPolicy:
      TableName: !Ref cookbookShortTermAuth
```

For profile picture updates:

```yaml
Policies:
  - DynamoDBCrudPolicy:
      TableName: !Ref cookbookUsers
  - DynamoDBCrudPolicy:
      TableName: !Ref cookbookShortTermAuth
  - S3CrudPolicy:
      BucketName: !Ref profilePicturesBucket
```

Do not keep `AmazonDynamoDBFullAccess`, `AmazonS3FullAccess`, `AmazonSQSFullAccess`, or `AmazonSESFullAccess` unless
the function truly needs account-wide access. Current code does not appear to need SQS or SES.

## Suggested per-route dependencies

These are intentionally conservative. You can tighten them as service methods become more granular.

- Register: users table, short-term auth table, long-term auth table, profile picture S3 bucket.
- Login: users table, short-term auth table, long-term auth table.
- Logout: short-term auth table, long-term auth table.
- Session: users table, long-term auth table, short-term auth table.
- Update password: users table, short-term auth table, long-term auth table.
- Get public user: users table.
- Get current user: users table, short-term auth table.
- Update username: users table, short-term auth table.
- Update email: users table, short-term auth table.
- Update profile picture: users table, short-term auth table, profile picture S3 bucket.

## Outputs

Add outputs so CI/deploy logs and manual checks can find the deployed API and profile-picture distribution:

```yaml
Outputs:
  ApiBaseUrl:
    Value: !Sub "https://${CookbookHttpApi}.execute-api.${AWS::Region}.${AWS::URLSuffix}/Prod"

  ProfilePicturesCloudFrontBaseUrl:
    Value: !Sub "https://${profilePicturesDistribution.DomainName}"
```

## Deployment workflow notes

For a future backend deploy workflow:

```yaml
- uses: actions/checkout@v6
- uses: actions/setup-node@v6
  with:
    node-version: 24
    cache: npm
- run: npm ci
- run: npm run build -w @cookbook/shared
- run: npm run typecheck -w @cookbook/server
- uses: aws-actions/setup-sam@v2
- uses: aws-actions/configure-aws-credentials@v6
  with:
    role-to-assume: ${{ secrets.AWS_BACKEND_DEPLOY_ROLE_ARN }}
    aws-region: us-east-1
- working-directory: packages/server
  run: sam build --template-file template.yaml
- working-directory: packages/server
  run: sam deploy --config-file samconfig.toml --template-file .aws-sam/build/template.yaml --no-confirm-changeset --no-fail-on-empty-changeset
```

## Validation checklist

- Run `npm run build -w @cookbook/shared` before `sam build`.
- Run server typecheck separately because esbuild does not typecheck.
- Run `sam validate --template-file packages/server/template.yaml`.
- Run `sam build --template-file packages/server/template.yaml`.
- Inspect `.aws-sam/build` and confirm there are no unresolved imports from `@cookbook/shared`.
- After deploy, call each endpoint once and check CloudWatch logs for import/runtime errors.

## References

- SAM esbuild TypeScript builds: https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-using-build-typescript.html
- SAM HTTP API resource: https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-resource-httpapi.html
- SAM HTTP API event: https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-property-function-httpapi.html
- SAM HTTP API CORS: https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-property-httpapi-httpapicorsconfiguration.html
- SAM policy templates: https://docs.amazonaws.cn/en_us/serverless-application-model/latest/developerguide/serverless-policy-templates.html
- Lambda TypeScript builds: https://docs.aws.amazon.com/lambda/latest/dg/lambda-typescript.html
