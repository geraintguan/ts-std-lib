import { identity } from "../identity.js";

/**
 * Function called to filter the entries in a map.
 *
 * @remarks
 *
 * It is possible to mutate the original map as you filter the entries in the
 * map though this is not recommended in most cases as it is easy to introduce
 * bugs in your code this way.
 *
 * @param value - The value of the entry in the map being filtered.
 * @param key - The key of the entry in the map being filtered.
 * @param index - The index of the entry in the map being filtered.
 * @param original - The original map instance being filtered.
 *
 * @returns `true` to include the entry in the new map or `false` to exclude it.
 */
export type HashMapFilterFn<TKey, TValue, THashedKey> = (
  value: TValue,
  key: THashedKey,
  index: number,
  original: HashMap<TKey, TValue, THashedKey>,
) => boolean;

/**
 * Options for creating a new map instance.
 */
export interface HashMapOptions<TKey, THashedKey = TKey> {
  /**
   * Function called to hash a key before storing or using it to access a
   * value in the map.
   */
  hash: (key: TKey) => THashedKey;

  /**
   * Optional human readable name for the map instance that is used
   * for debugging purposes.
   *
   * @remarks
   *
   * Defaults to `"unknown"` if not set.
   */
  name?: string;
}

class HashMapMissingKeyError<TKey, TValue, TSerializedKey> extends Error {
  public readonly key: TKey;
  public readonly map: HashMap<TKey, TValue, TSerializedKey>;

  constructor(map: HashMap<TKey, TValue, TSerializedKey>, key: TKey) {
    super(
      `Could not find key ${String(key)} (${typeof key}) in HashMap ${map.name}`,
    );

    this.map = map;
    this.key = key;
  }
}

/**
 * Implementation of a key-value map that allows you to customise the way keys
 * are stored by using a custom hashing function.
 *
 * @remarks
 * Unlike an ES6 `Map` which always uses
 * [SameValueZero](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Equality_comparisons_and_sameness#Same-value-zero_equality)
 * on the key stored as-is, map allows you to customise the way keys
 * are stored by using a custom hashing function.
 *
 * By default this map uses {@link identity} as a hash function meaning that
 * keys are stored as-is, which is the same behaviour as an ES6 `Map`.
 */
export class HashMap<TKey, TValue, THashedKey = TKey> {
  /**
   * Error thrown when attempting to access a key in the map that
   * does not exist.
   */
  public static MissingKeyError = HashMapMissingKeyError;

  constructor(
    /**
     * Function called to hash a key before storing or using it to access a
     * value in the map.
     */
    public readonly hash: (key: TKey) => THashedKey,

    /**
     * Internal data structure that we use to store the entries in the
     * map.
     */
    protected readonly _map: Map<THashedKey, TValue> = new Map(),

    /**
     * Human readable name for the map instance that is used for
     * debugging purposes.
     */
    public readonly name = "unknown",
  ) {}

  /**
   * Create a new empty map instance.
   *
   * @remarks
   *
   * This function uses the {@link identity} function as the hashing function
   * meaning that keys will be stored without any changes.
   *
   * @example
   * ```typescript
   * const map = HashMap.empty<number, string>();
   *
   * [...map]; // => []
   *
   * map.set(1, "one");
   *
   * [...map]; // => [[1, "one"]]
   * ```
   *
   * @see {@link HashMap.emptyWithCustomHash}
   *
   * @param options - Options to use to create the new map instance.
   *
   * @returns A new empty map instance.
   */
  static empty<TKey, TValue>(
    options: Omit<HashMapOptions<TKey>, "hash"> = {},
  ): HashMap<TKey, TValue, TKey> {
    return new HashMap<TKey, TValue, TKey>(identity, new Map(), options.name);
  }

  /**
   * Create a new empty map instance with a custom hashing function.
   *
   * @param options - Options to use to create the new map instance.
   *
   * @returns A new empty map instance.
   */
  static emptyWithCustomHash<TKey, TValue, THashedKey = TKey>(
    options: HashMapOptions<TKey, THashedKey>,
  ): HashMap<TKey, TValue, THashedKey> {
    return new HashMap<TKey, TValue, THashedKey>(
      options.hash,
      new Map(),
      options.name,
    );
  }

