/**
 * Endpoint: /user/me/profile-picture
 */

import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from "aws-lambda";
import { initServices } from "../init.js";
import { FieldValidator } from "../../utils/FieldValidator.js";
import { UpdateProfilePictureRequestSchema, UpdateProfilePictureResponse, UserDto } from "@cookbook/shared";
import {
  AuthorizationExistsResponse,
  validateAuthorizationExists,
} from "../../utils/ValidateAuthorizationExists.js";
import { HttpResponseBuilder } from "../../utils/HttpResponseBuilder.js";

const { userService } = initServices();

export async function handler(
  event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyStructuredResultV2> {
  const result = new FieldValidator(event.body ?? "", UpdateProfilePictureRequestSchema).result;

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
    const user: UserDto = await userService.updateProfilePicture(
      authorizationExists.clientToken!,
      result.data,
    );
    return HttpResponseBuilder.successfulJsonResponse({
      user: user,
    } as UpdateProfilePictureResponse);
  } catch (error: unknown) {
    return HttpResponseBuilder.buildErrorResponse(error);
  }
}
