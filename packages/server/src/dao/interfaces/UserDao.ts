import { User } from "../../model/entity/User.js";

export interface UserDao {
  /**
   * Gets the user by their userId
   *
   * @param userId userId of the user to find
   * @returns the User if it exists, null otherwise
   */
  getUserById: (userId: string) => Promise<User | null>;

  /**
   * Gets the user by their username
   *
   * @param username username of the user to find
   * @returns the User if it exists, null otherwise
   */
  getUserByUsername: (username: string) => Promise<User | null>;

  /**
   * Gets the user by their email
   *
   * @param email email of the user to find
   * @returns the User if it exists, null otherwise
   */
  getUserByEmail: (email: string) => Promise<User | null>;

  /**
   * Adds the user to the database. Simultaneously creates 3 entries: the base user, the username lookup entry, and the email lookup entry.
   * The username and email entries also ensure username and emails are unique
   *
   * @param user newly created user to persist
   * @returns void
   */
  createUser: (user: User) => Promise<void>;

  /**
   * Updates a given user in the database, but only profilePictureUrl, password, and updatedAt
   * 
   * @param user The user to update (with updated fields)
   * @returns void
   */
  updateUser: (user: User) => Promise<void>;

  /**
   * Updates a user's username, along with the associated lookups
   * 
   * @param user The user with the new information to save
   * @param currentUsername the current username associated with the user (not the new one)
   * @returns void
   */
  updateUsername: (user: User, currentUsername: string) => Promise<void>;

  /**
   * Updates a user's email, along with the associated lookups
   * 
   * @param user the user with the new information to save
   * @param currentEmail the current email associated with the user (not the new one)
   * @returns void
   */
  updateEmail: (user: User, currentEmail: string) => Promise<void>;
}
