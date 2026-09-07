import { describe, expect, it } from "vitest";

import { safeInternalPath } from "./safe-redirect";

describe("safeInternalPath", () => {
  it("accepte un chemin interne", () => {
    expect(safeInternalPath("/dashboard?tab=billing")).toBe("/dashboard?tab=billing");
  });

  it("refuse les redirections ouvertes", () => {
    expect(safeInternalPath("https://evil.example", "/x")).toBe("/x");
    expect(safeInternalPath("//evil.example", "/x")).toBe("/x");
    expect(safeInternalPath("/\\evil.example", "/x")).toBe("/x");
    expect(safeInternalPath(undefined)).toBeUndefined();
  });
});
