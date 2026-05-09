import { UserDto } from "../../../domain/dto/user/UserDto.js";
import { BaseResponse } from "../BaseResponse.js";

/**
 * Endpoint: /user/me/email
 *
 * Returns the user with the updated Email
 */
export interface UpdateEmailResponse extends BaseResponse {
  readonly user: UserDto;
}
