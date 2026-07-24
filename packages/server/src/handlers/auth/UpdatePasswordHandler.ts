/**
 * Endpoint: /auth/change-password
 */

import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from "aws-lambda";
import { initServices } from "../init.js";
import { FieldValidator } from "../../utils/FieldValidator.js";
import { UpdatePasswordRequestSchema } from "@cookbook/shared";
import {
  AuthorizationExistsResponse,
  validateAuthorizationExists,
} from "../../utils/ValidateAuthorizationExists.js";
import { HttpResponseBuilder } from "../../utils/HttpResponseBuilder.js";
import { UpdatePasswordResponse } from "../../../../shared/dist/models/network/responses/auth/UpdatePasswordResponse.js";

const { userService } = initServices();

export async function handler(
  event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyStructuredResultV2> {
  const result = new FieldValidator(event.body ?? "", UpdatePasswordRequestSchema).result;

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
    const body: UpdatePasswordResponse = await userService.updatePassword(
      authorizationExists.clientToken!,
      result.data,
    );
    return HttpResponseBuilder.successfulJsonResponse(body);
  } catch (error: unknown) {
    return HttpResponseBuilder.buildErrorResponse(error);
  }
}
