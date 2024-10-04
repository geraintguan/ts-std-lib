import { describe, expect, it } from "vitest";

import { DefaultMap } from "./DefaultMap.js";

describe("DefaultMap.empty()", () => {
  it("should create an empty DefaultMap with a static default value", () => {
    const map = DefaultMap.empty<string, number>({
      defaultValue: { type: "value", value: 1 },
    });

    expect(map.get("a")).toBe(1);

    expect([...map.keys()]).toEqual(["a"]);
  });

  it("should create an empty DefaultMap with a function default value", () => {
    const map = DefaultMap.empty<string, number>({
      defaultValue: { type: "function", value: (key) => key.length },
    });

    expect(map.get("cat")).toBe(3);
    expect(map.get("cat-dog")).toBe(7);

    expect([...map.keys()]).toEqual(["cat", "cat-dog"]);
  });

  it("should create an empty DefaultMap with a custom name", () => {
    const map = DefaultMap.empty<string, number>({
      defaultValue: { type: "value", value: 1 },
      name: "customMap",
    });

    expect(map.get("a")).toBe(1);

    expect(map.name).toBe("customMap");
  });
});

describe("DefaultMap.fromCustomEntries()", () => {
  it("should create a DefaultMap from custom entries with a static default value", () => {
    const entries: [string, number][] = [
      ["a", 1],
      ["b", 2],
    ];
    const map = DefaultMap.fromCustomEntries(entries, {
      defaultValue: { type: "value", value: 0 },
      hash: (key) => key,
    });

    expect(map.get("a")).toBe(1);
    expect(map.get("b")).toBe(2);
    expect(map.get("c")).toBe(0); // default value
    expect([...map.keys()]).toEqual(["a", "b", "c"]);
  });

  it("should create a DefaultMap from custom entries with a function default value", () => {
    const entries: [string, number][] = [
      ["cat", 3],
      ["dog", 4],
    ];
    const map = DefaultMap.fromCustomEntries(entries, {
      defaultValue: { type: "function", value: (key) => key.length },
      hash: (key) => key,
    });

    expect(map.get("cat")).toBe(3);
    expect(map.get("dog")).toBe(4);
    expect(map.get("elephant")).toBe(8); // default value based on key length
    expect([...map.keys()]).toEqual(["cat", "dog", "elephant"]);
  });

  it("should create a DefaultMap from custom entries with a custom name", () => {
    const entries: [string, number][] = [
      ["a", 1],
      ["b", 2],
    ];
    const map = DefaultMap.fromCustomEntries(entries, {
      defaultValue: { type: "value", value: 0 },
      hash: (key) => key,
      name: "customMap",
    });

    expect(map.name).toBe("customMap");

    expect([...map.keys()]).toEqual(["a", "b"]);
  });
});

describe("DefaultMap#get()", () => {
  it("should return the default value for a non-existent key (static value)", () => {
    const map = DefaultMap.empty<string, number>({
      defaultValue: { type: "value", value: 1 },
    });

    expect(map.get("a")).toBe(1);
    expect([...map.keys()]).toEqual(["a"]);
  });

  it("should return the default value for a non-existent key (function value)", () => {
    const map = DefaultMap.empty<string, number>({
      defaultValue: { type: "function", value: (key) => key.length },
    });

    expect(map.get("cat")).toBe(3);
    expect(map.get("cat-dog")).toBe(7);
    expect([...map.keys()]).toEqual(["cat", "cat-dog"]);
  });

  it("should return the existing value for an existing key", () => {
    const map = DefaultMap.empty<string, number>({
      defaultValue: { type: "value", value: 1 },
    });

    map.set("b", 2);
    expect(map.get("b")).toBe(2);
    expect([...map.keys()]).toEqual(["b"]);
  });

  it("should set the default value for a non-existent key and then return it", () => {
    const map = DefaultMap.empty<string, number>({
      defaultValue: { type: "value", value: 1 },
    });

    expect(map.get("a")).toBe(1);
    expect(map.get("a")).toBe(1);
    expect([...map.keys()]).toEqual(["a"]);
  });

  it("should set the default value using a function for a non-existent key and then return it", () => {
    const map = DefaultMap.empty<string, number>({
      defaultValue: { type: "function", value: (key) => key.length },
    });

    expect(map.get("cat")).toBe(3);
    expect(map.get("cat")).toBe(3);
    expect([...map.keys()]).toEqual(["cat"]);
  });
});
