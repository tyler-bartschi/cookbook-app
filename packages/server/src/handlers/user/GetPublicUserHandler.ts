/**
 * Endpoint: /user/{type}/{id}
 */

import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from "aws-lambda";
import { initServices } from "../init.js";
import { HttpResponseBuilder } from "../../utils/HttpResponseBuilder.js";
import { HTTP_CODES } from "../../utils/HttpCodes.js";
import { ErrorResponse, GetPublicUserResponse, PublicUserDto } from "@cookbook/shared";
import { APPLICATION_JSON_HEADER } from "../../utils/DefaultCorsHeaders.js";

const { userService } = initServices();

export async function handler(
  event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyStructuredResultV2> {
  const type = event.pathParameters?.type;
  const id = event.pathParameters?.id;

  if (!type) {
    return HttpResponseBuilder.buildCustomResponse(
      HTTP_CODES.get("bad-request")!,
      { message: "type path parameter missing" } as ErrorResponse,
      APPLICATION_JSON_HEADER,
    );
  }

  if (!id) {
    return HttpResponseBuilder.buildCustomResponse(
      HTTP_CODES.get("bad-request")!,
      { message: "id path parameter missing" } as ErrorResponse,
      APPLICATION_JSON_HEADER,
    );
  }

  try {
    const user: PublicUserDto = await userService.getPublicUser(
      type.trim().toLowerCase(),
      id.trim().toLowerCase(),
    );
    return HttpResponseBuilder.successfulJsonResponse({ user: user } as GetPublicUserResponse);
  } catch (error: unknown) {
    return HttpResponseBuilder.buildErrorResponse(error);
  }
}
