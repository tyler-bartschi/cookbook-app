import { serverConfig } from "../../config/serverConfig.js";
import { AuthTokenRow } from "../../dao/interfaces/rows/AuthTokenRow.js";
import { AuthParseError } from "../errors/AuthParseError.js";

export type AuthTokenType = "long" | "short";

export class AuthToken {
  private _tokenId: string;
  private _hashedToken: string; // the token the user gets has the form ${tokenId}.{token}
  private _type: AuthTokenType;
  private _userId: string;
  private _createdAt: Date;
  private _lastUsedAt: Date;
  private _expiresAt: Date;
  private _revokedAt: Date | null;
  private _ttlAt: number; // epoch time in milliseconds

  public constructor(
    tokenId: string,
    hashedToken: string,
    type: AuthTokenType,
    userId: string,
    createdAt: Date,
    lastUsedAt: Date,
    expiresAt: Date,
    revokedAt: Date | null,
    ttlAt: number,
  ) {
    this._tokenId = tokenId;
    this._hashedToken = hashedToken;
    this._type = type;
    this._userId = userId;
    this._createdAt = createdAt;
    this._lastUsedAt = lastUsedAt;
    this._expiresAt = expiresAt;
    this._revokedAt = revokedAt;
    this._ttlAt = ttlAt;
  }

  public get tokenId(): string {
    return this._tokenId;
  }

  public get hashedToken(): string {
    return this._hashedToken;
  }

  public get type(): AuthTokenType {
    return this._type;
  }

  public get userId(): string {
    return this._userId;
  }

  public get createdAt(): Date {
    return this._createdAt;
  }

  public get lastUsedAt(): Date {
    return this._lastUsedAt;
  }

  public get expiresAt(): Date {
    return this._expiresAt;
  }

  public get revokedAt(): Date | null {
    return this._revokedAt;
  }

  public get ttlAt(): number {
    return this._ttlAt;
  }

  public set lastUsedAt(now: Date) {
    this._lastUsedAt = now;
  }

  public set expiresAt(expireDate: Date) {
    this._expiresAt = expireDate;
  }

  public set revokedAt(now: Date) {
    this._revokedAt = now;
  }

  public set ttlAt(ttlTime: number) {
    this._ttlAt = ttlTime;
  }

  public convertToAuthTokenRow(): AuthTokenRow {
    // converts ttl_at from milliseconds to seconds
    if (!this.tokenId || !this.hashedToken) {
      throw new AuthParseError("Auth tokenId or token malformed");
    }

    return {
      token_id: this.tokenId,
      token: this.hashedToken,
      type: this.type,
      user_id: this.userId,
      created_at: this.createdAt.toISOString(),
      last_used_at: this.lastUsedAt.toISOString(),
      expires_at: this.expiresAt.toISOString(),
      revoked_at: this.revokedAt?.toISOString() ?? null,
      ttl_at: Math.floor(this.ttlAt / 1000),
    };
  }

  public static toAuthToken(authTokenRow: AuthTokenRow): AuthToken {
    // converts ttl_at from seconds to milliseconds
    if (!authTokenRow.token_id || !authTokenRow.token) {
      throw new AuthParseError("Auth tokenId or token malformed");
    }

    return new AuthToken(
      authTokenRow.token_id,
      authTokenRow.token,
      authTokenRow.type,
      authTokenRow.user_id,
      new Date(authTokenRow.created_at),
      new Date(authTokenRow.last_used_at),
      new Date(authTokenRow.expires_at),
      !authTokenRow.revoked_at ? null : new Date(authTokenRow.revoked_at),
      authTokenRow[serverConfig.auth.ttlKey] * 1000,
    );
  }
}
