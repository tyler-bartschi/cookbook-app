/*
Tests for the FieldValidator class
*/
import * as z from "zod";
import { FieldValidator } from "../../src/utils/FieldValidator.js";
import { DEFAULT_CORS_HEADERS } from "../../src/utils/DefaultCorsHeaders.js";

describe("FieldValidator", () => {
  const baseTestShape = {
    username: z.string().min(3).max(32),
    password: z.string().min(8).max(32),
  };

  const baseTestSchema = z.strictObject({
    ...baseTestShape,
  });

  const baseTestObject = {
    username: "testUsername",
    password: "testPassword",
  };

  const jsonErrorMessage: string = "Invalid JSON request body";
  const validateErrorMessage: string = "Invalid request body";

  it("correctly validates a correct object", () => {
    const validator = new FieldValidator(JSON.stringify(baseTestObject), baseTestSchema);

    assertObjectEqualsData(validator, baseTestObject);
  });

  it("correctly validates an object with additional fields provided as a parameter", () => {
    const testSchemaWithAdditions = z.strictObject({
      ...baseTestShape,
      authToken: z.string(),
    });

    const validator = new FieldValidator(JSON.stringify(baseTestObject), testSchemaWithAdditions, {
      authToken: "testAuthToken",
    });

    assertObjectEqualsData(validator, { ...baseTestObject, authToken: "testAuthToken" });
  });

  it("correctly validates an object with optional fields", () => {
    const testSchemaWithAdditions = z.strictObject({
      ...baseTestShape,
      authToken: z.string().optional(),
    });

    const testObjectWithField = {
      ...baseTestObject,
      authToken: "testAuthToken",
    };

    const validatorOne = new FieldValidator(
      JSON.stringify(testObjectWithField),
      testSchemaWithAdditions,
    );
    const validatorTwo = new FieldValidator(
      JSON.stringify(baseTestObject),
      testSchemaWithAdditions,
    );
    const validatorThree = new FieldValidator(
      JSON.stringify(baseTestObject),
      testSchemaWithAdditions,
      { authToken: "testAuthToken" },
    );

    assertObjectEqualsData(validatorOne, testObjectWithField);
    assertObjectEqualsData(validatorTwo, baseTestObject);
    assertObjectEqualsData(validatorThree, testObjectWithField);
  });

  it("rejects malformed JSON with proper error message", () => {
    let testObjectIncorrect = JSON.stringify(baseTestObject);
    testObjectIncorrect = testObjectIncorrect.slice(0, testObjectIncorrect.length - 1);

    const validator = new FieldValidator(testObjectIncorrect, baseTestSchema);

    assertErrorHasMessageAndCode(validator, 400, jsonErrorMessage);
  });

  it("rejects an object with too many properties", () => {
    const testObjectIncorrect = {
      ...baseTestObject,
      extra: "extra",
    };

    const validatorOne = new FieldValidator(JSON.stringify(testObjectIncorrect), baseTestSchema);
    const validatorTwo = new FieldValidator(JSON.stringify(baseTestObject), baseTestSchema, {
      extra: "extra",
    });

    assertErrorHasMessageAndCode(validatorOne, 400, validateErrorMessage);
    assertErrorHasMessageAndCode(validatorTwo, 400, validateErrorMessage);
  });

  it("rejects an object with too few properties", () => {
    const testSchemaWithAdditions = z.strictObject({
      ...baseTestShape,
      authToken: z.string(),
    });

    const validator = new FieldValidator(JSON.stringify(baseTestObject), testSchemaWithAdditions);

    assertErrorHasMessageAndCode(validator, 400, validateErrorMessage);
  });
});

function assertObjectEqualsData<T extends z.ZodType>(
  validator: FieldValidator<T>,
  testObject: unknown,
) {
  expect(validator.isValid).toBe(true);
  expect(validator.error).toBeNull();
  expect(validator.data).toStrictEqual(testObject);
}

function assertErrorHasMessageAndCode<T extends z.ZodType>(
  validator: FieldValidator<T>,
  expectedCode: number,
  expectedMessage: string,
) {
  expect(validator.isValid).toBe(false);
  expect(validator.data).toBeNull();
  expect(validator.error?.headers).toBe(JSON.stringify(DEFAULT_CORS_HEADERS));
  expect(validator.error?.statusCode).toBe(expectedCode);
  expect(JSON.parse(validator.error?.body ?? "")?.message).toBe(expectedMessage);
}
