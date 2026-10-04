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

  it("refuse les caractères que le navigateur supprime avant d'analyser l'URL", () => {
    // `new URL("/\t/evil.example", origine)` pointe vers https://evil.example/.
    expect(safeInternalPath("/\t/evil.example", "/x")).toBe("/x");
    expect(safeInternalPath("/\n/evil.example", "/x")).toBe("/x");
    expect(safeInternalPath("/\r/evil.example", "/x")).toBe("/x");
    expect(safeInternalPath("/a\\..\\/evil.example", "/x")).toBe("/x");
  });
});
