import { BaseRequest } from "../BaseRequest.js";

/**
 * Endpoint: /auth/change-password
 * 
 * Sends the password and the new password to update
 */
export interface ChangePasswordRequest extends BaseRequest {
  readonly password: string;
  readonly newPassword: string;
}
