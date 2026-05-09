import { BaseRequest } from "../BaseRequest.js";

/**
 * Endpoint: /user/me/email
 *
 * Updates the user's email, requires password verification
 */
export interface UpdateEmailRequest extends BaseRequest {
  readonly newEmail: string;
  readonly password: string;
}
