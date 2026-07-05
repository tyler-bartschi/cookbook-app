import { BaseError } from "./BaseError.js";
import { ErrorCode } from "./ErrorCode.js";

export class AuthParseError extends BaseError {
  constructor(message: string) {
    super(message, ErrorCode.AuthParse);
  }
}
