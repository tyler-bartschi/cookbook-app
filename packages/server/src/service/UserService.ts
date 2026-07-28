// user service needs to check if username or email exist before attempting to create a new user
// dynamo db will not allow (bc of condition expressions) a user to be created with an already existing email or username,
// but won't give details about why it failed. so make sure to check before!

import {
  AuthDto,
  EmailLoginRequest,
  LoginRequest,
  LoginResponse,
  LogoutRequest,
  PublicUserDto,
  RegisterRequest,
  RegisterRequestWithImage,
  RegisterResponse,
  UpdateEmailRequest,
  UpdatePasswordRequest,
  UpdateProfilePictureRequest,
  UpdateUsernameRequest,
  UpdatePasswordResponse,
  UserDto,
  UsernameLoginRequest,
} from "@cookbook/shared";
import { DaoFactory } from "../dao/interfaces/factory/DaoFactory.js";
import { UserDao } from "../dao/interfaces/UserDao.js";
import { StorageFactory } from "../storage/interfaces/factory/StorageFactory.js";
import { ImageStorage } from "../storage/interfaces/ImageStorage.js";
import { AuthService, AuthValidationResult } from "./AuthService.js";
import { UserServiceError } from "../model/errors/informative-error-code/UserServiceError.js";
import { HTTP_CODES } from "../utils/HttpCodes.js";
import { User } from "../model/entity/User.js";
import { createHash } from "node:crypto";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { AuthTokenType } from "../model/entity/AuthToken.js";

export class UserService {
  private readonly _userDao: UserDao;
  private readonly _imageStorage: ImageStorage;
  private readonly _authService: AuthService;

  private readonly saltRounds: number = 10;

  public constructor(daoFactory: DaoFactory, storageFactory: StorageFactory) {
    this._userDao = daoFactory.getUserDao();
    this._imageStorage = storageFactory.getImageStorage();
    this._authService = new AuthService(daoFactory);
  }

  public async validateSession(longTermAuthToken: string): Promise<{
    userDto: UserDto;
    shortTermToken: AuthDto;
  }> {
    const user: User = await this.validateAuthAndReturnUser(longTermAuthToken, "long");
    const shortTermAuthToken: AuthDto = await this._authService.createShortTermAuthToken(
      user.userId,
    );

    return {
      userDto: user.toUserDto(),
      shortTermToken: shortTermAuthToken,
    };
  }

  public async registerUser(request: RegisterRequest): Promise<RegisterResponse> {
    if (await this._userDao.getUserByUsername(request.username)) {
      throw new UserServiceError(
        "Conflict: that username is already taken",
        HTTP_CODES.get("conflict"),
      );
    }

    if (await this._userDao.getUserByEmail(request.email)) {
      throw new UserServiceError(
        "Conflict: that email is already in use",
        HTTP_CODES.get("conflict"),
      );
    }

    const userId: string = uuidv4();

    let profilePictureUrl: string = "";
    try {
      if ((request as RegisterRequestWithImage).imageBytesAsBase64String) {
        const imageBytes: string = (request as RegisterRequestWithImage).imageBytesAsBase64String;
        const filename: string = createHash("sha256").update(imageBytes).digest("hex");

        profilePictureUrl = await this._imageStorage.uploadProfilePicture(
          userId,
          filename,
          imageBytes,
          (request as RegisterRequestWithImage).imageFileExtension,
        );
      }
    } catch (error: unknown) {
      const message: string = error instanceof Error ? error.message : String(error);
      console.error("An error occurred when trying to upload a profile picture:", message);
      profilePictureUrl = "";
    }

    const hashedPassword: string = await bcrypt.hash(request.password, this.saltRounds);

    const now = new Date(Date.now());
    const newUser = new User(
      userId,
      request.username,
      request.email,
      hashedPassword,
      profilePictureUrl,
      now,
      now,
    );

    await this._userDao.createUser(newUser);
    const shortTermAuthToken: AuthDto = await this._authService.createShortTermAuthToken(userId);

    if (request.rememberMe) {
      const longTermAuthToken: AuthDto = await this._authService.createLongTermAuthToken(userId);
      return {
        user: newUser.toUserDto(),
        shortTermAuth: shortTermAuthToken,
        longTermAuth: longTermAuthToken,
      };
    }

    return {
      user: newUser.toUserDto(),
      shortTermAuth: shortTermAuthToken,
    };
  }

