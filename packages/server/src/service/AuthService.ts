import { AuthDto } from "@cookbook/shared";
import { AuthDao } from "../dao/interfaces/AuthDao.js";
import { DaoFactory } from "../dao/interfaces/factory/DaoFactory.js";
import { AuthToken, AuthTokenType } from "../model/entity/AuthToken.js";
import { randomBytes, createHash } from "node:crypto";
import { DataAccessError } from "../model/errors/DataAccessError.js";
import { AuthServiceError } from "../model/errors/AuthServiceError.js";

export interface AuthValidationResult {
  valid: boolean;
  reason: string;
}

const MAXIMUM_TIME_TO_LIVE: number = 30 * 24 * 60 * 60 * 1000; // 30 days
const LONG_TIME_TO_LIVE: number = 7 * 24 * 60 * 60 * 1000; // 7 days
const SHORT_TIME_TO_LIVE: number = 2 * 60 * 60 * 1000; // 2 hours
const ONE_DAY: number = 24 * 60 * 60 * 1000;

export class AuthService {
  private _authDao: AuthDao;

  public constructor(daoFactory: DaoFactory) {
    this._authDao = daoFactory.getAuthDao();
  }

  private get authDao(): AuthDao {
    return this._authDao;
  }

  /**
   * Creates a short term auth token
   *
   * @param userId userId of the user the auth token is for
   * @returns AuthDto to return to the client
   */
  public async createShortTermAuthToken(userId: string): Promise<AuthDto> {
    return await this.createAuthToken(userId, "short");
  }

  /**
   * Creates a long term auth token
   *
   * @param userId userId of the user the auth token is for
   * @returns AuthDto to return to the client
   */
  public async createLongTermAuthToken(userId: string): Promise<AuthDto> {
    return await this.createAuthToken(userId, "long");
  }

  /**
   * Checks if the authToken is valid. Updates lastUsedAt, expiresAt, and ttlAt.
   *
   * @param authDto the AuthDto the client sent for a given user
   * @returns AuthValidationResult
   */
  public async isAuthTokenValid(authDto: AuthDto): Promise<AuthValidationResult> {
    // authDto coming in has already been parsed and validated by zod in the handler
    // an AuthToken is valid when it is not expired, not revoked, the hashed tokens match, the userIds match, and it has not exceeded the maximum time to live
    const { tokenId, rawToken, userId, type } = this.processAuthDto(authDto);
    const hashedToken: string = this.hashToken(rawToken);

    const existingAuthToken: AuthToken | null =
      type === "short"
        ? await this.authDao.getShortTermAuthToken(tokenId)
        : await this.authDao.getLongTermAuthToken(tokenId);

    if (!existingAuthToken) {
      return {
        valid: false,
        reason: "No matching auth token",
      };
    }
    if (userId !== existingAuthToken.userId) {
      return {
        valid: false,
        reason: "User ids do not match",
      };
    }
    if (hashedToken !== existingAuthToken.hashedToken) {
      return {
        valid: false,
        reason: "Hashed tokens do not match",
      };
    }
    if (existingAuthToken.revokedAt) {
      return {
        valid: false,
        reason: "Auth token has been revoked",
      };
    }

    const now = Date.now();
    if (now > existingAuthToken.expiresAt.getTime()) {
      return {
        valid: false,
        reason: "Auth token has expired",
      };
    }
    if (now > existingAuthToken.createdAt.getTime() + MAXIMUM_TIME_TO_LIVE) {
      return {
        valid: false,
        reason: "Auth token has exceeded the maximum time to live",
      };
    }

    existingAuthToken.lastUsedAt = new Date(now);
    existingAuthToken.expiresAt = new Date(
      Math.min(
        now + (type === "short" ? SHORT_TIME_TO_LIVE : LONG_TIME_TO_LIVE),
        existingAuthToken.createdAt.getTime() + MAXIMUM_TIME_TO_LIVE,
      ),
    );
    existingAuthToken.ttlAt = existingAuthToken.expiresAt.getTime() + ONE_DAY;

    try {
      await this.authDao.updateAuthToken(existingAuthToken);
    } catch (error: unknown) {
      const errorMessage: string = this.parseErrorMessage(error);
      console.error(`Failed to update AuthToken: ${errorMessage}`);
      return {
        valid: false,
        reason: `Failed to update AuthToken: ${errorMessage}`,
      };
    }

    return {
      valid: true,
      reason: "Validation successful",
    };
  }

