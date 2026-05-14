import { AuthDao } from "../AuthDao.js";
import { ImageDao } from "../ImageDao.js";
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

  /**
   * 
   * @returns the initialized ImageDao
   */
  getImageDao: () => ImageDao;
}
