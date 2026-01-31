/**
 * Groups elements of an array by a key derived from each element, keeping only
 * the last occurrence of each key.
 *
 * @remarks
 * This function is useful when you want to group elements by a key but you know
 * that each element can only appear once per key, or when you only care about
 * the most recent value for each key.
 *
 * Unlike a traditional `groupBy()` function which returns an array of values
 * for each key, this function returns a single value per key. If multiple
 * elements produce the same key, only the latest (last) element in the array
 * will be retained.
 *
 * @example
 * ```typescript
 * const users = [
 *   { id: 1, name: "Alice" },
 *   { id: 2, name: "Bob" },
 *   { id: 3, name: "Charlie" },
 * ];
 *
 * groupByUnique(users, (user) => user.id);
 * // => {
 * //   1: { id: 1, name: "Alice" },
 * //   2: { id: 2, name: "Bob" },
 * //   3: { id: 3, name: "Charlie" },
 * // }
 * ```
 *
 * @example
 * ```typescript
 * // When there are duplicate keys, the last value wins
 * const items = [
 *   { key: "a", value: 1 },
 *   { key: "b", value: 2 },
 *   { key: "a", value: 3 },
 * ];
 *
 * groupByUnique(items, (item) => item.key);
 * // => {
 * //   a: { key: "a", value: 3 },
 * //   b: { key: "b", value: 2 },
 * // }
 * ```
 *
 * @param array - The array of elements to group.
 * @param keyFn - A function that takes each element and returns the key to
 *   group by.
 *
 * @returns An object where each key is derived from the key function and each
 *   value is the corresponding (last) element from the array.
 */
export function groupByUnique<T, K extends PropertyKey>(
  array: T[],
  keyFn: (value: T) => K,
): Record<K, T> {
  const result = {} as Record<K, T>;

  for (const item of array) {
    const key = keyFn(item);
    result[key] = item;
  }

  return result;
}
