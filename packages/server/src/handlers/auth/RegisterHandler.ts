/**
 * Endpoint: /auth/register
 */
import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from "aws-lambda";
import { FieldValidator } from "../../utils/FieldValidator.js";
import { RegisterRequestSchema, RegisterResponse } from "@cookbook/shared";
import { initServices } from "../init.js";
import { HttpResponseBuilder } from "../../utils/HttpResponseBuilder.js";
import { HTTP_CODES } from "../../utils/HttpCodes.js";
import { APPLICATION_JSON_HEADER } from "../../utils/DefaultCorsHeaders.js";

const { userService } = initServices();

export async function handler(
  event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyStructuredResultV2> {
  // Validate request body, return error if validation fails
  const result = new FieldValidator(event.body ?? "", RegisterRequestSchema).result;

  if (!result.isValid) {
    return result.error;
  }

  try {
    const body: RegisterResponse = await userService.registerUser(result.data);
    return HttpResponseBuilder.buildCustomResponse(
      HTTP_CODES.get("created")!,
      body,
      APPLICATION_JSON_HEADER,
    );
  } catch (error: unknown) {
    return HttpResponseBuilder.buildErrorResponse(error);
  }
}
