import { AuthDao } from "../AuthDao.js";
import { UserDao } from "../UserDao.js";

export interface DaoFactory {
  /**
   * 
   * @returns the initialized AuthDao
   */
  getAuthDao: () => AuthDao;

  /**
   * 
   * @returns the initialized UserDao
   */
  getUserDao: () => UserDao;
}
