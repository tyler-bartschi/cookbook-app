import * as z from "zod";
import { HttpResponse } from "../types/HttpResponse.js";
import { DEFAULT_CORS_HEADERS } from "./DefaultCorsHeaders.js";

export type ValidationResult<V> =
  | { isValid: true; data: V; error: null }
  | { isValid: false; data: null; error: HttpResponse };

export class FieldValidator<T extends z.ZodType> {
  private _result: ValidationResult<z.infer<T>>;

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
    this._result = {
      isValid: false,
      data: null,
      error: {
        statusCode: 400,
        headers: JSON.stringify(DEFAULT_CORS_HEADERS),
        body: JSON.stringify({
          message: "Invalid request body",
        }),
      },
    };

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
   * Returns the result object of the validation
   */  
  public get result(): ValidationResult<z.infer<T>> {
    return this._result;
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
      this._result.error = {
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

    this._result.isValid = result.success;

    if (!result.success) {
      const validationErrors = result.error.issues.map((issue) => {
        return {
          path: issue.path.join("."),
          code: issue.code,
          message: issue.message,
        };
      });

      this._result.error = {
        statusCode: 400,
        headers: JSON.stringify(DEFAULT_CORS_HEADERS),
        body: JSON.stringify({
          error: JSON.stringify(validationErrors),
          message: "Invalid request body",
        }),
      };
      return;
    }

    this._result.error = null;
    this._result.data = result.data;
  }
}
