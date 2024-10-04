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

describe("DefaultMap.emptyWithCustomHash()", () => {
  describe("using ISO string representation of Date objects as hash keys", () => {
    it("creates a new empty DefaultMap", () => {
      const map = DefaultMap.emptyWithCustomHash<Date, number, string>({
        defaultValue: { type: "value", value: 1 },
        hash(key: Date) {
          return key.toISOString();
        },
      });

      expect([...map]).toEqual([]);
    });

    it("uses the hash function to convert the keys before storing them in the map", () => {
      const map = DefaultMap.emptyWithCustomHash<Date, number, string>({
        defaultValue: { type: "value", value: 1 },
        hash(key: Date) {
          return key.toISOString();
        },
      });

      map.set(new Date("2020-01-01"), 2);

      expect([...map]).toEqual([["2020-01-01T00:00:00.000Z", 2]]);
    });
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

describe("DefaultMap.fromEntries()", () => {
  it("creates a new HashMap with the given entries", () => {
    const map = DefaultMap.fromEntries<number, string>(
      [
        [1, "one"],
        [2, "two"],
        [3, "three"],
      ],
      {
        defaultValue: { type: "value", value: "unknown" },
      },
    );

    expect([...map]).toEqual([
      [1, "one"],
      [2, "two"],
      [3, "three"],
    ]);
  });

  it("uses the identity function as the hashing function", () => {
    const map = DefaultMap.fromEntries<number, string>(
      [
        [1, "one"],
        [2, "two"],
        [3, "three"],
      ],
      {
        defaultValue: { type: "value", value: "unknown" },
      },
    );

    map.set(4, "four");

    expect([...map]).toEqual([
      [1, "one"],
      [2, "two"],
      [3, "three"],
      [4, "four"],
    ]);
  });

  it("uses the default value for non-existent keys", () => {
    const map = DefaultMap.fromEntries<number, string>(
      [
        [1, "one"],
        [2, "two"],
        [3, "three"],
      ],
      {
        defaultValue: { type: "value", value: "unknown" },
      },
    );

    expect(map.get(4)).toBe("unknown");
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
