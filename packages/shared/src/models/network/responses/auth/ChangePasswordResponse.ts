import { AuthDto } from "../../../domain/dto/auth/AuthDto.js";
import { BaseResponse } from "../BaseResponse.js";

/**
 * Endpoint: /auth/change-password
 *
 * Returns the new AuthDtos for that user
 */
export interface ChangePasswordResponse extends BaseResponse {
  readonly shortTermAuth: AuthDto;
  readonly longTermAuth?: AuthDto;
}
