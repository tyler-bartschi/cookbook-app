import { AuthDto } from "../../../domain/dto/auth/AuthDto.js";
import { UserDto } from "../../../domain/dto/user/UserDto.js";
import { BaseResponse } from "../BaseResponse.js";

/**
 * Endpoint: /auth/login
 *
 * Returns the UserDto and both the long term and short term AuthDtos
 */
export interface LoginResponse extends BaseResponse {
  readonly user: UserDto;
  readonly shortTermAuth: AuthDto;
  readonly longTermAuth?: AuthDto;
}
