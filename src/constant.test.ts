import { describe, expect, it } from "vitest";

import { constant } from "./constant.js";

describe("constant", () => {
  it("should return a function", () => {
    const result = constant(5);
    expect(typeof result).toBe("function");
  });

  it("should always return the same value when called multiple times", () => {
    const value = 42;
    const getValue = constant(value);
    expect(getValue()).toBe(value);
    expect(getValue()).toBe(value);
    expect(getValue()).toBe(value);
  });

  it("should work with different types", () => {
    const getString = constant("hello");
    expect(getString()).toBe("hello");

    const getObject = constant({ a: 1 });
    expect(getObject()).toEqual({ a: 1 });

    const getArray = constant([1, 2, 3]);
    expect(getArray()).toEqual([1, 2, 3]);

    const getBoolean = constant(true);
    expect(getBoolean()).toBe(true);
  });
});
