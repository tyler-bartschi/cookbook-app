/**
 * Endpoint: /auth/logout
 */

import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from "aws-lambda";
import { initServices } from "../init.js";
import { FieldValidator } from "../../utils/FieldValidator.js";
import { LogoutRequestSchema } from "@cookbook/shared";
import {
  AuthorizationExistsResponse,
  validateAuthorizationExists,
} from "../../utils/ValidateAuthorizationExists.js";
import { HttpResponseBuilder } from "../../utils/HttpResponseBuilder.js";

// headers can be involved with the FieldValidator, check if I should use that here or in the future

const { userService } = initServices();

export async function handler(
  event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyStructuredResultV2> {
  const result = new FieldValidator(event.body ?? "{}", LogoutRequestSchema).result;

  if (!result.isValid) {
    return result.error;
  }

  const authorization: string | undefined = event.headers?.authorization;
  const authorizationExists: AuthorizationExistsResponse =
    validateAuthorizationExists(authorization);

  if (!authorizationExists.exists) {
    return authorizationExists.error!;
  }

  try {
    await userService.logoutUser(authorizationExists.clientToken!, result.data);
    return HttpResponseBuilder.buildCustomResponse(204);
  } catch (error: unknown) {
    return HttpResponseBuilder.buildErrorResponse(error);
  }
}
