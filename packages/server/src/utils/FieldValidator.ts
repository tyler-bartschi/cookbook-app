import * as z from "zod";
import { HttpResponse } from "../types/HttpResponse.js";
import { DEFAULT_CORS_HEADERS } from "./DefaultCorsHeaders.js";

export class FieldValidator<T extends z.ZodType> {
  private _isValid: boolean;
  private _data: z.infer<T> | null;
  private _error: HttpResponse | null;

  /**
   * Validates given data and stores the results of the validation
   *
   * @param objectToValidate string body to attempt to validate
   * @param validationSchema schema to use in validation (zod)
   * @param additionalFields any additional fields that should be included in the validation (like headers)
   * @returns Nothing, stores results in instance variables
   */
  constructor(
    objectToValidate: string,
    validationSchema: T,
    additionalFields?: Record<string, unknown>,
  ) {
    this._isValid = false;
    this._data = null;
    this._error = null;

    const [cont, rawData]: [boolean, Partial<z.infer<T>>] = this.tryParse(objectToValidate);

    if (!cont) {
      return;
    }

    const fullRawData = {
      ...rawData,
      ...additionalFields,
    };

    this.validate(fullRawData, validationSchema);
  }

  /**
   * Returns true if validation was successful, false otherwise
   */
  public get isValid(): boolean {
    return this._isValid;
  }

  /**
   * Returns data if validation was successful, null otherwise
   */
  public get data(): z.infer<T> | null {
    return this._data;
  }

  /**
   * Returns the error if validation was unsuccessful, null otherwise
   */
  public get error(): HttpResponse | null {
    return this._error;
  }

  /**
   * Attempts to parse an object, returns true and the parsed object if successful, false and an empty object if not
   * @param object string to attempt to parse
   * @returns [successful: boolean, parsedObject: Partial<z.infer<T>>]
   */
  private tryParse(object: string): [boolean, Partial<z.infer<T>>] {
    try {
      const data = JSON.parse(object);
      return [true, data];
    } catch (error: unknown) {
      const msg: string = error instanceof Error ? error.message : String(error);
      console.error("An error occured:", msg);
      this._error = {
        statusCode: 400,
        headers: JSON.stringify(DEFAULT_CORS_HEADERS),
        body: JSON.stringify({
          error: error,
          message: "Invalid JSON request body",
        }),
      };
      return [false, {}];
    }
  }

  /**
   * Validates the request according to the validation schema given
   *
   * @param fullRawData JSON parsed data, including any headers or additional fields provided
   * @param validationSchema zod schema to validate against
   * @returns void
   */
  private validate(fullRawData: unknown, validationSchema: T): void {
    const result = validationSchema.safeParse(fullRawData);

    this._isValid = result.success;

    if (!result.success) {
      const validationErrors = result.error.issues.map((issue) => {
        return {
          path: issue.path.join("."),
          code: issue.code,
          message: issue.message,
        };
      });

      this._error = {
        statusCode: 400,
        headers: JSON.stringify(DEFAULT_CORS_HEADERS),
        body: JSON.stringify({
          error: JSON.stringify(validationErrors),
          message: "Invalid request body",
        }),
      };
      return;
    }

    this._data = result.data;
  }
}
