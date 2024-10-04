import { identity } from "../identity.js";
import { HashMap, HashMapOptions } from "./HashMap.js";

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
 * Implementation of a specialised key-value map, based on {@link HashMap}, that
 * is created with a default value for retrieving keys that have not been set in
 * the map.
 *
 * @remarks
 *
 * As this map is based of {@link HashMap} it provides the same functionality
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
   * @param entries - Array of key-value pairs to create the {@link HashMap}
   * with.
   * @param options - Options to use to create the new {@link HashMap} instance.
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
  ): HashMap<TKey, TValue, THashedKey> {
    return new DefaultMap<TKey, TValue, THashedKey>(
      options.defaultValue,
      options.hash,
      new Map(entries.map(([k, v]) => [options.hash(k), v] as const)),
      options.name,
    );
  }

  /**
   * Create a new {@link DefaultMap} instance from an array of key-value pairs
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
   * @param entries - Array of key-value pairs to create the {@link DefaultMap}
   * with.
   * @param options - Options to use to create the new {{@link DefaultMap}
   * instance.
   *
   * @returns A new {@link DefaultMap} instance with the given key-value pairs
   * and default value.
   */
  static fromEntries<TKey, TValue>(
    entries: [TKey, TValue][],
    options: Omit<DefaultMapOptions<TKey, TValue>, "hash">,
  ): HashMap<TKey, TValue, TKey> {
    return new DefaultMap(
      options.defaultValue,
      identity,
      new Map(entries.map(([key, value]) => [key, value] as const)),
      options.name,
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
}
