import { describe, expect, it } from "vitest";

import { HashMap } from "./HashMap.js";

describe("HashMap.empty()", () => {
  it("creates a new empty HashMap", () => {
    const map = HashMap.empty<number, string>();

    expect([...map]).toEqual([]);
  });

  it("uses the identity function as the hashing function", () => {
    const map = HashMap.empty<number, string>();

    map.set(1, "one");

    expect([...map]).toEqual([[1, "one"]]);
  });
});

describe("HashMap.emptyWithCustomHash()", () => {
  describe("using ISO string representation of Date objects as hash keys", () => {
    it("creates a new empty HashMap", () => {
      const map = HashMap.emptyWithCustomHash<Date, number, string>({
        hash(key: Date) {
          return key.toISOString();
        },
      });

      expect([...map]).toEqual([]);
    });

    it("uses the hash function to convert the keys before storing them in the map", () => {
      const map = HashMap.emptyWithCustomHash<Date, number, string>({
        hash(key: Date) {
          return key.toISOString();
        },
      });

      map.set(new Date("2020-01-01"), 1);

      expect([...map]).toEqual([["2020-01-01T00:00:00.000Z", 1]]);
    });
  });
});

describe("HashMap.fromCustomEntries()", () => {
  describe("using ISO string representation of Date objects as hash keys", () => {
    it("creates a new HashMap with the given entries", () => {
      const map = HashMap.fromCustomEntries(
        [
          [new Date("2020-01-01"), 1],
          [new Date("2020-02-01"), 2],
          [new Date("2020-03-01"), 3],
        ],
        {
          hash(key) {
            return key.toISOString();
          },
        },
      );

      expect([...map]).toEqual([
        ["2020-01-01T00:00:00.000Z", 1],
        ["2020-02-01T00:00:00.000Z", 2],
        ["2020-03-01T00:00:00.000Z", 3],
      ]);
    });

    it("uses the hash function to hash Date object keys as ISO strings", () => {
      const map = HashMap.fromCustomEntries(
        [
          [new Date("2020-01-01"), 1],
          [new Date("2020-02-01"), 2],
          [new Date("2020-03-01"), 3],
        ],
        {
          hash(key) {
            return key.toISOString();
          },
        },
      );

      map.set(new Date("2020-04-01"), 4);

      expect([...map]).toEqual([
        ["2020-01-01T00:00:00.000Z", 1],
        ["2020-02-01T00:00:00.000Z", 2],
        ["2020-03-01T00:00:00.000Z", 3],
        ["2020-04-01T00:00:00.000Z", 4],
      ]);
    });
  });
});

describe("HashMap.fromEntries()", () => {
  it("creates a new HashMap with the given entries", () => {
    const map = HashMap.fromEntries<number, string>([
      [1, "one"],
      [2, "two"],
      [3, "three"],
    ]);

    expect([...map]).toEqual([
      [1, "one"],
      [2, "two"],
      [3, "three"],
    ]);
  });

  it("uses the identity function as the hashing function", () => {
    const map = HashMap.fromEntries<number, string>([
      [1, "one"],
      [2, "two"],
      [3, "three"],
    ]);

    map.set(4, "four");

    expect([...map]).toEqual([
      [1, "one"],
      [2, "two"],
      [3, "three"],
      [4, "four"],
    ]);
  });
});

describe("HashMap#clear()", () => {
  it("clears a map with entries", () => {
    const map = HashMap.fromEntries<number, string>([
      [1, "one"],
      [2, "two"],
      [3, "three"],
    ]);

    map.clear();

    expect([...map]).toEqual([]);
  });
});

describe("HashMap#delete()", () => {
  it("deletes the entry with the given key if it exists", () => {
    const map = HashMap.fromEntries<number, string>([
      [1, "one"],
      [2, "two"],
      [3, "three"],
    ]);

    map.delete(2);

    expect([...map]).toEqual([
      [1, "one"],
      [3, "three"],
    ]);
  });

  it("throws a HashMap.MissingKeyError if the key does not exist", () => {
    const map = HashMap.fromEntries<number, string>([
      [1, "one"],
      [2, "two"],
      [3, "three"],
    ]);

    expect(() => {
      map.delete(4);
    }).toThrowError(HashMap.MissingKeyError);
  });
});

