import { AuthDao } from "../../interfaces/AuthDao.js";
import { DaoFactory } from "../../interfaces/factory/DaoFactory.js";
import { UserDao } from "../../interfaces/UserDao.js";
import { DynamoAuthDao } from "../DynamoAuthDao.js";
import { DynamoUserDao } from "../DynamoUserDao.js";

export class DynamoDaoFactory implements DaoFactory {
  private _authDao: AuthDao;
  private _userDao: UserDao;

  public constructor() {
    this._authDao = new DynamoAuthDao();
    this._userDao = new DynamoUserDao();
  }
  
  public getAuthDao(): AuthDao {
    return this._authDao;
  }

  public getUserDao(): UserDao {
    return this._userDao;
  }
}