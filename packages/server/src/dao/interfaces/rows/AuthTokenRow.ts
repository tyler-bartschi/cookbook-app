import { serverConfig } from "../../../config/serverConfig.js";
import { AuthTokenType } from "../../../model/entity/AuthToken.js";

export interface AuthTokenRow {
  readonly token_id: string;
  readonly token: string;
  readonly type: AuthTokenType;
  readonly user_id: string;
  readonly created_at: string; // stored as ISO string
  readonly last_used_at: string; // ISO string
  readonly expires_at: string; // ISO string
  readonly revoked_at: string | null; // ISO string
  readonly [serverConfig.auth.ttlKey]: number; // must be epoch SECONDS
}
