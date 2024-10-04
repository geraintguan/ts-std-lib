import { identity } from "../identity.js";
import { HashMap, HashMapOptions } from "./HashMap.js";

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
export type DefaultMapFilterFn<
  TKey,
  TValue,
  THashedKey,
  TDefaultValue extends TValue,
> = (
  value: TValue,
  key: THashedKey,
  index: number,
  original: DefaultMap<TKey, TValue, THashedKey, TDefaultValue>,
) => boolean;

export interface DefaultMapOptions<
  TKey,
  TValue,
  THashedKey = TKey,
  TDefaultValue extends TValue = TValue,
> extends HashMapOptions<TKey, THashedKey> {
  defaultValue: DefaultMap<
    TKey,
    TValue,
    THashedKey,
    TDefaultValue
  >["defaultValue"];
}

/**
 * Implementation of a specialised key-value map, based on map, that
 * is created with a default value for retrieving keys that have not been set in
 * the map.
 *
 * @remarks
 *
 * As this map is based of map it provides the same functionality
 * such as the ability to customise the hashing function.
 *
 * When a default value is returned for a non-existent key, an entry is created
 * for that key with the default value.
 *
 * @example Using a static value as the default value
 * ```typescript
 * const map = DefaultMap.empty<string, number>({
 *   defaultValue: { type: "value", value: 1 },
 * });
 *
 * map.get("a"); // => 1
 *
 * map.set("b", 2);
 * map.get("b"); // => 2
 *
 * [...map.keys()]; // => ["a", "b"]
 * ```
 *
 * @example Using a function to generate the default value based on the key
 * ```typescript
 * const map = DefaultMap.empty<string, number>({
 *   defaultValue: { type: "function", value: (key) => key.length },
 * });
 *
 * map.get("cat"); // => 3
 * map.get("cat-dog"); // => 7
 *
 * map.set("dog", 4);
 * map.get("dog"); // => 4
 *
 * [...map.keys()]; // => ["cat", "cat-dog", "dog"]
 * ```
 */
export class DefaultMap<
  TKey,
  TValue,
  THashedKey = TKey,
  TDefaultValue extends TValue = TValue,
