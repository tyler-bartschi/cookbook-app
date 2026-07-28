/**
 * Endpoint: /auth/login
 */

import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from "aws-lambda";
import { initServices } from "../init.js";
import { FieldValidator } from "../../utils/FieldValidator.js";
import { LoginRequestSchema, LoginResponse } from "@cookbook/shared";
import { HttpResponseBuilder } from "../../utils/HttpResponseBuilder.js";

const { userService } = initServices();

export async function handler(
  event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyStructuredResultV2> {
  const result = new FieldValidator(event.body ?? "", LoginRequestSchema).result;

  if (!result.isValid) {
    return result.error;
  }

  try {
    const body: LoginResponse = await userService.loginUser(result.data);
    return HttpResponseBuilder.successfulJsonResponse(body);
  } catch (error: unknown) {
    return HttpResponseBuilder.buildErrorResponse(error);
  }
}
