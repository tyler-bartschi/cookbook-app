/**
 * Endpoint: /user/{type}/{id}
 */

import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from "aws-lambda";
import { initServices } from "../init.js";
import { HttpResponseBuilder } from "../../utils/HttpResponseBuilder.js";
import { HTTP_CODES } from "../../utils/HttpCodes.js";
import { ErrorResponse, GetPublicUserResponse, PublicUserDto } from "@cookbook/shared";
import { APPLICATION_JSON_HEADER } from "../../utils/DefaultCorsHeaders.js";
import { UserLookupType } from "../../types/UserLookupType.js";

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

  let trueType: UserLookupType;
  const tempType = type.trim().toLowerCase();
  if (tempType === UserLookupType.USERNAME) {
    trueType = UserLookupType.USERNAME;
  } else if (tempType === UserLookupType.USERID) {
    trueType = UserLookupType.USERID;
  } else {
    return HttpResponseBuilder.buildCustomResponse(
      HTTP_CODES.get("bad-request")!,
      { message: "type path parameter is incorrect" } as ErrorResponse,
      APPLICATION_JSON_HEADER,
    );
  }

  if (!id || !id.trim()) {
    return HttpResponseBuilder.buildCustomResponse(
      HTTP_CODES.get("bad-request")!,
      { message: "id path parameter missing" } as ErrorResponse,
      APPLICATION_JSON_HEADER,
    );
  }

  try {
    const user: PublicUserDto = await userService.getPublicUser(
      trueType,
      id.trim(),
    );
    return HttpResponseBuilder.successfulJsonResponse({ user: user } as GetPublicUserResponse);
  } catch (error: unknown) {
    return HttpResponseBuilder.buildErrorResponse(error);
  }
}
