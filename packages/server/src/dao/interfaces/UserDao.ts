import { User } from "../../model/entity/User.js";

export interface UserDao {
  /**
   * Gets the user by their username
   * 
   * @param username username of the user to find
   * @returns the User if exists, null otherwise
   */
  getUserByUsername: (username: string) => Promise<User | null>;

  /**
   * Gets the user by their email
   * 
   * @param email email of the user to find
   * @returns the User if exists, null otherwise
   */
  getUserByEmail: (email: string) => Promise<User | null>;

  /**
   * Adds the user to the database
   * 
   * @param user newly created user to persist
   * @returns the User object with updated createdAt and updatedAt fields
   */
  createUser: (user: User) => Promise<User>;
}