> extends HashMap<TKey, TValue, THashedKey> {
  /**
   * Default value to use in this map when accessing keys that do not exist.
   *
   * @remarks
   *
   * Two types of default value are supported:
   *
   * 1. Providing a **function** will make the map call the given function that
   *    is called with the current access key to generate the default value.
   *
   * 2. Providing a static **value** that will be used as-is as the default
   *    value.
   */
  public defaultValue:
    | { type: "function"; value: (key: TKey) => TDefaultValue }
    | { type: "value"; value: TDefaultValue };

  constructor(
    defaultValue: DefaultMap<
      TKey,
      TValue,
      THashedKey,
      TDefaultValue
    >["defaultValue"],
    hash: (key: TKey) => THashedKey,
    map = new Map<THashedKey, TValue>(),
    name = "unknown",
  ) {
    super(hash, map, name);

    this.defaultValue = defaultValue;
  }

  /**
   * Create a new empty map instance.
   *
   * @remarks
   *
   * This function uses the {@link identity} function as the hashing function
   * meaning that keys will be stored without any changes.
   *
   * @see {@link DefaultMap.emptyWithCustomHash}
   *
   * @param options - Options to use to create the new map instance.
   *
   * @returns A new empty map instance.
   */
  static empty<TKey, TValue, TDefaultValue extends TValue = TValue>(
    options: Omit<DefaultMapOptions<TKey, TValue, TKey, TDefaultValue>, "hash">,
  ): DefaultMap<TKey, TValue, TKey, TDefaultValue> {
    return new DefaultMap<TKey, TValue, TKey, TDefaultValue>(
      options.defaultValue,
      identity,
      new Map(),
      options.name,
    );
  }

  /**
   * Create a new empty mao instance with a custom hashing function.
   *
   * @param options - Options to use to create the new map instance.
   *
   * @returns A new empty map instance.
   */
  static emptyWithCustomHash<
    TKey,
    TValue,
    THashedKey = TKey,
    TDefaultValue extends TValue = TValue,
  >(
    options: DefaultMapOptions<TKey, TValue, THashedKey, TDefaultValue>,
  ): DefaultMap<TKey, TValue, THashedKey, TDefaultValue> {
    return new DefaultMap<TKey, TValue, THashedKey, TDefaultValue>(
      options.defaultValue,
      options.hash,
      new Map(),
      options.name,
    );
  }

  /**
   * Create a new map instance from an array of key-value pairs with a custom
   * hashing function.
   *
   * @param entries - Array of key-value pairs to create the map
   * with.
   * @param options - Options to use to create the new map instance.
   *
   * @returns A new map instance with the given key-value pairs and a given
   * custom hashing function.
   */
  static fromCustomEntries<
    TKey,
    TValue,
    THashedKey = TKey,
    TDefaultValue extends TValue = TValue,
  >(
    entries: [TKey, TValue][],
    options: DefaultMapOptions<TKey, TValue, THashedKey, TDefaultValue>,
  ): DefaultMap<TKey, TValue, THashedKey, TDefaultValue> {
    return new DefaultMap<TKey, TValue, THashedKey, TDefaultValue>(
      options.defaultValue,
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
   * meaning that keys will be stored without any changes.
   *
   * @example
   * ```typescript
   * const map = DefaultMap.fromEntries<number, string>([
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
   * @param options - Options to use to create the new {map
   * instance.
   *
   * @returns A new map instance with the given key-value pairs
   * and default value.
   */
  static fromEntries<TKey, TValue, TDefaultValue extends TValue = TValue>(
    entries: [TKey, TValue][],
    options: Omit<DefaultMapOptions<TKey, TValue, TKey, TDefaultValue>, "hash">,
  ): DefaultMap<TKey, TValue, TKey, TDefaultValue> {
    return new DefaultMap(
      options.defaultValue,
      identity,
      new Map(entries.map(([key, value]) => [key, value] as const)),
      options.name,
    );
  }

  /**
   * Returns a new map with only the key-value pairs where the given function
   * returns `true`, filtering out those that the given function returns `false`
   * for.
   *
   * @remarks
   *
   * The new map will have the same default value as this map.
   *
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
   * ], {
   *   defaultValue: {
   *     type: "value",
   *     value: "NaN",
   *   }
   * });
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
   * const map = DefaultMap.fromEntries<number, string>([
   *   [1, "one"],
   *   [2, "two"],
   *   [3, "three"],
   *   [4, "four"],
   * ], {
   *   defaultValue: {
   *     type: "value",
   *     value: "NaN",
   *   }
   * });
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
    fn: DefaultMapFilterFn<TKey, TValue, THashedKey, TDefaultValue>,
  ): DefaultMap<TKey, TValue, THashedKey, TDefaultValue> {
    const entries: [THashedKey, TValue][] = [];

    for (const [key, value] of this.entries()) {
      if (fn(value, key, entries.length, this)) {
        entries.push([key, value]);
      }
    }

    return new DefaultMap(
      this.defaultValue,
      this.hash,
      new Map(entries),
      this.name,
    );
  }

  /**
   * Get the value with the given key from this map if it exists, if it doesn't
   * return the default value configured for this map.
   *
   * @remarks
   *
   * Unlike {@link HashMap.get}, this method will not throw an error if the key
   * does not exist in the map, instead returning the configured default value.
   *
   * Accessing an entry that does not exist with a key will set a new entry on
   * the map with the given key and the created default value as the value of
   * that entry.
   *
   * @param key - The key of the value to get.
   *
   * @returns The value with the given key in this map if it exists, if it
   * doesn't then the default value configured for this map.
   */
  get(key: TKey): TDefaultValue | TValue {
    if (!this.has(key)) {
      const defaultValue =
        this.defaultValue.type === "function"
          ? this.defaultValue.value(key)
          : this.defaultValue.value;

      this.set(key, defaultValue);

      return defaultValue;
    }

    return super.get(key);
  }

  /**
   * Create a new map with entries that are the result of calling the given
   * callback function on each of the key-value pairs in this map.
   *
   * @remarks
   *
   * The new map will have the same default value as this map.
   *
   * This function does not mutate the original map instance **unless** you call
   * a mutating function on the map (4th argument) inside the given function.
   *
   * @example Swap the keys and values
   * ```typescript
   * const map = HashMap.fromEntries([
   *  ["one", 1],
   *  ["two", 2],
   *  ["three", 3],
   * ], {
   *   defaultValue: {
   *     type: "value",
   *     value: "NaN",
   *   }
   * });
   *
   * const swapped = map.map(([key, value]) => [value, key]);
   * // => DefaultMap { 1 => "one", 2 => "two", 3 => "three" }
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
      original: DefaultMap<TKey, TValue, THashedKey, TDefaultValue>,
    ) => [THashedKey, TValue],
  ): DefaultMap<TKey, TValue, THashedKey, TDefaultValue> {
    const entries: [THashedKey, TValue][] = [];

    for (const [key, value] of this.entries()) {
      entries.push(fn(value, key, entries.length, this));
    }

    return new DefaultMap(
      this.defaultValue,
      this.hash,
      new Map(entries),
      this.name,
    );
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
      original: DefaultMap<TKey, TValue, THashedKey, TDefaultValue>,
    ) => THashedKey,
  ): DefaultMap<TKey, TValue, THashedKey, TDefaultValue> {
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
      original: DefaultMap<TKey, TValue, THashedKey, TDefaultValue>,
    ) => TValue,
  ): DefaultMap<TKey, TValue, THashedKey, TDefaultValue> {
    return this.map((value, key, index, original) => [
      key,
      fn(value, key, index, original),
    ]);
  }
}