  public async loginUser(request: LoginRequest): Promise<LoginResponse> {
    let typeOfRequest: string = "email";
    if ((request as UsernameLoginRequest).username) {
      typeOfRequest = "username";
    }

    const user: User | null =
      typeOfRequest === "email"
        ? await this._userDao.getUserByEmail((request as EmailLoginRequest).email)
        : await this._userDao.getUserByUsername((request as UsernameLoginRequest).username);

    if (!user) {
      throw new UserServiceError(
        "Unauthorized: wrong username or email",
        HTTP_CODES.get("unauthorized"),
      );
    }

    await this.comparePasswords(request.password, user.hashedPassword);

    const shortTermAuthToken: AuthDto = await this._authService.createShortTermAuthToken(
      user.userId,
    );

    if (request.rememberMe) {
      const longTermAuthToken: AuthDto = await this._authService.createLongTermAuthToken(
        user.userId,
      );

      return {
        user: user.toUserDto(),
        shortTermAuth: shortTermAuthToken,
        longTermAuth: longTermAuthToken,
      };
    }

    return {
      user: user.toUserDto(),
      shortTermAuth: shortTermAuthToken,
    };
  }

  public async logoutUser(shortTermAuthToken: string, logoutRequest: LogoutRequest): Promise<void> {
    const result: AuthValidationResult = await this._authService.isAuthTokenValid(
      shortTermAuthToken,
      "short",
    );

    if (!result.valid) {
      throw new UserServiceError(
        `Auth token no longer valid: ${result.reason}`,
        HTTP_CODES.get("unauthorized"),
      );
    }

    await this._authService.revokeAuthToken(shortTermAuthToken, "short");

    if (logoutRequest.invalidateLongTermAuth) {
      await this._authService.revokeAllLongTermAuthTokens(result.userId);
    }
  }

  public async updatePassword(
    shortTermAuthToken: string,
    updatePasswordRequest: UpdatePasswordRequest,
  ): Promise<UpdatePasswordResponse> {
    const user: User = await this.validateAuthAndReturnUser(shortTermAuthToken, "short");

    await this.comparePasswords(updatePasswordRequest.password, user.hashedPassword);

    const newHashedPassword: string = await bcrypt.hash(
      updatePasswordRequest.newPassword,
      this.saltRounds,
    );

    const now = new Date(Date.now());
    user.hashedPassword = newHashedPassword;
    user.updatedAt = now;

    await this._userDao.updateUser(user);

    await this._authService.revokeAuthToken(shortTermAuthToken, "short");
    await this._authService.revokeAllLongTermAuthTokens(user.userId);

    const newShortTermAuthToken: AuthDto = await this._authService.createShortTermAuthToken(
      user.userId,
    );
    // const newLongTermAuthToken: AuthDto = await this._authService.createLongTermAuthToken(
    //   user.userId,
    // );

    return {
      shortTermAuth: newShortTermAuthToken,
      // longTermAuth: newLongTermAuthToken,
    };
  }

  public async getPublicUser(type: string, id: string): Promise<PublicUserDto> {
    let user: User | null = null;

    if (type === "username") {
      user = await this._userDao.getUserByUsername(id);
    } else if (type === "email") {
      user = await this._userDao.getUserByEmail(id);
    } else if (type === "userId") {
      user = await this._userDao.getUserById(id);
    }

    if (!user) {
      throw new UserServiceError(`The requested user does not exist`, HTTP_CODES.get("not-found"));
    }

    return user.toPublicUserDto();
  }

  public async getUser(shortTermAuthToken: string): Promise<UserDto> {
    const user: User = await this.validateAuthAndReturnUser(shortTermAuthToken, "short");

    return user.toUserDto();
  }

