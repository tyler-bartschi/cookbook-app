import { ErrorCode, InformativeErrorCode } from "./ErrorCode.js";

export class BaseError extends Error {
  private _code: ErrorCode | InformativeErrorCode;

  public constructor(message: string, code: ErrorCode | InformativeErrorCode) {
    super(message);
    this._code = code;
  }

  public get code(): ErrorCode | InformativeErrorCode {
    return this._code;
  }
}
