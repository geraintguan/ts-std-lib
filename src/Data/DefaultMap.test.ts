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

describe("DefaultMap#filter()", () => {
  it("returns a new map with entries where the value has a length greater than 3", () => {
    const map = DefaultMap.fromEntries<number, string>(
      [
        [1, "one"],
        [2, "two"],
        [3, "three"],
        [4, "four"],
      ],
      {
        defaultValue: { type: "value", value: "NaN" },
      },
    );

    const filtered = map.filter((value) => value.length > 3);

    expect([...filtered]).toEqual([
      [3, "three"],
      [4, "four"],
    ]);

    expect([...map]).toEqual([
      [1, "one"],
      [2, "two"],
      [3, "three"],
      [4, "four"],
    ]);
  });

  it("returns a new map with entries where the key is greater than 2", () => {
    const map = DefaultMap.fromEntries<number, string>(
      [
        [1, "one"],
        [2, "two"],
        [3, "three"],
        [4, "four"],
      ],
      {
        defaultValue: { type: "value", value: "NaN" },
      },
    );

    const filtered = map.filter((_, key) => key > 2);

    expect([...filtered]).toEqual([
      [3, "three"],
      [4, "four"],
    ]);

    expect([...map]).toEqual([
      [1, "one"],
      [2, "two"],
      [3, "three"],
      [4, "four"],
    ]);
  });

  it("passes the index of the entry being filtered as the third argument of the filter predicate", () => {
    const map = DefaultMap.fromEntries<number, string>(
      [
        [1, "one"],
        [2, "two"],
        [3, "three"],
        [4, "four"],
      ],
      {
        defaultValue: { type: "value", value: "NaN" },
      },
    );

    let counter = 0;

    map.filter((_, __, index) => {
      expect(counter).toEqual(index);

      counter++;

      return true;
    });
  });

  it("passes the map being filtered as the fourth argument of the filter predicate", () => {
    const map = DefaultMap.fromEntries<number, string>([[1, "one"]], {
      defaultValue: { type: "value", value: "NaN" },
    });

    map.filter((_, __, ___, original) => {
      expect(original).toBe(map);

      return true;
    });
  });

  it("returns a new map with the same default value as the original map", () => {
    const map = DefaultMap.fromEntries<number, string>(
      [
        [1, "one"],
        [2, "two"],
        [3, "three"],
        [4, "four"],
      ],
      {
        defaultValue: { type: "value", value: "NaN" },
      },
    );

    const filtered = map.filter((value) => value.length > 3);

    expect(map.defaultValue.value).toBe(filtered.defaultValue.value);
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

describe("DefaultMap#map()", () => {
  it("creates a new map with entries transformed by the given callback function", () => {
    const map0 = DefaultMap.fromEntries<number, string>(
      [
        [1, "one"],
        [2, "two"],
        [3, "three"],
      ],
      {
        defaultValue: {
          type: "value",
          value: "NaN",
        },
      },
    );

    const map1 = map0.map((value, key) => [key * 2, value.toUpperCase()]);

    expect([...map0]).toEqual([
      [1, "one"],
      [2, "two"],
      [3, "three"],
    ]);

    expect([...map1]).toEqual([
      [2, "ONE"],
      [4, "TWO"],
      [6, "THREE"],
    ]);
  });

  it("does not modify the original map", () => {
    const map0 = DefaultMap.fromEntries<number, string>(
      [
        [1, "one"],
        [2, "two"],
        [3, "three"],
      ],
      {
        defaultValue: {
          type: "value",
          value: "NaN",
        },
      },
    );

    map0.map((value, key) => [key * 2, value.toUpperCase()]);

    expect([...map0]).toEqual([
      [1, "one"],
      [2, "two"],
      [3, "three"],
    ]);
  });

  it("provides the original map as the 4th argument of the given callback function", () => {
    const map0 = DefaultMap.fromEntries<number, string>(
      [
        [1, "one"],
        [2, "two"],
        [3, "three"],
      ],
      {
        defaultValue: {
          type: "value",
          value: "NaN",
        },
      },
    );

    map0.map((value, key, index, map) => {
      expect(map).toBe(map0);

      return [key, value];
    });
  });

  it("returns a new map with the same default value as the original map", () => {
    const map0 = DefaultMap.fromEntries<number, string>(
      [
        [1, "one"],
        [2, "two"],
        [3, "three"],
      ],
      {
        defaultValue: {
          type: "value",
          value: "NaN",
        },
      },
    );

    const map1 = map0.map((value, key) => [key * 2, value.toUpperCase()]);

    expect(map0.defaultValue.value).toBe(map1.defaultValue.value);
  });
});

describe("DefaultMap#mapKeys()", () => {
  it("creates a new map with keys transformed by the given callback function", () => {
    const map0 = DefaultMap.fromEntries<number, string>(
      [
        [1, "one"],
        [2, "two"],
        [3, "three"],
      ],
      {
        defaultValue: {
          type: "value",
          value: "NaN",
        },
      },
    );

    const map1 = map0.mapKeys((key) => key * 2);

    expect([...map0]).toEqual([
      [1, "one"],
      [2, "two"],
      [3, "three"],
    ]);

    expect([...map1]).toEqual([
      [2, "one"],
      [4, "two"],
      [6, "three"],
    ]);
  });

  it("does not modify the original map", () => {
    const map0 = DefaultMap.fromEntries<number, string>(
      [
        [1, "one"],
        [2, "two"],
        [3, "three"],
      ],
      {
        defaultValue: {
          type: "value",
          value: "NaN",
        },
      },
    );

    map0.mapKeys((key) => key * 2);

    expect([...map0]).toEqual([
      [1, "one"],
      [2, "two"],
      [3, "three"],
    ]);
  });

  it("provides the original map as the 4th argument of the given callback function", () => {
    const map0 = DefaultMap.fromEntries<number, string>(
      [
        [1, "one"],
        [2, "two"],
        [3, "three"],
      ],
      {
        defaultValue: {
          type: "value",
          value: "NaN",
        },
      },
    );

    map0.mapKeys((key, value, index, map) => {
      expect(map).toBe(map0);

      return key;
    });
  });

  it("returns a new map with the same default value as the original map", () => {
    const map0 = DefaultMap.fromEntries<number, string>(
      [
        [1, "one"],
        [2, "two"],
        [3, "three"],
      ],
      {
        defaultValue: {
          type: "value",
          value: "NaN",
        },
      },
    );

    const map1 = map0.mapKeys((key) => key * 2);

    expect(map0.defaultValue.value).toBe(map1.defaultValue.value);
  });
});

describe("DefaultMap#mapValues()", () => {
  it("creates a new map with values transformed by the given callback function", () => {
    const map0 = DefaultMap.fromEntries<number, string>(
      [
        [1, "one"],
        [2, "two"],
        [3, "three"],
      ],
      {
        defaultValue: {
          type: "value",
          value: "NaN",
        },
      },
    );

    const map1 = map0.mapValues((value) => value.toUpperCase());

    expect([...map0]).toEqual([
      [1, "one"],
      [2, "two"],
      [3, "three"],
    ]);

    expect([...map1]).toEqual([
      [1, "ONE"],
      [2, "TWO"],
      [3, "THREE"],
    ]);
  });

  it("does not modify the original map", () => {
    const map0 = DefaultMap.fromEntries<number, string>(
      [
        [1, "one"],
        [2, "two"],
        [3, "three"],
      ],
      {
        defaultValue: {
          type: "value",
          value: "NaN",
        },
      },
    );

    map0.mapValues((value) => value.toUpperCase());

    expect([...map0]).toEqual([
      [1, "one"],
      [2, "two"],
      [3, "three"],
    ]);
  });

  it("provides the original map as the 4th argument of the given callback function", () => {
    const map0 = DefaultMap.fromEntries<number, string>(
      [
        [1, "one"],
        [2, "two"],
        [3, "three"],
      ],
      {
        defaultValue: {
          type: "value",
          value: "NaN",
        },
      },
    );

    map0.mapValues((value, key, index, map) => {
      expect(map).toBe(map0);

      return value;
    });
  });

  it("returns a new map with the same default value as the original map", () => {
    const map0 = DefaultMap.fromEntries<number, string>(
      [
        [1, "one"],
        [2, "two"],
        [3, "three"],
      ],
      {
        defaultValue: {
          type: "value",
          value: "NaN",
        },
      },
    );

    const map1 = map0.mapValues((value) => value.toUpperCase());

    expect(map0.defaultValue.value).toBe(map1.defaultValue.value);
  });
});
