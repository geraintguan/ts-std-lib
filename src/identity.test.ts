import { describe, it, expect } from "vitest";
import { identity } from "./identity.js";

describe("identity", () => {
  it("should return a function that always returns the given value", () => {
    const value = 42;
    const id = identity(value);
    expect(id()).toBe(value);
  });

  it("should return a function that always returns the given object", () => {
    const obj = { name: "John", age: 30 };
    const id = identity(obj);
    expect(id()).toBe(obj);
  });

  it("should return a function that always returns the given array", () => {
    const arr = [1, 2, 3];
    const id = identity(arr);
    expect(id()).toBe(arr);
  });

  it("should return a function that always returns the given string", () => {
    const str = "Hello, world!";
    const id = identity(str);
    expect(id()).toBe(str);
  });

  it("should return a function that always returns the given boolean", () => {
    const bool = true;
    const id = identity(bool);
    expect(id()).toBe(bool);
  });
});
