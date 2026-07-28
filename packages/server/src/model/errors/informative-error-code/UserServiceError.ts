import { BaseError } from "../BaseError.js";
import { InformativeErrorCode } from "../ErrorCode.js";

export class UserServiceError extends BaseError {
  private readonly _httpCode: number;

  public constructor(message: string, httpCode: number = 500) {
    super(message, InformativeErrorCode.UserService);
    this._httpCode = httpCode;
  }

  public get httpCode(): number {
    return this._httpCode;
  }
}