  /**
   * Revokes the authToken, setting revokedAt and ttlAt
   *
   * @param authDto the AuthDto the client sent for a given user
   */
  public async revokeAuthToken(authDto: AuthDto): Promise<void> {
    // authDto coming in has already been parsed and validated by zod in the handler
    const { tokenId, rawToken, userId, type } = this.processAuthDto(authDto);
    const hashedToken: string = this.hashToken(rawToken);

    const existingAuthToken: AuthToken | null =
      type === "short"
        ? await this.authDao.getShortTermAuthToken(tokenId)
        : await this.authDao.getLongTermAuthToken(tokenId);

    if (!existingAuthToken) {
      return;
    }

    if (existingAuthToken.userId !== userId) {
      console.warn(
        `An AuthToken attempting to be revoked did not belong to the user. AuthToken's userId: ${existingAuthToken.userId} !== Requesting userId: ${userId}`,
      );
      return;
    }

    if (hashedToken !== existingAuthToken.hashedToken) {
      console.warn(`Hashed tokens do not match on a revoke AuthToken request`);
      return;
    }

    if (existingAuthToken.revokedAt) {
      // Auth token already revoked
      return;
    }

    const now: number = Date.now();
    existingAuthToken.revokedAt = new Date(now);
    existingAuthToken.ttlAt = now + ONE_DAY;

    await this.authDao.updateAuthToken(existingAuthToken);
  }

  /**
   * Creates the AuthToken, saves it in the databse, and returns the AuthDto for the client
   *
   * @param userId the userId the AuthToken belongs to
   * @param type the type of AuthToken, "short" | "long"
   * @returns the new AuthDto to send to the client
   */
  private async createAuthToken(userId: string, type: AuthTokenType): Promise<AuthDto> {
    // computes the current time, tokenId and rawToken (sent to the user)
    const now: number = Date.now();
    const tokenId: string = this.getTokenId();
    const rawToken: string = this.getRawToken();

    // creates the AuthToken that will be persisted into the database (hashing the rawToken)
    const authToken = new AuthToken(
      tokenId,
      this.hashToken(rawToken),
      type,
      userId,
      new Date(now),
      new Date(now),
      new Date(now + (type === "short" ? SHORT_TIME_TO_LIVE : LONG_TIME_TO_LIVE)),
      null,
      now + (type === "short" ? SHORT_TIME_TO_LIVE : LONG_TIME_TO_LIVE) + ONE_DAY,
    );

    try {
      await this.authDao.createAuthToken(authToken);
    } catch (error: unknown) {
      const errorMessage: string = this.parseErrorMessage(error);
      console.error(`Failed to create auth token: ${errorMessage}`);
      throw new AuthServiceError(`Failed to create ${type} term auth token: ${errorMessage}`);
    }

    return this.createAuthDto(tokenId, rawToken, userId, type);
  }

  /**
   * Processes an AuthDto and returns its values
   *
   * @param authDto the AuthDto to process
   * @returns The tokenId, rawToken, userId, and type destructured from the AuthDto
   */
  private processAuthDto(authDto: AuthDto): {
    tokenId: string;
    rawToken: string;
    userId: string;
    type: AuthTokenType;
  } {
    const [tokenId, rawToken] = authDto.authToken.split(".");
    if (!tokenId || !rawToken) {
      throw new AuthServiceError("AuthToken provided is malformed");
    }

    return {
      tokenId: tokenId.trim(),
      rawToken: rawToken.trim(),
      userId: authDto.userId.trim(),
      type: authDto.type,
    };
  }

  /**
   * Parses an error message that may have come from a DAO
   *
   * @param error the error to parse
   * @returns the error message
   */
  private parseErrorMessage(error: unknown): string {
    return error instanceof DataAccessError
      ? (error.message.split(":")[1]?.trim() ?? "")
      : error instanceof Error
        ? error.message
        : String(error);
  }

  /**
   * Gets a new raw (unhashed) token value
   *
   * @returns Raw token value
   */
  private getRawToken(): string {
    return randomBytes(32).toString("base64url");
  }

  /**
   * Hashes a given token
   *
   * @param token raw token to hash
   * @returns the hashed token
   */
  private hashToken(token: string): string {
    return createHash("sha256").update(token).digest("hex");
  }

  /**
   * Gets a new tokenId
   *
   * @returns new tokenId
   */
  private getTokenId(): string {
    return crypto.randomUUID();
  }

  /**
   * Creates the new client AuthDto
   *
   * @param tokenId tokenId
   * @param rawToken the raw (unhashed) token
   * @param userId the userId for the AuthToken
   * @param type the type of token, "short" | "long"
   * @returns the AuthDto to be sent to the client
   */
  private createAuthDto(
    tokenId: string,
    rawToken: string,
    userId: string,
    type: AuthTokenType,
  ): AuthDto {
    return {
      authToken: `${tokenId}.${rawToken}`,
      userId: userId,
      type: type,
    };
  }
}