  public async updateProfilePicture(
    shortTermAuthToken: string,
    updateRequest: UpdateProfilePictureRequest,
  ): Promise<UserDto> {
    const user: User = await this.validateAuthAndReturnUser(shortTermAuthToken, "short");

    const filename = createHash("sha256")
      .update(updateRequest.imageBytesAsBase64String)
      .digest("hex");
    const newProfilePictureUrl = await this._imageStorage.uploadProfilePicture(
      user.userId,
      filename,
      updateRequest.imageBytesAsBase64String,
      updateRequest.imageFileExtension,
    );

    if (user.profilePictureUrl) {
      try {
        await this._imageStorage.deleteProfilePicture(user.profilePictureUrl, user.userId);
      } catch (error: unknown) {
        // An error occurred trying to delete the old image, delete the new one and throw
        console.error("An error occurred attempting to delete a profile picture:", error);

        try {
          await this._imageStorage.deleteProfilePicture(newProfilePictureUrl, user.userId);
        } catch (error: unknown) {
          console.error("Rollback deletion of new profile picture failed:", error);
        }

        const message = error instanceof Error ? error.message : String(error);
        throw new UserServiceError(
          `An error occurred attempting to delete the old profile picture: ${message}`,
          HTTP_CODES.get("internal-server-error"),
        );
      }
    }

    const now = new Date(Date.now());

    user.profilePictureUrl = newProfilePictureUrl;
    user.updatedAt = now;

    await this._userDao.updateUser(user);

    return user.toUserDto();
  }

  public async updateUsername(
    shortTermAuthToken: string,
    updateRequest: UpdateUsernameRequest,
  ): Promise<UserDto> {
    return await this.updateUserItem(
      shortTermAuthToken,
      { password: updateRequest.password, newField: updateRequest.newUsername },
      "username",
      async (key: string) => await this._userDao.getUserByUsername(key),
      async (user: User, currentItem: string) =>
        await this._userDao.updateUsername(user, currentItem),
    );
  }

  public async updateEmail(
    shortTermAuthToken: string,
    updateRequest: UpdateEmailRequest,
  ): Promise<UserDto> {
    return await this.updateUserItem(
      shortTermAuthToken,
      { password: updateRequest.password, newField: updateRequest.newEmail },
      "email",
      async (key: string) => await this._userDao.getUserByEmail(key),
      async (user: User, currentItem: string) => await this._userDao.updateEmail(user, currentItem),
    );
  }

  private async updateUserItem(
    shortTermAuthToken: string,
    request: { password: string; newField: string },
    field: string,
    getOperation: (key: string) => Promise<User | null>,
    updateOperation: (user: User, currentItem: string) => Promise<void>,
  ): Promise<UserDto> {
    const user: User = await this.validateAuthAndReturnUser(shortTermAuthToken, "short");

    await this.comparePasswords(request.password, user.hashedPassword);

    const exists: User | null = await getOperation(request.newField);
    if (exists && exists[field as "email" | "username"] === request.newField) {
      throw new UserServiceError(
        `${request.newField} is already your current ${field}`,
        HTTP_CODES.get("bad-request"),
      );
    }
    if (exists) {
      throw new UserServiceError(`That ${field} is already in use`, HTTP_CODES.get("conflict"));
    }

    const currentItem: string = user[field as "email" | "username"];
    const now = new Date(Date.now());
    user[field as "email" | "username"] = request.newField;
    user.updatedAt = now;

    await updateOperation(user, currentItem);

    return user.toUserDto();
  }

  private async validateAuthAndReturnUser(token: string, tokenType: AuthTokenType): Promise<User> {
    const result: AuthValidationResult = await this._authService.isAuthTokenValid(token, tokenType);

    if (!result.valid) {
      throw new UserServiceError(`Unauthorized: ${result.reason}`, HTTP_CODES.get("unauthorized"));
    }

    const userId: string | undefined = result.userId;

    if (!userId) {
      throw new UserServiceError(
        "Internal error: No userId associated with auth token",
        HTTP_CODES.get("internal-server-error"),
      );
    }

    const user: User | null = await this._userDao.getUserById(userId);

    if (!user) {
      throw new UserServiceError(
        "Failed to find user associated with userId",
        HTTP_CODES.get("internal-server-error"),
      );
    }

    return user;
  }

  /**
   * Given a password and a hash, compares to see if they're equal. Throws if they are not
   *
   * @param password client provided password
   * @param hash stored password hash in the database
   * @returns void, throws if comparison fails
   */
  private async comparePasswords(password: string, hash: string): Promise<void> {
    const passwordsMatch: boolean = await bcrypt.compare(password, hash);

    if (!passwordsMatch) {
      throw new UserServiceError("Unauthorized: wrong password", HTTP_CODES.get("unauthorized"));
    }
  }
}
