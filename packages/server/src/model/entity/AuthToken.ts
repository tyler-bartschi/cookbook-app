export class AuthToken {
  private _token: string; // has the form of ${tokenId}.${token}
  private _type: "long" | "short";
  private _userId: string;
  private _createdAt: Date;
  private _lastUsedAt: Date;
  private _expiresAt: Date;
  private _revokedAt: Date;
  private _ttlAt: number; // epoch time in milliseconds

  public constructor(
    token: string,
    type: "long" | "short",
    userId: string,
    createdAt: Date,
    lastUsedAt: Date,
    expiresAt: Date,
    revokedAt: Date,
    ttlAt: number,
  ) {
    this._token = token;
    this._type = type;
    this._userId = userId;
    this._createdAt = createdAt;
    this._lastUsedAt = lastUsedAt;
    this._expiresAt = expiresAt;
    this._revokedAt = revokedAt;
    this._ttlAt = ttlAt;
  }

  public get token(): string {
    return this._token;
  }

  public get type(): "long" | "short" {
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

  public get revokedAt(): Date {
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
    this._ttlAt = now.getTime();
  }

  public set ttlAt(ttlTime: number) {
    this._ttlAt = ttlTime;
  }

  public isExpired(now: Date): boolean {
    return this._expiresAt <= now;
  }
  
  public isRevoked(now: Date): boolean {
    return this._revokedAt <= now;
  }
}
