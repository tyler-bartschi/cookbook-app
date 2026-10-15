import * as z from "zod";
import { ErrorResponseSchema } from "@cookbook/shared";
import { ClientRequestError } from "./ClientRequestError";
import { ClientResponseValidationError } from "./ClientResponseValidationError";

export class ClientCommunicator {
  private readonly SERVER_URL: string;

  public constructor(SERVER_URL: string) {
    this.SERVER_URL = SERVER_URL;
  }
  // POST, GET, PATCH

  public async makePostReq<REQ extends object, SCHEMA extends z.ZodType>(
    endpoint: string,
    req: REQ | undefined,
    responseSchema: SCHEMA,
    headers?: Headers,
  ): Promise<z.output<SCHEMA>> {
    // Server facade must provide authorization header with AuthToken when required
    const reqHeaders: Headers = new Headers(headers);

    const body: BodyInit | undefined = req === undefined ? undefined : JSON.stringify(req);

    if (body !== undefined) {
      reqHeaders.set("Content-Type", "application/json");
    }

    const url = this.getUrl(endpoint);
    const params = this.getParams("POST", reqHeaders, body);

    const response = await fetch(url, params);
    let responseBody: unknown;
    try {
      responseBody = await response.json();
    } catch (error: unknown) {
      if (error instanceof SyntaxError) {
        throw new ClientResponseValidationError(
          "Malformed JSON response from server",
          response.status,
          {
            cause: error,
          },
        );
      }

      throw error;
    }

    if (!response.ok) {
      const errorResult = ErrorResponseSchema.safeParse(responseBody);

      if (errorResult.success) {
        throw new ClientRequestError(errorResult.data.message, response.status);
      }

      throw new ClientRequestError(
        `Request failed with status ${response.status}`,
        response.status,
      );
    }

    try {
      return responseSchema.parse(responseBody);
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        throw new ClientResponseValidationError(
          "The server returned an invalid response",
          response.status,
          {
            cause: error,
          },
        );
      }

      throw error;
    }
  }

  private getUrl(endpoint: string): string {
    return this.SERVER_URL + endpoint;
  }

  private getParams(method: string, headers?: Headers, body?: BodyInit): RequestInit {
    const params: RequestInit = { method: method };

    if (headers) {
      params.headers = headers;
    }

    if (body) {
      params.body = body;
    }

    return params;
  }
}

// example error handling from ClientCommunicator with the ClientResponseValidationError
// if (error instanceof ClientRequestError) {
//   setSubmitError(error.message);
// } else if (error instanceof ClientResponseValidationError) {
//   setSubmitError("The server returned an unexpected response.");
// }
