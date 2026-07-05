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
}
