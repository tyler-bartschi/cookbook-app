import { DynamoDaoFactory } from "../dao/dynamo/factory/DynamoDaoFactory.js";
import { AuthService } from "../service/AuthService.js";
import { UserService } from "../service/UserService.js";
import { S3StorageFactory } from "../storage/s3/factory/S3StorageFactory.js";

export interface AvailableServices {
  userService: UserService;
  authService: AuthService;
}

export const initServices = (): AvailableServices => {
  const daoFactory = new DynamoDaoFactory();
  const storageFactory = new S3StorageFactory();

  const userService = new UserService(daoFactory, storageFactory);
  const authService = new AuthService(daoFactory);

  return {
    userService,
    authService,
  };
};
