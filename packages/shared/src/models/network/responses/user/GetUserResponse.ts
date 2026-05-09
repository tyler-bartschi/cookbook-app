import { UserDto } from "../../../domain/dto/user/UserDto.js";
import { BaseResponse } from "../BaseResponse.js";

/**
 * Endpoint: /user/me
 *
 * Returns signed-in user's dto
 */
export interface GetUserResponse extends BaseResponse {
  readonly user: UserDto;
}
