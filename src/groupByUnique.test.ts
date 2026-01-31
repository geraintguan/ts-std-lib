import { describe, expect, it } from "vitest";

import { groupByUnique } from "./groupByUnique.js";

describe("groupByUnique", () => {
  it("should return an empty object when given an empty array", () => {
    const result = groupByUnique([], (x: number) => x);
    expect(result).toEqual({});
  });

  it("should group a single element by its key", () => {
    const users = [{ id: 1, name: "Alice" }];
    const result = groupByUnique(users, (user) => user.id);
    expect(result).toEqual({
      1: { id: 1, name: "Alice" },
    });
  });

  it("should group multiple elements with unique keys", () => {
    const users = [
      { id: 1, name: "Alice" },
      { id: 2, name: "Bob" },
      { id: 3, name: "Charlie" },
    ];
    const result = groupByUnique(users, (user) => user.id);
    expect(result).toEqual({
      1: { id: 1, name: "Alice" },
      2: { id: 2, name: "Bob" },
      3: { id: 3, name: "Charlie" },
    });
  });

  it("should keep only the last element when there are duplicate keys", () => {
    const items = [
      { key: "a", value: 1 },
      { key: "b", value: 2 },
      { key: "a", value: 3 },
    ];
    const result = groupByUnique(items, (item) => item.key);
    expect(result).toEqual({
      a: { key: "a", value: 3 },
      b: { key: "b", value: 2 },
    });
  });

  it("should work with primitive number values", () => {
    const numbers = [1, 2, 3, 4, 5];
    const result = groupByUnique(numbers, (n) =>
      n % 2 === 0 ? "even" : "odd",
    );
    expect(result).toEqual({
      even: 4,
      odd: 5,
    });
  });

  it("should work with primitive string values", () => {
    const strings = ["apple", "banana", "apricot"];
    const result = groupByUnique(strings, (s) => s[0]);
    expect(result).toEqual({
      a: "apricot",
      b: "banana",
    });
  });

  it("should work with string keys", () => {
    const items = [
      { category: "fruit", name: "apple" },
      { category: "vegetable", name: "carrot" },
    ];
    const result = groupByUnique(items, (item) => item.category);
    expect(result).toEqual({
      fruit: { category: "fruit", name: "apple" },
      vegetable: { category: "vegetable", name: "carrot" },
    });
  });

  it("should work with number keys", () => {
    const items = [
      { priority: 1, task: "urgent" },
      { priority: 2, task: "normal" },
      { priority: 3, task: "low" },
    ];
    const result = groupByUnique(items, (item) => item.priority);
    expect(result).toEqual({
      1: { priority: 1, task: "urgent" },
      2: { priority: 2, task: "normal" },
      3: { priority: 3, task: "low" },
    });
  });

  it("should preserve object references", () => {
    const obj1 = { id: 1 };
    const obj2 = { id: 2 };
    const result = groupByUnique([obj1, obj2], (obj) => obj.id);
    expect(result[1]).toBe(obj1);
    expect(result[2]).toBe(obj2);
  });

  it("should work with arrays as values", () => {
    const data = [
      { group: "a", items: [1, 2, 3] },
      { group: "b", items: [4, 5, 6] },
    ];
    const result = groupByUnique(data, (d) => d.group);
    expect(result).toEqual({
      a: { group: "a", items: [1, 2, 3] },
      b: { group: "b", items: [4, 5, 6] },
    });
  });
});
