import { BaseRequest } from "../BaseRequest.js";

/**
 * Endpoint: /auth/register
 * 
 * Profile image may be provided upon register, but is not required
 */
export interface RegisterRequest extends BaseRequest {
  readonly username: string;
  readonly email: string;
  readonly password: string;
  readonly rememberMe: boolean;
  readonly imageBytesAsBase64String?: string;
  readonly imageFileExtension?: string;
}