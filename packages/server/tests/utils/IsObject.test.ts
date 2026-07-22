/*
Tests for the isObject utility
*/

import { isObject } from "../../src/utils/IsObject.js";

describe("isObject", () => {
  it("properly identifies an object", () => {
    const result1: boolean = isObject({ object: true });
    const result2: boolean = isObject({ userA: "tyler", userB: "sam" });

    expect(result1).toBeTruthy();
    expect(result2).toBeTruthy();
  });

  it("identifies undefined as not an object", () => {
    // okay behavior because undefined doesn't spread into other objects
    const result: boolean = isObject(undefined);

    expect(result).toBeFalsy();
  });

  it("identifies null as not an object", () => {
    const result: boolean = isObject(null);

    expect(result).toBeFalsy();
  });

  it("identifies primitives as not an object", () => {
    const result1: boolean = isObject("string");
    const result2: boolean = isObject(123);
    const result3: boolean = isObject(true);
    const result4: boolean = isObject(false);
    const result5: boolean = isObject(15.3);

    expect(result1).toBeFalsy();
    expect(result2).toBeFalsy();
    expect(result3).toBeFalsy();
    expect(result4).toBeFalsy();
    expect(result5).toBeFalsy();
  });

  it("identifies arrays as not an object", () => {
    const result1: boolean = isObject([]);
    const result2: boolean = isObject(["hello", "goodbye"]);

    expect(result1).toBeFalsy();
    expect(result2).toBeFalsy();
  });
});