  /**
   * Create a new map instance from an array of key-value pairs with
   * a custom hashing function.
   *
   * @example Use ISO string representation of Date objects as hash keys
   * ```typescript
   * const map = HashMap.fromCustomEntries(
   * [
   *   [new Date("2020-01-01"), 1],
   *   [new Date("2020-02-01"), 2],
   *   [new Date("2020-03-01"), 3],
   * ],
   * {
   *   hash(key) {
   *     return key.toISOString();
   *   },
   * });
   *
   * [...map];
   * // => [
   * //   ["2020-01-01T00:00:00.000Z", 1],
   * //   ["2020-02-01T00:00:00.000Z", 2],
   * //   ["2020-03-01T00:00:00.000Z", 3],
   * // ];
   * ```
   *
   * @param entries - Array of key-value pairs to create the map
   * with.
   * @param options - Options to use to create the new map instance.
   *
   * @returns A new map instance with the given key-value pairs and
   * a given custom hashing function.
   */
  static fromCustomEntries<TKey, TValue, THashedKey>(
    entries: [TKey, TValue][],
    options: HashMapOptions<TKey, THashedKey>,
  ): HashMap<TKey, TValue, THashedKey> {
    return new HashMap<TKey, TValue, THashedKey>(
      options.hash,
      new Map(entries.map(([k, v]) => [options.hash(k), v] as const)),
      options.name,
    );
  }

  /**
   * Create a new map instance from an array of key-value pairs
   * using the {@link identity} as the hash function.
   *
   * @remarks
   *
   * This function uses the {@link identity} function as the hashing function
   * meaning that keys will be stored without any changes which will therefore
   * use the same behaviour as an ES6 `Map`.
   *
   * @example
   * ```typescript
   * const map = HashMap.fromEntries<number, string>([
   *   [1, "one"],
   *   [2, "two"],
   *   [3, "three"],
   * ]);
   *
   * [...map];
   * // => [
   * //   [1, "one"],
   * //   [2, "two"],
   * //   [3, "three"],
   * // ];
   * ```
   *
   * @param entries - Array of key-value pairs to create the map
   * with.
   * @param options - Options to use to create the new map instance.
   *
   * @returns A new map instance with the given key-value pairs.
   */
  static fromEntries<TKey, TValue>(
    entries: [TKey, TValue][],
    options: Omit<HashMapOptions<TKey>, "hash"> = {},
  ): HashMap<TKey, TValue, TKey> {
    return new HashMap(
      identity,
      new Map(entries.map(([key, value]) => [key, value] as const)),
      options.name,
    );
  }

  /**
   * Clears all of the entries in this map.
   *
   * @remarks
   *
   * This function **will mutate** the map instance it is called on.
   *
   *   * @example
   * ```typescript
   * const map = HashMap.fromEntries<number, string>([
   *   [1, "one"],
   *   [2, "two"],
   *   [3, "three"],
   * ]);
   *
   * map.clear();
   *
   * [...map]; // => []
   * ```
   */
  clear(): void {
    this._map.clear();
  }

  /**
   * Delete an entry from this map by its key, throwing a
   * {@link HashMap.MissingKeyError} if the key does not exist in this map.
   *
   * @example
   * ```typescript
   * const map = HashMap.fromEntries<number, string>([
   *   [1, "one"],
   *   [2, "two"],
   *   [3, "three"],
   * ]);
   *
   * map.delete(2);
   *
   * [...map];
   * // => [
   * //   [1, "one"],
   * //   [3, "three"],
   * // ]
   *
   * map.delete(4); // throws HashMap.MissingKeyError
   * ```
   *
   * @param key - The key of the entry to delete.
   *
   * @throws {@link HashMap.MissingKeyError} if the key does not exist in this
   * map.
   */
  delete(key: TKey): void {
    if (!this.has(key)) {
      throw new HashMap.MissingKeyError(this, key);
    }

    this._map.delete(this.hash(key));
  }

  /**
   * Delete an entry from this map by its key and returns `true` if it exists,
   * otherwise it simply returns `false`.
   *
   * @example
   * ```typescript
   * const map = HashMap.fromEntries<number, string>([
   *   [1, "one"],
   *   [2, "two"],
   *   [3, "three"],
   * ]);
   *
   * map.deleteIfExists(2); // => true
   * map.deleteIfExists(4); // => false
   *
   * [...map];
   * // => [
   * //   [1, "one"],
   * //   [3, "three"],
   * // ]
   * ```
   *
   * @param key - The key of the entry to delete.
   *
   * @returns `true` if the key existed and the entry was deleted, `false` if
   * the key did not exist.
   */
  deleteIfExists(key: TKey): boolean {
    if (!this.has(key)) {
      return false;
    }

    this.delete(key);

    return true;
  }

