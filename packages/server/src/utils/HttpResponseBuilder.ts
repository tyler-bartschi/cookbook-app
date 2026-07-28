import { APIGatewayProxyStructuredResultV2 } from "aws-lambda";
import { APPLICATION_JSON_HEADER, DEFAULT_CORS_HEADERS } from "./DefaultCorsHeaders.js";
import { isObject } from "./IsObject.js";
import { HTTP_CODES } from "./HttpCodes.js";
import { BaseError } from "../model/errors/BaseError.js";
import { ErrorCode, InformativeErrorCode } from "../model/errors/ErrorCode.js";

export class HttpResponseBuilder {
  public static buildCustomResponse(
    code: number,
    body?: string | object,
    headers?: Record<string, string | number | boolean>,
  ): APIGatewayProxyStructuredResultV2 {
    if (!isObject(body) && typeof body !== "string" && body !== undefined) {
      const message = "[buildCustomResponse] >> body must be an object or a string";
      console.error(message);
      throw new Error(message);
    }

    const bodyStr: string | undefined = isObject(body) ? JSON.stringify(body) : body;

    return {
      statusCode: code,
      headers: {
        ...DEFAULT_CORS_HEADERS,
        ...headers,
      },
      body: bodyStr,
    };
  }

  public static successfulJsonResponse(body: object): APIGatewayProxyStructuredResultV2 {
    if (!isObject(body)) {
      const message = "[successfulJsonResponse] >> body must be an object";
      console.error(message);
      throw new Error(message);
    }

    return {
      statusCode: HTTP_CODES.get("success"),
      headers: {
        ...DEFAULT_CORS_HEADERS,
        ...APPLICATION_JSON_HEADER,
      },
      body: JSON.stringify(body),
    };
  }

  public static buildErrorResponse(error: unknown): APIGatewayProxyStructuredResultV2 {
    if (!(error instanceof BaseError)) {
      // not a custom error, return a generic 500
      const body = {
        message: error instanceof Error ? error.message : String(error),
      };

      return {
        statusCode: HTTP_CODES.get("internal-server-error"),
        headers: {
          ...DEFAULT_CORS_HEADERS,
          ...APPLICATION_JSON_HEADER,
        },
        body: JSON.stringify(body),
      };
    }

    if (Object.values(ErrorCode).includes(error.code as ErrorCode)) {
      // standard error code, return a 500
      const body = {
        message: error.message,
      };

      return {
        statusCode: HTTP_CODES.get("internal-server-error"),
        headers: {
          ...DEFAULT_CORS_HEADERS,
          ...APPLICATION_JSON_HEADER,
        },
        body: JSON.stringify(body),
      };
    }

    if (Object.values(InformativeErrorCode).includes(error.code as InformativeErrorCode)) {
      // error that contains the http code that should be used
      const body = {
        message: error.message,
      };

      return {
        statusCode: (error as unknown as { httpCode: number }).httpCode,
        headers: {
          ...DEFAULT_CORS_HEADERS,
          ...APPLICATION_JSON_HEADER,
        },
        body: JSON.stringify(body),
      };
    }

    return {
      statusCode: HTTP_CODES.get("internal-server-error"),
      headers: {
        ...DEFAULT_CORS_HEADERS,
        ...APPLICATION_JSON_HEADER,
      },
      body: JSON.stringify({ message: `Unknown error: ${String(error)}` }),
    };
  }
}
