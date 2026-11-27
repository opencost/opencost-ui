import { describe, expect, it } from "vitest";
import { parseFilters, parseFiltersFromUrl } from "~/lib/legacy-util";

describe("parseFiltersFromUrl", () => {
  it("parses several filters joined with +", () => {
    expect(parseFiltersFromUrl('namespace:"kube-system"+label:"app"')).toEqual([
      { property: "namespace", value: "kube-system" },
      { property: "label", value: "app" },
    ]);
  });

  it("keeps a + inside a quoted value", () => {
    expect(parseFiltersFromUrl('label:"c++"+namespace:"a+b"')).toEqual([
      { property: "label", value: "c++" },
      { property: "namespace", value: "a+b" },
    ]);
  });

  it("skips malformed terms", () => {
    expect(parseFiltersFromUrl('namespace:"a"+oops+label:"b"')).toEqual([
      { property: "namespace", value: "a" },
      { property: "label", value: "b" },
    ]);
  });

  it("round-trips values with quotes, backslashes and +", () => {
    const filters = [
      { property: "label", value: 'say "hi"' },
      { property: "namespace", value: "C:\\dir" },
      { property: "pod", value: "a+b" },
    ];
    expect(parseFiltersFromUrl(parseFilters(filters))).toEqual(filters);
  });
});
