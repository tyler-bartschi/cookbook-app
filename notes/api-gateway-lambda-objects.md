# API Gateway Lambda Objects

`SessionHandler` receives an `APIGatewayProxyEventV2` and returns an
`APIGatewayProxyStructuredResultV2`.

## Incoming Event: `APIGatewayProxyEventV2`

This is the request object that API Gateway passes into the Lambda handler.

```ts
{
  version: "2.0",
  routeKey: "GET /auth/session",
  rawPath: "/auth/session",
  rawQueryString: "",
  cookies: [
    "remember_me=true"
  ],
  headers: {
    authorization: "Bearer long-term-auth-token",
    "content-type": "application/json",
    origin: "https://cookbook.tylerbartschi.com",
    "user-agent": "Mozilla/5.0"
  },
  queryStringParameters: {
    example: "value"
  },
  requestContext: {
    accountId: "123456789012",
    apiId: "abc123",
    domainName: "api.example.com",
    domainPrefix: "api",
    http: {
      method: "GET",
      path: "/auth/session",
      protocol: "HTTP/1.1",
      sourceIp: "203.0.113.10",
      userAgent: "Mozilla/5.0"
    },
    requestId: "request-id",
    routeKey: "GET /auth/session",
    stage: "$default",
    time: "07/Jul/2026:12:00:00 +0000",
    timeEpoch: 1783425600000
  },
  body: "{\"someField\":\"someValue\"}",
  pathParameters: {
    id: "123"
  },
  isBase64Encoded: false,
  stageVariables: {
    example: "value"
  }
}
```

Common fields to pull from it:

```ts
const headers = event.headers;
const authorization = headers.authorization;
const bearerToken = authorization?.startsWith("Bearer ")
  ? authorization.slice("Bearer ".length)
  : undefined;

const bodyString = event.body ?? "";
const body = bodyString ? JSON.parse(bodyString) : {};
```

Notes:

- In HTTP API v2, request headers are usually lowercased.
- `event.body` is a string, not a parsed object.
- `event.body` may be `undefined`, especially for `GET` requests.
- If `event.isBase64Encoded` is true, decode the body before parsing it.

## Outgoing Response: `APIGatewayProxyStructuredResultV2`

This is the response object the Lambda handler returns to API Gateway.

```ts
{
  statusCode: 200,
  headers: {
    "content-type": "application/json",
    "access-control-allow-origin": "https://cookbook.tylerbartschi.com",
    "access-control-allow-headers": "content-type,authorization"
  },
  cookies: [
    "session=short-term-auth-token; HttpOnly; Secure; SameSite=None; Path=/"
  ],
  body: "{\"authenticated\":true,\"user\":{\"username\":\"tyler\"}}",
  isBase64Encoded: false
}
```

Build JSON responses like this:

```ts
return {
  statusCode: 200,
  headers: {
    ...DEFAULT_CORS_HEADERS,
    "content-type": "application/json",
  },
  body: JSON.stringify({
    authenticated: true,
    user,
  }),
};
```

Build error responses the same way:

```ts
return {
  statusCode: 401,
  headers: {
    ...DEFAULT_CORS_HEADERS,
    "content-type": "application/json",
  },
  body: JSON.stringify({
    message: "Missing or invalid bearer token",
  }),
};
```

Notes:

- `statusCode` should be a number.
- `headers` is optional, but JSON responses should include `content-type`.
- `body` must be a string, so JSON response bodies need `JSON.stringify`.
- `cookies` is optional and should be an array of `Set-Cookie` style strings.
