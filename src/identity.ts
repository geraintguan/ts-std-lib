/**
 * Returns a function that always returns the given value.
 *
 * @param value - The value to return.
 *
 * @returns A function that always returns the given value when called.
 */
export function identity<T>(value: T): () => T {
  return () => value;
}
