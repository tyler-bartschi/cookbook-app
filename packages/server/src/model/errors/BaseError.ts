import { ErrorCode } from "./ErrorCode.js";

export class BaseError extends Error {
  private _code: ErrorCode;

  public constructor(message: string, code: ErrorCode) {
    super(message);
    this._code = code;
  }

  public get code(): ErrorCode {
    return this._code;
  }
}
