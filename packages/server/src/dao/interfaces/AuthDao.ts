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
   * Gets an AuthToken by a given ID
   * 
   * @param tokenId tokenId of the AuthToken to retrieve
   * @returns The AuthToken if exists, null otherwise
   */
  getAuthToken: (tokenId: string) => Promise<AuthToken | null>;
}
