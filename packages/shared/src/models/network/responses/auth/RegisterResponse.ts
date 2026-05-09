import { AuthDto } from "../../../domain/dto/auth/AuthDto.js";
import { UserDto } from "../../../domain/dto/user/UserDto.js";
import { BaseResponse } from "../BaseResponse.js";

/**
 * Endpoint: /auth/register
 *
 * Returns the UserDto, and both short term and long term AuthDtos
 */
export interface RegisterResponse extends BaseResponse {
  readonly user: UserDto;
  readonly shortTermAuth: AuthDto;
  readonly longTermAuth?: AuthDto;
}
