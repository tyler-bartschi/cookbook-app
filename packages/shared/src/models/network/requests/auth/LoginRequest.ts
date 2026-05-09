import { BaseRequest } from "../BaseRequest.js";

interface LoginWithEmail {
  readonly email: string;
  readonly username?: never;
}

interface LoginWithUsername {
  readonly username: string;
  readonly email?: never;
}

interface BaseLoginRequest extends BaseRequest {
  readonly password: string;
  readonly rememberMe: boolean;
}

/**
 * Endpoint: /auth/login
 *
 * Username OR email must be provided, but not both
 */
export type LoginRequest = BaseLoginRequest & (LoginWithEmail | LoginWithUsername);
