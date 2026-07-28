/**
 * Endpoint: /user/me
 */

import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from "aws-lambda";
import { initServices } from "../init.js";
import {
  AuthorizationExistsResponse,
  validateAuthorizationExists,
} from "../../utils/ValidateAuthorizationExists.js";
import { GetUserResponse, UserDto } from "@cookbook/shared";
import { HttpResponseBuilder } from "../../utils/HttpResponseBuilder.js";

const { userService } = initServices();

export async function handler(
  event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyStructuredResultV2> {
  const authorization: string | undefined = event.headers?.authorization;
  const authorizationExists: AuthorizationExistsResponse =
    validateAuthorizationExists(authorization);

  if (!authorizationExists.exists) {
    return authorizationExists.error!;
  }

  try {
    const user: UserDto = await userService.getUser(authorizationExists.clientToken!);
    return HttpResponseBuilder.successfulJsonResponse({ user: user } as GetUserResponse);
  } catch (error: unknown) {
    return HttpResponseBuilder.buildErrorResponse(error);
  }
}
