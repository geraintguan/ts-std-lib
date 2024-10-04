import { describe, expect, it } from "vitest";

import * as Std from "./index.js";

describe("exports", () => {
  it("should contain the Data module", () => {
    expect(Std.Data).toBeDefined();
  });

  it("should contain the Data.DefaultMap class", () => {
    expect(Std.Data.DefaultMap).toBeDefined();
  });

  it("should contain the Data.HashMap class", () => {
    expect(Std.Data.HashMap).toBeDefined();
  });

  it("should contain the constant() function", () => {
    expect(Std.constant).toBeDefined();
  });

  it("should contain the identity() function", () => {
    expect(Std.identity).toBeDefined();
  });
});
