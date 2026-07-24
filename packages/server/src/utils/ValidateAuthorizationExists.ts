import { APIGatewayProxyStructuredResultV2 } from "aws-lambda";
import { HttpResponseBuilder } from "./HttpResponseBuilder.js";
import { HTTP_CODES } from "./HttpCodes.js";
import { ErrorResponse } from "@cookbook/shared";
import { APPLICATION_JSON_HEADER } from "./DefaultCorsHeaders.js";
import { extractClientToken } from "./ExtractClientToken.js";

export interface AuthorizationExistsResponse {
  exists: boolean;
  clientToken?: string;
  error?: APIGatewayProxyStructuredResultV2;
}

export function validateAuthorizationExists(
  authorization: string | undefined,
): AuthorizationExistsResponse {
  if (!authorization) {
    return {
      exists: false,
      error: HttpResponseBuilder.buildCustomResponse(
        HTTP_CODES.get("unauthorized")!,
        { message: "Authorization header not given" } as ErrorResponse,
        APPLICATION_JSON_HEADER,
      ),
    };
  }

  const clientToken: string | undefined = extractClientToken(authorization);
  if (!clientToken) {
    return {
      exists: false,
      error: HttpResponseBuilder.buildCustomResponse(
        HTTP_CODES.get("unauthorized")!,
        { message: "Authorization header must begin with 'Bearer' " } as ErrorResponse,
        APPLICATION_JSON_HEADER,
      ),
    };
  }

  return {
    exists: true,
    clientToken: clientToken,
  };
}
