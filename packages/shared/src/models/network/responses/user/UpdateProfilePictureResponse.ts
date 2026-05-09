import { UserDto } from "../../../domain/dto/user/UserDto.js";
import { BaseResponse } from "../BaseResponse.js";

/**
 * Endpoint: /user/me/profile-picture
 *
 * Returns the new UserDto
 */
export interface UpdateProfilePictureResponse extends BaseResponse {
  readonly user: UserDto;
}
