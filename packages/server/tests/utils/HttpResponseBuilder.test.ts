/*
Tests for the HttpResponseBuilder

isObject (a dependency of HttpResponseBuilder) is trivially simple and is tested, so it is not mocked
*/

import { AuthParseError } from "../../src/model/errors/error-code/AuthParseError.js";
import { UserServiceError } from "../../src/model/errors/informative-error-code/UserServiceError.js";
import {
  APPLICATION_JSON_HEADER,
  DEFAULT_CORS_HEADERS,
} from "../../src/utils/DefaultCorsHeaders.js";
import { HttpResponseBuilder } from "../../src/utils/HttpResponseBuilder.js";

describe("HttpResponseBuilder", () => {
  describe("buildCustomResponse", () => {
    it("properly builds a custom response with a provided body and header object", () => {
      const code: number = 406;
      const body = { messsage: "hello" };
      const header = { "x-header": "header" };

      const response = HttpResponseBuilder.buildCustomResponse(code, body, header);

      expect(response).not.toBeNull();
      expect(response.statusCode).toEqual(code);
      expect(response.headers).toStrictEqual({ ...DEFAULT_CORS_HEADERS, ...header });
      expect(response.body).toEqual(JSON.stringify(body));
    });

    it("properly builds a custom response with a provided body but no header", () => {
      const code: number = 506;
      const body = { message: "goodbye" };

      const response = HttpResponseBuilder.buildCustomResponse(code, body);

      expect(response).not.toBeNull();
      expect(response.statusCode).toEqual(code);
      expect(response.headers).toStrictEqual({ ...DEFAULT_CORS_HEADERS });
      expect(response.body).toEqual(JSON.stringify(body));
    });

    it("properly builds a custom response with a provided header but no body", () => {
      const code: number = 234;
      const header = { "x-header": "random header" };

      const response = HttpResponseBuilder.buildCustomResponse(code, undefined, header);

      expect(response).not.toBeNull();
      expect(response.statusCode).toEqual(code);
      expect(response.headers).toStrictEqual({ ...DEFAULT_CORS_HEADERS, ...header });
      expect(response.body).toBeUndefined();
    });

    it("properly builds a custom response with a string body with and without headers", () => {
      const code: number = 123;
      const header = { "x-header": "random header" };
      const body: string = "hello";

      const response1 = HttpResponseBuilder.buildCustomResponse(code, body, header);
      const response2 = HttpResponseBuilder.buildCustomResponse(code, body);

      expect(response1).not.toBeNull();
      expect(response2).not.toBeNull();
      expect(response1.statusCode).toEqual(code);
      expect(response2.statusCode).toEqual(code);
      expect(response1.body).toEqual(body);
      expect(response2.body).toEqual(body);
      expect(response1.headers).toStrictEqual({ ...DEFAULT_CORS_HEADERS, ...header });
      expect(response2.headers).toStrictEqual({ ...DEFAULT_CORS_HEADERS });
    });

    it("throws when the body is invalid", () => {
      const code: number = 123;
      expect(() => HttpResponseBuilder.buildCustomResponse(code, ["hello"])).toThrow(
        "[buildCustomResponse] >> body must be an object or a string",
      );
    });
  });

  describe("successfulJsonResponse", () => {
    it("properly builds a successful JSON response", () => {
      const body = { message: "hello" };

      const response = HttpResponseBuilder.successfulJsonResponse(body);

      expect(response.statusCode).toEqual(200);
      expect(response.headers).toStrictEqual({
        ...DEFAULT_CORS_HEADERS,
        ...APPLICATION_JSON_HEADER,
      });
      expect(response.body).toEqual(JSON.stringify(body));
    });

    it("fails when body is not an object", () => {
      const body = [1, 2, 3];

      expect(() => HttpResponseBuilder.successfulJsonResponse(body)).toThrow();
    });
  });

  describe("buildErrorResponse", () => {
    it("generates a generic Error with an Error object", () => {
      const response = HttpResponseBuilder.buildErrorResponse(new Error("hello"));

      expect(response.statusCode).toEqual(500);
      expect(response.headers).toStrictEqual({
        ...DEFAULT_CORS_HEADERS,
        ...APPLICATION_JSON_HEADER,
      });
      expect(response.body).toEqual(JSON.stringify({ message: "hello" }));
    });

    it("generates a generic error with a non-Error object", () => {
      const response = HttpResponseBuilder.buildErrorResponse("hello");

      expect(response.statusCode).toEqual(500);
      expect(response.headers).toStrictEqual({
        ...DEFAULT_CORS_HEADERS,
        ...APPLICATION_JSON_HEADER,
      });
      expect(response.body).toEqual(JSON.stringify({ message: "hello" }));
    });

    it("uses 500 with a generic BaseError", () => {
      const response = HttpResponseBuilder.buildErrorResponse(new AuthParseError("hello"));

      expect(response.statusCode).toEqual(500);
      expect(response.headers).toStrictEqual({
        ...DEFAULT_CORS_HEADERS,
        ...APPLICATION_JSON_HEADER,
      });
      expect(response.body).toEqual(JSON.stringify({ message: "hello" }));
    });

    it("uses the specified code with an informative error code", () => {
      const response = HttpResponseBuilder.buildErrorResponse(new UserServiceError("hello", 300));

      expect(response.statusCode).toEqual(300);
      expect(response.headers).toStrictEqual({
        ...DEFAULT_CORS_HEADERS,
        ...APPLICATION_JSON_HEADER,
      });
      expect(response.body).toEqual(JSON.stringify({ message: "hello" }));
    });
  });
});
