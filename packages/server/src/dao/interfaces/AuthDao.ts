import { AuthToken } from "../../model/entity/AuthToken.js";

export interface AuthDao {
  /**
   * Persists the given AuthToken into the database
   *
   * @param token the AuthToken to persist
   * @returns void
   */
  createAuthToken: (token: AuthToken) => Promise<void>;

  /**
   * Gets a short term AuthToken by a given ID
   *
   * @param tokenId short term tokenId of the AuthToken to retrieve
   * @returns The AuthToken if exists, null otherwise
   */
  getShortTermAuthToken: (tokenId: string) => Promise<AuthToken | null>;

  /**
   * Gets a long term AuthToken by a given ID
   *
   * @param tokenId long term tokenId of the AuthToken to retrieve
   * @returns The AuthToken if exists, null otherwise
   */
  getLongTermAuthToken: (tokenId: string) => Promise<AuthToken | null>;

  /**
   * Updates an existing AuthToken in the database
   *
   * @param token the AuthToken to update
   * @returns void
   */
  updateAuthToken: (token: AuthToken) => Promise<void>;

  /**
   * Gets all the short term auth tokens for a given userId
   *
   * @param userId userId to get tokens for
   * @returns an array of tokens
   */
  getAllActiveShortTermAuthTokens: (userId: string) => Promise<AuthToken[]>;

  /**
   * Gets all the long term auth tokens for a given userId
   *
   * @param userId userId to get tokens for
   * @returns an array of tokens
   */
  getAllActiveLongTermAuthTokens: (userId: string) => Promise<AuthToken[]>;

  /** 
   * Updates all auth tokens in the given array, can be either short or long term
   * 
   * @param tokens array of short and/or long term auth tokens to update
   * @returns void
   */
  updateMultipleAuthTokens: (tokens: AuthToken[]) => Promise<void>;
}
