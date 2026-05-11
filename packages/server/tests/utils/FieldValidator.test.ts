/*
Tests for the FieldValidator class
*/
import * as z from "zod";
import { FieldValidator } from "../../src/utils/FieldValidator.js";

describe("FieldValidator", () => {
  const testSchema = z.strictObject({
    username: z.string().min(3).max(32),
    password: z.string().min(8).max(32),
  });

  it("correctly validates a correct object", () => {
    const testObject: string = '{"username":"testUser", "password":"testPassword"}';
    const validator = new FieldValidator(testObject, testSchema);

    expect(validator.isValid).toBe(true);
    expect(validator.error).toBeNull();
    expect(validator.data).toStrictEqual(JSON.parse(testObject));
  });
});
