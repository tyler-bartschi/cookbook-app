import { BaseError } from "../BaseError.js";
import { ErrorCode } from "../ErrorCode.js";

export class UserParseError extends BaseError {
  public constructor(message: string) {
    super(message, ErrorCode.UserParse);
  }
}
