// user service needs to check if username or email exist before attempting to create a new user
// dynamo db will not allow (bc of condition expressions) a user to be created with an already existing email or username,
// but won't give details about why it failed. so make sure to check before!

import { AuthDto, UserDto } from "@cookbook/shared";
import { DaoFactory } from "../dao/interfaces/factory/DaoFactory.js";
import { UserDao } from "../dao/interfaces/UserDao.js";
import { StorageFactory } from "../storage/interfaces/factory/StorageFactory.js";
import { ImageStorage } from "../storage/interfaces/ImageStorage.js";
import { AuthService, AuthValidationResult } from "./AuthService.js";
import { UserServiceError } from "../model/errors/informative-error-code/UserServiceError.js";
import { HTTP_CODES } from "../types/HttpCodes.js";
import { User } from "../model/entity/User.js";

export class UserService {
  private readonly _userDao: UserDao;
  private readonly _imageStorage: ImageStorage;
  private readonly _authService: AuthService;

  public constructor(daoFactory: DaoFactory, storageFactory: StorageFactory) {
    this._userDao = daoFactory.getUserDao();
    this._imageStorage = storageFactory.getImageStorage();
    this._authService = new AuthService(daoFactory);
  }

  public async validateSession(longTermAuthToken: string): Promise<{
    userDto: UserDto;
    shortTermToken: AuthDto;
  }> {
    const result: AuthValidationResult = await this._authService.isAuthTokenValid(
      longTermAuthToken,
      "long",
    );

    if (!result.valid) {
      throw new UserServiceError(`Unauthorized: ${result.reason}`, HTTP_CODES.get("unauthorized"));
    }

    const userId: string | undefined = result.userId;
    if (!userId) {
      throw new UserServiceError(
        `Internal error: No userId associated with AuthToken`,
        HTTP_CODES.get("internal-server-error"),
      );
    }

    const user: User | null = await this._userDao.getUserById(userId);
    if (!user) {
      throw new UserServiceError(
        "Internal error: Failed to find user",
        HTTP_CODES.get("internal-server-error"),
      );
    }
    const shortTermAuthToken: AuthDto = await this._authService.createShortTermAuthToken(userId);

    return {
      userDto: user.toUserDto(),
      shortTermToken: shortTermAuthToken,
    };
  }
}
