// user service needs to check if username or email exist before attempting to create a new user
// dynamo db will not allow (bc of condition expressions) a user to be created with an already existing email or username,
// but won't give details about why it failed. so make sure to check before!

import {
  AuthDto,
  EmailLoginRequest,
  LoginRequest,
  LoginResponse,
  LogoutRequest,
  RegisterRequest,
  RegisterRequestWithImage,
  RegisterResponse,
  UpdatePasswordRequest,
  UserDto,
  UsernameLoginRequest,
} from "@cookbook/shared";
import { DaoFactory } from "../dao/interfaces/factory/DaoFactory.js";
import { UserDao } from "../dao/interfaces/UserDao.js";
import { StorageFactory } from "../storage/interfaces/factory/StorageFactory.js";
import { ImageStorage } from "../storage/interfaces/ImageStorage.js";
import { AuthService, AuthValidationResult } from "./AuthService.js";
import { UserServiceError } from "../model/errors/informative-error-code/UserServiceError.js";
import { HTTP_CODES } from "../types/HttpCodes.js";
import { User } from "../model/entity/User.js";
import { createHash } from "node:crypto";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { UpdatePasswordResponse } from "../../../shared/dist/models/network/responses/auth/UpdatePasswordResponse.js";

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

    let profilePictureUrl: string = "";
    if ((request as RegisterRequestWithImage).imageBytesAsBase64String) {
      const imageBytes: string = (request as RegisterRequestWithImage).imageBytesAsBase64String;
      const filename: string = createHash("sha256").update(imageBytes).digest("hex");

      profilePictureUrl = await this._imageStorage.uploadProfilePicture(
        filename,
        imageBytes,
        (request as RegisterRequestWithImage).imageFileExtension,
      );
    }

    const userId: string = uuidv4();
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

    const passwordsMatch: boolean = await bcrypt.compare(request.password, user.hashedPassword);

    if (!passwordsMatch) {
      throw new UserServiceError("Unauthorized: wrong password", HTTP_CODES.get("unauthorized"));
    }

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

    const userId: string | undefined = result.userId;

    if (!userId) {
      throw new UserServiceError(
        "No userId associated with given auth token",
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

    const passwordsMatch: boolean = await bcrypt.compare(
      updatePasswordRequest.password,
      user.hashedPassword,
    );

    if (!passwordsMatch) {
      throw new UserServiceError("Unauthorized: wrong password", HTTP_CODES.get("unauthorized"));
    }

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
}
