import { describe, expect, it } from "vitest";

import { Unpack } from "./Unpack.js";

describe("Unpack", () => {
  it("should type the element of an array correctly", () => {
    const array: number[] = [1, 2, 3];
    const element: Unpack<typeof array> = 1;

    expect(array).toEqual([1, 2, 3]);
    expect(element).toBe(1);
  });
});
