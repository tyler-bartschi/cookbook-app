import { BaseRequest } from "../BaseRequest.js";

/**
 * Endpoint: /auth/logout
 *
 * May provide an optional field, invalidateLongTermAuth, to invalidate the user's long term auth token if exists
 */
export interface LogoutRequest extends BaseRequest {
  readonly invalidateLongTermAuth?: boolean;
}
