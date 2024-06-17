import { BaseMap } from "./BaseMap.js";
import { HashMap } from "./HashMap.js";

export class DefaultMap<TKey, TValue> implements BaseMap<TKey, TValue> {
  static empty<TKey, TValue>(
    defaultValue: (key: TKey, self: DefaultMap<TKey, TValue>) => TValue,
    options: {
      deserializeKey?: BaseMap<TKey, TValue>["deserializeKey"];
      serializeKey?: BaseMap<TKey, TValue>["serializeKey"];
    } = {},
  ) {
    return DefaultMap.fromEntries([], defaultValue, options);
  }

  static fromEntries<TKey, TValue>(
    entries: [TKey, TValue][],
    defaultValue: (key: TKey, self: DefaultMap<TKey, TValue>) => TValue,
    {
      deserializeKey = JSON.parse,
      serializeKey = JSON.stringify,
    }: {
      deserializeKey?: BaseMap<TKey, TValue>["deserializeKey"];
      serializeKey?: BaseMap<TKey, TValue>["serializeKey"];
    } = {},
  ): DefaultMap<TKey, TValue> {
    return new DefaultMap(
      new HashMap(
        new Map(
          entries.map(([key, value]) => [serializeKey(key), value] as const),
        ),
        deserializeKey,
        serializeKey,
      ),
      defaultValue,
    );
  }

  constructor(
    private readonly _data: HashMap<TKey, TValue> = HashMap.empty(),
    private readonly _defaultValue: (
      key: TKey,
      self: DefaultMap<TKey, TValue>,
    ) => TValue,
    public readonly instanceName?: string,
  ) {}

  [Symbol.iterator](): Iterator<[TKey, TValue]> {
    return this.entries();
  }

  clear(): void {
    this._data.clear();
  }

  delete(key: TKey): void {
    this._data.delete(key);
  }

  deleteIfExists(key: TKey): boolean {
    return this._data.deleteIfExists(key);
  }

  deserializeKey(key: string): TKey {
    return this._data.deserializeKey(key);
  }

  entries(): IterableIterator<[TKey, TValue]> {
    return this._data.entries();
  }

  filter(
    fn: (
      value: TValue,
      key: TKey,
      index: number,
      original: DefaultMap<TKey, TValue>,
    ) => boolean,
  ): DefaultMap<TKey, TValue> {
    const entries: [TKey, TValue][] = [];

    let index = 0;
    for (const [key, value] of this._data.entries()) {
      if (fn(value, key, index, this)) {
        entries.push([key, value]);
      }

      index++;
    }

    return DefaultMap.fromEntries(entries, this._defaultValue, {
      deserializeKey: this._data.deserializeKey,
      serializeKey: this._data.serializeKey,
    });
  }

  get(key: TKey): TValue {
    if (!this.has(key)) {
      const defaultValue = this._defaultValue(key, this);

      this.set(key, defaultValue);

      return defaultValue;
    }

    return this._data.get(key);
  }

  getOr<TDefaultValue = TValue>(
    key: TKey,
    defaultValue: TDefaultValue,
  ): TValue | TDefaultValue {
    return this._data.getOr(key, defaultValue);
  }

  has(key: TKey): boolean {
    return this._data.has(key);
  }

  keys(): IterableIterator<TKey> {
    return this._data.keys();
  }

  map(
    fn: (
      value: TValue,
      key: TKey,
      index: number,
      original: DefaultMap<TKey, TValue>,
    ) => [TKey, TValue],
  ): DefaultMap<TKey, TValue> {
    const entries: [TKey, TValue][] = [];

    let index = 0;
    for (const [key, value] of this._data.entries()) {
      entries.push(fn(value, key, index, this));

      index++;
    }

    return DefaultMap.fromEntries<TKey, TValue>(entries, this._defaultValue, {
      deserializeKey: this._data.deserializeKey,
      serializeKey: this._data.serializeKey,
    });
  }

  mapKeys(
    fn: (
      key: TKey,
      value: TValue,
      index: number,
      original: DefaultMap<TKey, TValue>,
    ) => TKey,
  ): DefaultMap<TKey, TValue> {
    const entries: [TKey, TValue][] = [];

    let index = 0;
    for (const [key, value] of this._data.entries()) {
      entries.push([fn(key, value, index, this), value]);

      index++;
    }

    return DefaultMap.fromEntries<TKey, TValue>(entries, this._defaultValue, {
      deserializeKey: this._data.deserializeKey,
      serializeKey: this._data.serializeKey,
    });
  }

  mapValues(
    fn: (
      value: TValue,
      key: TKey,
      index: number,
      original: DefaultMap<TKey, TValue>,
    ) => TValue,
  ): DefaultMap<TKey, TValue> {
    const entries: [TKey, TValue][] = [];

    let index = 0;
    for (const [key, value] of this._data.entries()) {
      entries.push([key, fn(value, key, index, this)]);

      index++;
    }

    return DefaultMap.fromEntries<TKey, TValue>(entries, this._defaultValue, {
      deserializeKey: this._data.deserializeKey,
      serializeKey: this._data.serializeKey,
    });
  }

  serializeKey(key: TKey): string {
    return this._data.serializeKey(key);
  }

  serializedKeys(): IterableIterator<string> {
    return this._data.serializedKeys();
  }

  set(key: TKey, value: TValue): void {
    this._data.set(key, value);
  }

  values(): IterableIterator<TValue> {
    return this._data.values();
  }
}
