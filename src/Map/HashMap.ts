import { BaseMap } from "./BaseMap.js";
import { MissingKeyError } from "./MissingKeyError.js";

export class HashMap<TKey, TValue> implements BaseMap<TKey, TValue> {
  static empty<TKey, TValue>({
    deserializeKey = JSON.parse,
    serializeKey = JSON.stringify,
  }: {
    deserializeKey?: BaseMap<TKey, TValue>["deserializeKey"];
    serializeKey?: BaseMap<TKey, TValue>["serializeKey"];
  } = {}): HashMap<TKey, TValue> {
    return new HashMap(new Map(), deserializeKey, serializeKey);
  }

  static fromEntries<TKey, TValue>(
    entries: [TKey, TValue][],
    {
      deserializeKey = JSON.parse,
      serializeKey = JSON.stringify,
    }: {
      deserializeKey?: BaseMap<TKey, TValue>["deserializeKey"];
      serializeKey?: BaseMap<TKey, TValue>["serializeKey"];
    } = {},
  ): HashMap<TKey, TValue> {
    return new HashMap(
      new Map(
        entries.map(([key, value]) => [serializeKey(key), value] as const),
      ),
      deserializeKey,
      serializeKey,
    );
  }

  constructor(
    protected readonly data: Map<string, TValue> = new Map(),
    public deserializeKey: (key: string) => TKey = JSON.parse,
    public serializeKey: (key: TKey) => string = JSON.stringify,
  ) {}

  [Symbol.iterator](): Iterator<[TKey, TValue]> {
    return this.entries();
  }

  clear(): void {
    this.data.clear();
  }

  delete(key: TKey): void {
    if (!this.has(key)) {
      throw new MissingKeyError();
    }

    this.data.delete(this.serializeKey(key));
  }

  deleteIfExists(key: TKey): boolean {
    if (!this.has(key)) {
      return false;
    }

    this.delete(key);

    return true;
  }

  entries(): IterableIterator<[TKey, TValue]> {
    const _this = this;

    return (function* () {
      for (const [key, value] of _this.data.entries()) {
        yield [_this.deserializeKey(key), value];
      }
    })();
  }

  filter(
    fn: (
      value: TValue,
      key: TKey,
      index: number,
      original: HashMap<TKey, TValue>,
    ) => boolean,
  ): HashMap<TKey, TValue> {
    const entries: [TKey, TValue][] = [];

    for (const [key, value] of this.entries()) {
      if (fn(value, key, entries.length, this)) {
        entries.push([key, value]);
      }
    }

    return HashMap.fromEntries(entries, {
      deserializeKey: this.deserializeKey,
      serializeKey: this.serializeKey,
    });
  }

  get(key: TKey): TValue {
    const value = this.data.get(this.serializeKey(key));

    if (!value) {
      throw new MissingKeyError();
    }

    return value;
  }

  getOr<TDefaultValue = TValue>(
    key: TKey,
    defaultValue: TDefaultValue,
  ): TValue | TDefaultValue {
    const value = this.data.get(this.serializeKey(key));

    if (!value) {
      return defaultValue;
    }

    return value;
  }

  has(key: TKey): boolean {
    return this.data.has(this.serializeKey(key));
  }

  keys(): IterableIterator<TKey> {
    const _this = this;

    return (function* () {
      for (const key of _this.data.keys()) {
        yield _this.deserializeKey(key);
      }
    })();
  }

  map(
    fn: (
      value: TValue,
      key: TKey,
      index: number,
      original: HashMap<TKey, TValue>,
    ) => [TKey, TValue],
  ): HashMap<TKey, TValue> {
    const entries: [TKey, TValue][] = [];

    for (const [key, value] of this.entries()) {
      entries.push(fn(value, key, entries.length, this));
    }

    return HashMap.fromEntries<TKey, TValue>(entries, {
      deserializeKey: this.deserializeKey,
      serializeKey: this.serializeKey,
    });
  }

  mapKeys(
    fn: (
      key: TKey,
      value: TValue,
      index: number,
      original: HashMap<TKey, TValue>,
    ) => TKey,
  ): HashMap<TKey, TValue> {
    return this.map((value, key, index, original) => [
      fn(key, value, index, original),
      value,
    ]);
  }

  mapValues(
    fn: (
      value: TValue,
      key: TKey,
      index: number,
      original: HashMap<TKey, TValue>,
    ) => TValue,
  ): HashMap<TKey, TValue> {
    return this.map((value, key, index, original) => [
      key,
      fn(value, key, index, original),
    ]);
  }

  serializedKeys(): IterableIterator<string> {
    return this.data.keys();
  }

  set(key: TKey, value: TValue): void {
    this.data.set(this.serializeKey(key), value);
  }

  values(): IterableIterator<TValue> {
    return this.data.values();
  }
}
