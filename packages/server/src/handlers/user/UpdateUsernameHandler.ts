/**
 * Endpoint: /user/me/username
 */

import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from "aws-lambda";
import { initServices } from "../init.js";
import { FieldValidator } from "../../utils/FieldValidator.js";
import { UpdateUsernameRequestSchema, UpdateUsernameResponse, UserDto } from "@cookbook/shared";
import {
  AuthorizationExistsResponse,
  validateAuthorizationExists,
} from "../../utils/ValidateAuthorizationExists.js";
import { HttpResponseBuilder } from "../../utils/HttpResponseBuilder.js";

const { userService } = initServices();

export async function handler(
  event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyStructuredResultV2> {
  const result = new FieldValidator(event.body ?? "", UpdateUsernameRequestSchema).result;

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
    const user: UserDto = await userService.updateUsername(
      authorizationExists.clientToken!,
      result.data,
    );
    return HttpResponseBuilder.successfulJsonResponse({ user: user } as UpdateUsernameResponse);
  } catch (error: unknown) {
    return HttpResponseBuilder.buildErrorResponse(error);
  }
}
