import { afterEach, describe, expect, it, vi } from "vitest";
import {
  buildShareUrl,
  decodeSharePayload,
  encodeSharePayload,
} from "./share-encoding";

describe("buildShareUrl", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("links to the page at the root when no basename is set", () => {
    vi.stubEnv("BASE_URL", "/");
    expect(buildShareUrl("reports", "abc")).toBe(
      `${window.location.origin}/reports?share=abc`,
    );
  });

  it("keeps the basename the UI is served under", () => {
    vi.stubEnv("BASE_URL", "/opencost/");
    expect(buildShareUrl("dashboards", "abc")).toBe(
      `${window.location.origin}/opencost/dashboards?share=abc`,
    );
  });

  it("carries a payload that decodes back to the original", () => {
    vi.stubEnv("BASE_URL", "/opencost/");
    const payload = { name: "Team cost ✓", tags: ["a+b", "c/d"] };
    const url = new URL(buildShareUrl("reports", encodeSharePayload(payload)));
    expect(url.pathname).toBe("/opencost/reports");
    expect(decodeSharePayload(url.searchParams.get("share") ?? "")).toEqual(
      payload,
    );
  });
});
