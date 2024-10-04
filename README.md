# @geraintguan/ts-std-lib

[![Coverage Status](https://coveralls.io/repos/github/geraintguan/ts-std-lib/badge.svg?branch=main)](https://coveralls.io/github/geraintguan/ts-std-lib?branch=main)

A practical and pragmatic standard library for TypeScript (and JavaScript).

## Installation

```shell
npm install @geraintguan/ts-std-lib
```

## Usage

### Data Structures

#### `HashMap`

Implementation of a key-value map that allows you to customise the way keys are
stored by using a custom hashing function.

##### Example: ISO8601 Date String Keyed `HashMap`

One useful example is using a HashMap that accepts `Date` objects as keys but
storing them as their [ISO8601 Date
Strings](https://en.wikipedia.org/wiki/ISO_8601).

```typescript
import * as Std from "@geraintguan/ts-std-lib";

const map = Std.Data.HashMap.emptyWithCustomHash<Date, number, string>({
  hash(date) {
    data.toISOString();
  },
});

const today = new Date("2024-11-01T12:00:00.000Z");
const tomorrow = new Date("2024-11-02T12:00:00.000Z");

map.set(today, 2);
map.set(tomorrow, 3);

[...map.keys()]; // => [
//   "2024-11-01T12:00:00.000Z",
//   "2024-11-02T12:00:00.000Z"
// ]
```

#### `DefaultMap`

### Utility Functions

#### `constant()`

#### `identity()`