  /**
   * Returns the entries in this map as an {@link IterableIterator} which each
   * entry as an array of `[key, value]`.
   *
   * @example
   * ```typescript
   * const map = HashMap.fromEntries<number, string>([
   *   [1, "one"],
   *   [2, "two"],
   *   [3, "three"],
   * ]);
   *
   * [...map.entries()];
   * // => [
   * //   [1, "one"],
   * //   [2, "two"],
   * //   [3, "three"],
   * // ]
   * ```
   *
   * @returns An {@link IterableIterator} of the entries in this
   * map.
   */
  entries(): IterableIterator<[THashedKey, TValue]> {
    /**
     * You can't currently define an arrow function that is a generator
     * function.
     */
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const _this = this;

    return (function* () {
      for (const [key, value] of _this._map.entries()) {
        yield [key, value];
      }
    })();
  }

  /**
   * Returns a new map with only the key-value pairs where the given function
   * returns `true`, filtering out those that the given function returns `false`
   * for.
   *
   * @remarks
   * This function does not mutate the original map instance **unless** you call
   * a mutating function on the map (4th argument) inside the given function.
   *
   * @example Include entries where key is greater than 2
   * ```typescript
   * const map = HashMap.fromEntries<number, string>([
   *   [1, "one"],
   *   [2, "two"],
   *   [3, "three"],
   *   [4, "four"],
   * ]);
   *
   * const filtered = map.filter((value, key) => key > 2);
   *
   * [...filtered];
   * // => [
   * //   [3, "three"],
   * //   [4, "four"],
   * // ]
   * ```
   * @example Include entries where the value has a length greater than 3
   * ```typescript
   * const map = HashMap.fromEntries<number, string>([
   *   [1, "one"],
   *   [2, "two"],
   *   [3, "three"],
   *   [4, "four"],
   * ]);
   *
   * const filtered = map.filter((value) => value.length > 3);
   *
   * [...filtered];
   * // => [
   * //   [3, "three"],
   * //   [4, "four"],
   * // ]
   * ```
   *
   * @param fn - Function called for each key-value pair in the map that returns
   * `true` to include the pair in the new map or `false` to exclude it.
   *
   * @returns A new map with only the key-value pairs where the given function
   * returned `true` for.
   */
  filter(
    fn: HashMapFilterFn<TKey, TValue, THashedKey>,
  ): HashMap<TKey, TValue, THashedKey> {
    const entries: [THashedKey, TValue][] = [];

    for (const [key, value] of this.entries()) {
      if (fn(value, key, entries.length, this)) {
        entries.push([key, value]);
      }
    }

    return new HashMap(this.hash, new Map(entries), this.name);
  }

  /**
   * Get the value with the given key from this map, throwing a
   * {@link HashMap.MissingKeyError} if the key does not exist.
   *
   * @example
   * ```typescript
   * const map = HashMap.fromEntries([
   *   [1, "one"],
   *   [2, "two"],
   *   [3, "three"]
   * ]);
   *
   * map.get(2) // => "two"
   *
   * map.get(4) // => throws HashMap.MissingKeyError
   * ```
   *
   * @param key - The key of the value to get.
   *
   * @returns The value with the given key.
   */
  get(key: TKey): TValue {
    const value = this._map.get(this.hash(key));

    if (!value) {
      throw new HashMapMissingKeyError(this, key);
    }

    return value;
  }

  /**
   * Get the value with the given key from this map if it exists, otherwise
   * return the given default value.
   *
   * @param key - The key whose associated value is to be returned.
   * @param defaultValue - The value to return if the key is not found.
   *
   * @returns - The value associated with the specified key, or the default
   * value if the key does not exist.
   */
  getOr<TDefaultValue = TValue>(
    key: TKey,
    defaultValue: TDefaultValue,
  ): TDefaultValue | TValue {
    const value = this._map.get(this.hash(key));

    if (!value) {
      return defaultValue;
    }

    return value;
  }

