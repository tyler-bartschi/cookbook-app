/**
 * Endpoint: /auth/session
 */

import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from "aws-lambda";
import { HttpResponseBuilder } from "../../utils/HttpResponseBuilder.js";
import { initServices } from "../init.js";
import { SessionResponse } from "@cookbook/shared";
import {
  AuthorizationExistsResponse,
  validateAuthorizationExists,
} from "../../utils/ValidateAuthorizationExists.js";

const { userService } = initServices();

export async function handler(
  event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyStructuredResultV2> {
  // authorization in the form of `Bearer ${long-term-auth-token}`, parse to remove "Bearer"
  // error handling must exist here to catch errors and parse into an HTTP response

  const authorization: string | undefined = event.headers?.authorization;
  const authorizationExists: AuthorizationExistsResponse =
    validateAuthorizationExists(authorization);

  if (!authorizationExists.exists) {
    return authorizationExists.error!;
  }

  try {
    const { userDto, shortTermToken } = await userService.validateSession(
      authorizationExists.clientToken!,
    );
    return HttpResponseBuilder.successfulJsonResponse({
      user: userDto,
      shortTermAuth: shortTermToken,
    } as SessionResponse);
  } catch (error: unknown) {
    // use HttpResponseBuilder to build the error
    return HttpResponseBuilder.buildErrorResponse(error);
  }
}