describe("HashMap#deleteIfExists()", () => {
  it("deletes the entry with the given key if it exists and returns true", () => {
    const map = HashMap.fromEntries<number, string>([
      [1, "one"],
      [2, "two"],
      [3, "three"],
    ]);

    const result = map.deleteIfExists(2);

    expect(result).toBe(true);

    expect([...map]).toEqual([
      [1, "one"],
      [3, "three"],
    ]);
  });

  it("returns false if the key does not exist", () => {
    const map = HashMap.fromEntries<number, string>([
      [1, "one"],
      [2, "two"],
      [3, "three"],
    ]);

    const result = map.deleteIfExists(4);

    expect(result).toBe(false);

    expect([...map]).toEqual([
      [1, "one"],
      [2, "two"],
      [3, "three"],
    ]);
  });
});

describe("HashMap#entries()", () => {
  it("returns the entries of the map as key-value array of `[key, value]`", () => {
    const map = HashMap.fromEntries<number, string>([
      [1, "one"],
      [2, "two"],
      [3, "three"],
    ]);

    const entries = map.entries();

    expect([...entries]).toEqual([
      [1, "one"],
      [2, "two"],
      [3, "three"],
    ]);
  });
});

describe("HashMap#filter()", () => {
  it("returns a new map with entries where the value has a length greater than 3", () => {
    const map = HashMap.fromEntries<number, string>([
      [1, "one"],
      [2, "two"],
      [3, "three"],
      [4, "four"],
    ]);

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
    const map = HashMap.fromEntries<number, string>([
      [1, "one"],
      [2, "two"],
      [3, "three"],
      [4, "four"],
    ]);

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
    const map = HashMap.fromEntries<number, string>([
      [1, "one"],
      [2, "two"],
      [3, "three"],
      [4, "four"],
    ]);

    let counter = 0;

    map.filter((_, __, index) => {
      expect(counter).toEqual(index);

      counter++;

      return true;
    });
  });

  it("passes the map being filtered as the fourth argument of the filter predicate", () => {
    const map = HashMap.fromEntries<number, string>([[1, "one"]]);

    map.filter((_, __, ___, original) => {
      expect(original).toBe(map);

      return true;
    });
  });
});

describe("HashMap#get()", () => {
  it("returns the value with the given key in the map when it exists", () => {
    const map = HashMap.fromEntries([
      [1, "one"],
      [2, "two"],
      [3, "three"],
    ]);

    expect(map.get(1)).toBe("one");
    expect(map.get(2)).toBe("two");
    expect(map.get(3)).toBe("three");
  });

  it("throws a HashMap.MissingKeyError if the key does not exist", () => {
    const map = HashMap.fromEntries([
      [1, "one"],
      [2, "two"],
      [3, "three"],
    ]);

    expect(() => {
      map.get(4);
    }).toThrowError(HashMap.MissingKeyError);
  });
});

describe("HashMap#getOr()", () => {
  it("returns the value with the given key in the map when it exists", () => {
    const map = HashMap.fromEntries([
      [1, "one"],
      [2, "two"],
      [3, "three"],
    ]);

    expect(map.getOr(2, "default")).toBe("two");
  });

  it("returns the default value if the key does not exist", () => {
    const map = HashMap.fromEntries([
      [1, "one"],
      [2, "two"],
      [3, "three"],
    ]);

    expect(map.getOr(4, "default")).toBe("default");
  });

  it("returns the default value if the map is empty", () => {
    const map = HashMap.empty<number, string>();

    expect(map.getOr(1, "default")).toBe("default");
  });
});

describe("HashMap#has()", () => {
  it("returns true if the map contains the given key", () => {
    const map = HashMap.fromEntries<number, string>([
      [1, "one"],
      [2, "two"],
      [3, "three"],
    ]);

    expect(map.has(2)).toBe(true);
  });

  it("returns false if the map does not contain the given key", () => {
    const map = HashMap.fromEntries<number, string>([
      [1, "one"],
      [2, "two"],
      [3, "three"],
    ]);

    expect(map.has(5)).toBe(false);
  });

  it("returns false if the map is empty", () => {
    const map = HashMap.empty<number, string>();

    expect(map.has(1)).toBe(false);
  });
});

describe("HashMap#keys()", () => {
  it("returns an iterator of the keys in the map", () => {
    const map = HashMap.fromEntries<number, string>([
      [1, "one"],
      [2, "two"],
      [3, "three"],
    ]);

    const keys = map.keys();

    expect([...keys]).toEqual([1, 2, 3]);
  });

  it("returns an empty iterator if the map is empty", () => {
    const map = HashMap.empty<number, string>();

    const keys = map.keys();

    expect([...keys]).toEqual([]);
  });

  it("returns the keys in the order they were inserted", () => {
    const map = HashMap.fromEntries<number, string>([
      [3, "three"],
      [1, "one"],
      [2, "two"],
    ]);

    const keys = map.keys();

    expect([...keys]).toEqual([3, 1, 2]);
  });

  it("returns the keys after some entries have been deleted", () => {
    const map = HashMap.fromEntries<number, string>([
      [1, "one"],
      [2, "two"],
      [3, "three"],
    ]);

    map.delete(2);

    const keys = map.keys();

    expect([...keys]).toEqual([1, 3]);
  });

  it("returns the keys after new entries have been added", () => {
    const map = HashMap.fromEntries<number, string>([
      [1, "one"],
      [2, "two"],
    ]);

    map.set(3, "three");

    const keys = map.keys();

    expect([...keys]).toEqual([1, 2, 3]);
  });
});

