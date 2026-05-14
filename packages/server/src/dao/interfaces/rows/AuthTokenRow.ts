export interface AuthTokenRow {
  readonly token_id: string;
  readonly token: string;
  readonly type: "long" | "short";
  readonly user_id: string;
  readonly created_at: string;
  readonly last_used_at: string;
  readonly expires_at: string;
  readonly revoked_at: string;
  readonly ttl_at: number; // must be epoch SECONDS
}
