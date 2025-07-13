# Typescript Standard Library

[![Coverage
Status](https://coveralls.io/repos/github/geraintguan/ts-std-lib/badge.svg?branch=main)](https://coveralls.io/github/geraintguan/ts-std-lib?branch=main)
[![Semantic Release: Conventional Commits](https://img.shields.io/badge/Semantic_Release-Conventional_Commits-e10079?logo=semantic-release)](https://github.com/semantic-release/semantic-release)

[API Reference](https://ts-std-lib.geraint.io)

A practical and pragmatic universal standard library for TypeScript targeting Browser/Node.js runtimes.

## Installation

### NPM

```shell
npm install -S @geraintguan/ts-std-lib
```

### PNPM

```shell
pnpm add @geraintguan/ts-std-lib
```

## Usage

### Data Structures

#### `HashMap`

[API Reference](https://ts-std-lib.geraint.io/classes/Data.HashMap.html)

Implementation of a key-value map that allows you to customise the way keys are
stored by using a custom hashing function.

##### Example: `HashMap` of ISO8601 Date String keys

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

[API Reference](https://ts-std-lib.geraint.io/classes/Data.DefaultMap.html)

Implementation of a key-value map that allows you to customise the way keys are
stored by using a custom hashing function **and** specify either a value or
value generator function that will be returned when trying to access
non-existant keys.

##### Example: `DefaultMap` of ID of documents with timestamp that defaults to current date and time

```typescript
import * as Std from "@geraintguan/ts-std-lib";

type Document = {
  id: string;
};

const map = Std.Data.DefaultMap.emptyWithCustomHash<Document, Date, string>({
  defaultValue: {
    type: "function",

    value() {
      return new Date(),
    }
  },
  hash(document) {
    return document.id;
  },
});

const documentA = { id: "document-a" };
const documentB = { id: "document-b" };
const documentC = { id: "document-c" };

map.set(documentA, new Date("2020-01-01T00:00:00.000Z"));
map.set(documentB, new Date("2021-01-01T00:00:00.000Z"));

map.get(documentA).toISOString() // => "2020-01-01T00:00:00.000Z"
map.get(documentB).toISOString() // => "2021-01-01T00:00:00.000Z"
map.get(documentC).toISOString() // => new Date().toISOString()

[...map.keys()] // => [
//   "document-a",
//   "document-b",
//   "document-c",
// ]
```

### Utility Functions

#### `constant()`

[API Reference](https://ts-std-lib.geraint.io/functions/constant.html)

Creates a function that always returns a specific value.

##### Example

```typescript
import * as Std from "@geraintguan/ts-std-lib";

const nine = Std.constant(9);

nine(); // => 9
nine(); // => 9
nine(); // => 9
```

#### `identity()`

[API Reference](https://ts-std-lib.geraint.io/functions/identity.html)

Creates a function that always returns the value given to it as an argument.

##### Example

```typescript
import * as Std from "@geraintguan/ts-std-lib";

[true, false, true].filter(Std.identity); // => [
//   true,
//   true
// ]
```
