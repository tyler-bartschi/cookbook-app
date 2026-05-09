import { UserDto } from "../../../domain/dto/user/UserDto.js";
import { BaseResponse } from "../BaseResponse.js";

/**
 * Endpoint: /user/me/username
 *
 * Returns the new UserDto
 */
export interface UpdateUsernameResponse extends BaseResponse {
  readonly user: UserDto;
}
