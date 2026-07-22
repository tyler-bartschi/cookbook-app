/**
 * Endpoint: /auth/session
 */

import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from "aws-lambda";
import { HttpResponseBuilder } from "../../utils/HttpResponseBuilder.js";
import { HTTP_CODES } from "../../types/HttpCodes.js";
import { extractClientToken } from "../../utils/ExtractClientToken.js";
import { APPLICATION_JSON_HEADER } from "../../utils/DefaultCorsHeaders.js";
import { initServices } from "../init.js";
import { ErrorResponse, SessionResponse } from "@cookbook/shared";

const { userService } = initServices();

export async function handler(
  event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyStructuredResultV2> {
  // authorization in the form of `Bearer ${long-term-auth-token}`, parse to remove "Bearer"
  // error handling must exist here to catch errors and parse into an HTTP response

  const authorization: string | undefined = event.headers?.authorization;
  if (!authorization) {
    // authorization not given, automatically unauthorized
    return HttpResponseBuilder.buildCustomResponse(
      HTTP_CODES.get("unauthorized")!,
      { message: "Authorization header not given" } as ErrorResponse,
      APPLICATION_JSON_HEADER,
    );
  }

  const clientToken: string | undefined = extractClientToken(authorization);
  if (!clientToken) {
    return HttpResponseBuilder.buildCustomResponse(
      HTTP_CODES.get("unauthorized")!,
      { message: "Authorization header must begin with 'Bearer' " } as ErrorResponse,
      APPLICATION_JSON_HEADER,
    );
  }

  try {
    const { userDto, shortTermToken } = await userService.validateSession(clientToken);
    return HttpResponseBuilder.successfulJsonResponse({
      user: userDto,
      shortTermAuth: shortTermToken,
    } as SessionResponse);
  } catch (error: unknown) {
    // use HttpResponseBuilder to build the error
    return HttpResponseBuilder.buildErrorResponse(error);
  }
}