describe("HashMap#map()", () => {
  it("creates a new map with entries transformed by the given callback function", () => {
    const map0 = HashMap.fromEntries<number, string>([
      [1, "one"],
      [2, "two"],
      [3, "three"],
    ]);

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
    const map0 = HashMap.fromEntries<number, string>([
      [1, "one"],
      [2, "two"],
      [3, "three"],
    ]);

    map0.map((value, key) => [key * 2, value.toUpperCase()]);

    expect([...map0]).toEqual([
      [1, "one"],
      [2, "two"],
      [3, "three"],
    ]);
  });

  it("provides the original map as the 4th argument of the given callback function", () => {
    const map0 = HashMap.fromEntries<number, string>([
      [1, "one"],
      [2, "two"],
      [3, "three"],
    ]);

    map0.map((value, key, index, map) => {
      expect(map).toBe(map0);

      return [key, value];
    });
  });
});

describe("HashMap#mapKeys()", () => {
  it("creates a new map with keys transformed by the given callback function", () => {
    const map0 = HashMap.fromEntries<number, string>([
      [1, "one"],
      [2, "two"],
      [3, "three"],
    ]);

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
    const map0 = HashMap.fromEntries<number, string>([
      [1, "one"],
      [2, "two"],
      [3, "three"],
    ]);

    map0.mapKeys((key) => key * 2);

    expect([...map0]).toEqual([
      [1, "one"],
      [2, "two"],
      [3, "three"],
    ]);
  });

  it("provides the original map as the 4th argument of the given callback function", () => {
    const map0 = HashMap.fromEntries<number, string>([
      [1, "one"],
      [2, "two"],
      [3, "three"],
    ]);

    map0.mapKeys((key, value, index, map) => {
      expect(map).toBe(map0);

      return key;
    });
  });
});

describe("HashMap#mapValues()", () => {
  it("creates a new map with values transformed by the given callback function", () => {
    const map0 = HashMap.fromEntries<number, string>([
      [1, "one"],
      [2, "two"],
      [3, "three"],
    ]);

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
    const map0 = HashMap.fromEntries<number, string>([
      [1, "one"],
      [2, "two"],
      [3, "three"],
    ]);

    map0.mapValues((value) => value.toUpperCase());

    expect([...map0]).toEqual([
      [1, "one"],
      [2, "two"],
      [3, "three"],
    ]);
  });

  it("provides the original map as the 4th argument of the given callback function", () => {
    const map0 = HashMap.fromEntries<number, string>([
      [1, "one"],
      [2, "two"],
      [3, "three"],
    ]);

    map0.mapValues((value, key, index, map) => {
      expect(map).toBe(map0);

      return value;
    });
  });
});

describe("HashMap#values()", () => {
  it("returns an iterator of the values in the map", () => {
    const map = HashMap.fromEntries<number, string>([
      [1, "one"],
      [2, "two"],
      [3, "three"],
    ]);

    const values = map.values();

    expect([...values]).toEqual(["one", "two", "three"]);
  });

  it("returns an empty iterator if the map is empty", () => {
    const map = HashMap.empty<number, string>();

    const values = map.values();

    expect([...values]).toEqual([]);
  });

  it("returns the values in the order they were inserted", () => {
    const map = HashMap.fromEntries<number, string>([
      [3, "three"],
      [1, "one"],
      [2, "two"],
    ]);

    const values = map.values();

    expect([...values]).toEqual(["three", "one", "two"]);
  });

  it("returns the values after some entries have been deleted", () => {
    const map = HashMap.fromEntries<number, string>([
      [1, "one"],
      [2, "two"],
      [3, "three"],
    ]);

    map.delete(2);

    const values = map.values();

    expect([...values]).toEqual(["one", "three"]);
  });

  it("returns the values after new entries have been added", () => {
    const map = HashMap.fromEntries<number, string>([
      [1, "one"],
      [2, "two"],
    ]);

    map.set(3, "three");

    const values = map.values();

    expect([...values]).toEqual(["one", "two", "three"]);
  });
});
