import { PublicUserDto } from "../../../domain/dto/user/PublicUserDto.js";
import { BaseResponse } from "../BaseResponse.js";

/**
 * Endpoint: /user/{user_id}
 *
 * Returns a public user dto
 */
export interface GetPublicUserResponse extends BaseResponse {
  readonly user: PublicUserDto;
}