  /**
   * Checks if this map has an entry with the given key.
   *
   * @param key - The key to check for.
   *
   * @returns `true` if the key exists in this map, `false` otherwise.
   */
  has(key: TKey): boolean {
    return this._map.has(this.hash(key));
  }

  /**
   * Get the keys in this map as an {@link IterableIterator}.
   *
   * @returns The keys in this map as an {@link IterableIterator}.
   */
  keys(): IterableIterator<THashedKey> {
    /**
     * You can't currently define an arrow function that is a generator
     * function.
     */
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const _this = this;

    return (function* () {
      for (const key of _this._map.keys()) {
        yield key;
      }
    })();
  }

  /**
   * Create a new map with entries that are the result of calling the given
   * callback function on each of the key-value pairs in this map.
   *
   * @example Swap the keys and values
   * ```typescript
   * const map = HashMap.fromEntries([
   *  ["one", 1],
   *  ["two", 2],
   *  ["three", 3],
   * ]);
   *
   * const swapped = map.map(([key, value]) => [value, key]);
   * // => HashMap { 1 => "one", 2 => "two", 3 => "three" }
   * ```
   *
   * @param fn - Function to call on each key-value pair in the map. The result
   * of this function is used as entries in the new map.
   *
   * @returns A new map with the new entries from calling the given function on
   * each key-value pair in the map.
   */
  map(
    fn: (
      value: TValue,
      key: THashedKey,
      index: number,
      original: HashMap<TKey, TValue, THashedKey>,
    ) => [THashedKey, TValue],
  ): HashMap<TKey, TValue, THashedKey> {
    const entries: [THashedKey, TValue][] = [];

    for (const [key, value] of this.entries()) {
      entries.push(fn(value, key, entries.length, this));
    }

    return new HashMap(this.hash, new Map(entries), this.name);
  }

  /**
   * Create a new map with entries that have keys that are the result of calling
   * the given callback function on each of the key-value pairs in this map.
   *
   * @remarks
   *
   * The new map will have the same default value as this map.
   *
   * This function does not mutate the original map instance **unless** you call
   * a mutating function on the map (4th argument) inside the given function.
   *
   * @param fn - Function to call on each key-value pair in the map. The result
   * of this function is used as the keys for the entries in the new map.
   *
   * @returns A new map with the entries with new keys from calling the given
   * function on each key-value pair in the map.
   */
  mapKeys(
    fn: (
      key: THashedKey,
      value: TValue,
      index: number,
      original: HashMap<TKey, TValue, THashedKey>,
    ) => THashedKey,
  ): HashMap<TKey, TValue, THashedKey> {
    return this.map((value, key, index, original) => [
      fn(key, value, index, original),
      value,
    ]);
  }

  /**
   * Create a new map with entries that have values that are the result of
   * calling the given callback function on each of the key-value pairs in this
   * map.
   *
   * @remarks
   *
   * The new map will have the same default value as this map.
   *
   * This function does not mutate the original map instance **unless** you call
   * a mutating function on the map (4th argument) inside the given function.
   *
   * @param fn - Function to call on each key-value pair in the map. The result
   * of this function is used as the values for the entries in the new map.
   *
   * @returns A new map with the entries with new values from calling the given
   * function on each key-value pair in the map.
   */
  mapValues(
    fn: (
      value: TValue,
      key: THashedKey,
      index: number,
      original: HashMap<TKey, TValue, THashedKey>,
    ) => TValue,
  ): HashMap<TKey, TValue, THashedKey> {
    return this.map((value, key, index, original) => [
      key,
      fn(value, key, index, original),
    ]);
  }

  /**
   * Set the value of an entry by it's key in the map, creating a new entry if
   * one doesn't exist or overriding an existing entry if one does.
   *
   * @param key - The key of the entry to set.
   * @param value - The value to set the entry to.
   */
  set(key: TKey, value: TValue): void {
    this._map.set(this.hash(key), value);
  }

  /**
   * Get the iterator over the entires in this map.
   *
   * @returns The entries in this map as an array of key-value pairs.
   */
  [Symbol.iterator](): Iterator<[THashedKey, TValue]> {
    return this.entries();
  }

  /**
   * Get the values in this map as an {@link IterableIterator}.
   *
   * @returns The values in this map as an {@link IterableIterator}.
   */
  values(): IterableIterator<TValue> {
    return this._map.values();
  }
}
