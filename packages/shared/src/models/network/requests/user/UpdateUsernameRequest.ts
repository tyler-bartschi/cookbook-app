import { BaseRequest } from "../BaseRequest.js";

/**
 * Endpoint: /user/me/username
 *
 * Updates the user's username, requires password verification
 */
export interface UpdateUsernameRequest extends BaseRequest {
  readonly newUsername: string;
  readonly password: string;
}
