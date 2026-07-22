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
}
