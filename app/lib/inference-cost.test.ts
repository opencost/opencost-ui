import { describe, expect, it } from "vitest";
import {
  COST_PER_MILLION_METRIC_OPTIONS,
  GAUGE_STOPS,
  IDLE_SORT_OPTIONS,
  INFERENCE_ACCUMULATE_OPTIONS,
  INFERENCE_AGGREGATE_OPTIONS,
  INFERENCE_COST_BASIS_OPTIONS,
  INFERENCE_METRIC_OPTIONS,
  OTHER_KEY,
  SORT_DIRECTION_OPTIONS,
  buildCostPerMillionRows,
  buildIdleRanking,
  buildInferenceChartData,
  buildStepLabels,
  buildTrendTooltipHTML,
  gaugeColor,
  isAdditiveMetric,
} from "./inference-cost";
import type { InferenceCostSet, InferenceCostSetRange } from "~/services/inference-cost";
import { ic, set } from "~/test/inference-fixtures";

describe("option lists", () => {
  it("only offers model-level dimensions, no Kubernetes ones", () => {
    expect(INFERENCE_AGGREGATE_OPTIONS.map((o) => o.value)).toEqual([
      "model_name",
      "model_version",
      "workload_type",
    ]);
  });

  it("only offers accumulate steps the timeseries endpoint accepts", () => {
    expect(INFERENCE_ACCUMULATE_OPTIONS.map((o) => o.value)).toEqual(["hour", "day", "week", "month"]);
  });

  it("offers both cost bases and every metric", () => {
    expect(INFERENCE_COST_BASIS_OPTIONS.map((o) => o.value)).toEqual(["allocation", "usage"]);
    expect(INFERENCE_METRIC_OPTIONS.map((o) => o.value)).toEqual([
      "totalCost",
      "costPerMillionTokens",
      "totalTokens",
    ]);
    expect(COST_PER_MILLION_METRIC_OPTIONS.map((o) => o.value)).toEqual([
      "costPerMillionTokens",
      "inputCostPerMillionTokens",
      "outputCostPerMillionTokens",
    ]);
    expect(IDLE_SORT_OPTIONS.map((o) => o.value)).toEqual(["idleCost", "idleFraction"]);
    expect(SORT_DIRECTION_OPTIONS.map((o) => o.value)).toEqual(["desc", "asc"]);
  });
});

describe("isAdditiveMetric", () => {
  it("treats sums as additive and rates as not", () => {
    expect(isAdditiveMetric("totalCost")).toBe(true);
    expect(isAdditiveMetric("totalTokens")).toBe(true);
    expect(isAdditiveMetric("costPerMillionTokens")).toBe(false);
  });
});

describe("buildInferenceChartData", () => {
  // Daily values captured from the live /inferenceCost/timeseries API.
  const range: InferenceCostSetRange = {
    window: { start: "2026-10-19T00:00:00Z", end: "2026-10-21T00:00:00Z" },
    inferenceCostSets: [
      set(
        {
          g: ic({ totalCost: 82.14, totalTokens: 10, costPerMillionTokens: 0.3 }),
          q: ic({ totalCost: 78.74 }),
          o: ic({ totalCost: 44.34, totalTokens: 5, costPerMillionTokens: 2.2 }),
          n: ic({ totalCost: 13.52 }),
          x: ic({ totalCost: 7.71 }),
        },
        "2026-10-19T00:00:00Z",
      ),
      set(
        {
          g: ic({ totalCost: 291.72, totalTokens: 10, costPerMillionTokens: 0.28 }),
          q: ic({ totalCost: 274.94 }),
          o: ic({ totalCost: 138.66, totalTokens: 5, costPerMillionTokens: 2.3 }),
          n: ic({ totalCost: 41.52 }),
          x: ic({ totalCost: 24.11 }),
          y: ic({ totalCost: 0.1 }),
        },
        "2026-10-20T00:00:00Z",
      ),
    ],
  };

  it("keeps the top N by range total and folds the rest into other", () => {
    const pts = buildInferenceChartData(range, "totalCost", 3);
    expect([...new Set(pts.map((p) => p.key))]).toEqual(["g", "q", "o", OTHER_KEY]);
    expect([...new Set(pts.map((p) => p.group))]).toEqual(["10/19", "10/20"]);
    expect(pts.find((p) => p.group === "10/19" && p.key === OTHER_KEY)?.value).toBeCloseTo(13.52 + 7.71);
    expect(pts.find((p) => p.group === "10/20" && p.key === OTHER_KEY)?.value).toBeCloseTo(41.52 + 24.11 + 0.1);
  });

  it("preserves each step's total when stacking", () => {
    const pts = buildInferenceChartData(range, "totalCost", 2);
    range.inferenceCostSets.forEach((s, i) => {
      const raw = Object.values(s.inferenceCosts).reduce((a, c) => a + c.totalCost, 0);
      const group = ["10/19", "10/20"][i];
      const got = pts.filter((p) => p.group === group).reduce((a, p) => a + p.value, 0);
      expect(got).toBeCloseTo(raw);
    });
  });

  it("emits no other bucket when everything fits in top N", () => {
    const pts = buildInferenceChartData(range, "totalCost", 10);
    expect(pts.some((p) => p.key === OTHER_KEY)).toBe(false);
    expect(pts).toHaveLength(11);
  });

  it("ranks by tokens when charting tokens", () => {
    const pts = buildInferenceChartData(range, "totalTokens", 1);
    expect([...new Set(pts.map((p) => p.key))]).toEqual(["g", OTHER_KEY]);
    expect(pts.find((p) => p.key === OTHER_KEY && p.group === "10/19")?.value).toBe(5);
  });

  it("drops the remainder and zero values for non-additive rates", () => {
    const pts = buildInferenceChartData(range, "costPerMillionTokens", 3);
    expect(pts.some((p) => p.key === OTHER_KEY)).toBe(false);
    expect(pts.every((p) => p.value !== 0)).toBe(true);
    expect(pts.map((p) => p.key).sort()).toEqual(["g", "g", "o", "o"]);
  });

  it("ignores keys whose range total is zero and breaks ties by key", () => {
    const pts = buildInferenceChartData(
      {
        window: range.window,
        inferenceCostSets: [set({ b: ic({ totalCost: 1 }), a: ic({ totalCost: 1 }), z: ic() })],
      },
      "totalCost",
      1,
    );
    expect(pts.map((p) => p.key)).toEqual(["a", OTHER_KEY]);
  });

  it("labels hourly steps with the hour", () => {
    const pts = buildInferenceChartData(
      { window: range.window, inferenceCostSets: [set({ a: ic({ totalCost: 1 }) }, "2026-10-20T13:00:00Z")] },
      "totalCost",
      5,
      true,
    );
    expect(pts[0].group).toMatch(/10\/20.*13/);
  });

  it("labels steps with a missing or invalid start as ?", () => {
    const missing = { inferenceCosts: { a: ic({ totalCost: 1 }) } } as unknown as InferenceCostSet;
    const invalid = set({ a: ic({ totalCost: 2 }) }, "not-a-date");
    const pts = buildInferenceChartData(
      { window: range.window, inferenceCostSets: [missing, invalid] },
      "totalCost",
      5,
    );
    expect(pts.map((p) => p.group)).toEqual(["?", "?"]);
  });

  it("tolerates missing data", () => {
    expect(buildInferenceChartData(undefined, "totalCost", 5)).toEqual([]);
    expect(buildInferenceChartData({} as InferenceCostSetRange, "totalCost", 5)).toEqual([]);
    const noCosts = { window: { start: "2026-10-20T00:00:00Z" } } as unknown as InferenceCostSet;
    expect(buildInferenceChartData({ window: range.window, inferenceCostSets: [noCosts] }, "totalCost", 5)).toEqual([]);
    // A metric missing on an entry counts as 0.
    const sparse = { a: { totalCost: 3 } } as unknown as InferenceCostSet["inferenceCosts"];
    expect(buildInferenceChartData({ window: range.window, inferenceCostSets: [set(sparse)] }, "totalTokens", 5)).toEqual([]);
    const noCost = { a: { totalTokens: 3 } } as unknown as InferenceCostSet["inferenceCosts"];
    expect(buildInferenceChartData({ window: range.window, inferenceCostSets: [set(noCost)] }, "totalCost", 5)).toEqual([]);
  });
});

describe("buildStepLabels", () => {
  it("lists every step in order, including steps with no costs", () => {
    const range = {
      window: { start: "", end: "" },
      inferenceCostSets: [
        set({ a: ic({ totalCost: 1 }) }, "2026-10-19T00:00:00Z"),
        set({}, "2026-10-20T00:00:00Z"),
        set({ a: ic({ totalCost: 0 }) }, "2026-10-21T00:00:00Z"),
      ],
    } as InferenceCostSetRange;
    expect(buildStepLabels(range)).toEqual(["10/19", "10/20", "10/21"]);
    // Zero-valued steps produce no points, which is why the axis needs this list.
    expect(new Set(buildInferenceChartData(range, "totalCost", 5).map((p) => p.group))).toEqual(
      new Set(["10/19"]),
    );
  });

  it("labels hours and dedupes repeated labels", () => {
    const range = {
      window: { start: "", end: "" },
      inferenceCostSets: [
        set({}, "2026-10-19T13:00:00Z"),
        set({}, "2026-10-19T14:00:00Z"),
        set({}, "2026-10-19T14:00:00Z"),
      ],
    } as InferenceCostSetRange;
    expect(buildStepLabels(range, true)).toEqual(["10/19, 13", "10/19, 14"]);
  });

  it("handles a missing range", () => {
    expect(buildStepLabels(undefined)).toEqual([]);
  });
});

describe("buildIdleRanking", () => {
  // 7d values captured from the live /inferenceCost/total API.
  const allocation = set({
    "Qwen3-32B": ic({ totalCost: 350.79 }),
    "gpt-oss-120b": ic({ totalCost: 181.8, totalTokens: 79579203 }),
    Nemotron: ic({ totalCost: 54.69 }),
    "gemma-4-31B-it": ic({ totalCost: 371.14, totalTokens: 1280718113 }),
    "Qwen/Qwen3-32B": ic({ totalTokens: 1871596 }),
    "Qwen/Qwen3-0.6B": ic({ totalTokens: 2977956 }),
  });
  const usage = set({
    "Qwen3-32B": ic(),
    "gpt-oss-120b": ic({ totalCost: 125.63, totalTokens: 79579203 }),
    Nemotron: ic(),
    "gemma-4-31B-it": ic({ totalCost: 326.72, totalTokens: 1280718113 }),
  });

  it("ranks by idle + shared dollars and hides entries with no cost", () => {
    const { rows, hiddenNoCost } = buildIdleRanking(allocation, usage, "idleCost");
    expect(rows.map((r) => r.key)).toEqual(["Qwen3-32B", "gpt-oss-120b", "Nemotron", "gemma-4-31B-it"]);
    expect(hiddenNoCost).toBe(2);
    expect(rows[1]).toMatchObject({ allocationCost: 181.8, usageCost: 125.63, noTokens: false });
    expect(rows[1].idleCost).toBeCloseTo(56.17);
    expect(rows[1].idleFraction).toBeCloseTo(0.309, 3);
    expect(rows[3].idleFraction).toBeCloseTo(0.12, 2);
  });

  it("flags zero-token rows, which are 100% idle by definition", () => {
    const { rows } = buildIdleRanking(allocation, usage, "idleCost");
    const nemo = rows.find((r) => r.key === "Nemotron")!;
    expect(nemo).toMatchObject({ noTokens: true, idleFraction: 1, usageCost: 0, totalTokens: 0 });
  });

  it("ranks by idle share, breaking ties by idle dollars", () => {
    const { rows } = buildIdleRanking(allocation, usage, "idleFraction");
    expect(rows.map((r) => r.key)).toEqual(["Qwen3-32B", "Nemotron", "gpt-oss-120b", "gemma-4-31B-it"]);
  });

  it("breaks full ties by key", () => {
    const { rows } = buildIdleRanking(
      set({ b: ic({ totalCost: 5 }), a: ic({ totalCost: 5 }) }),
      undefined,
      "idleCost",
    );
    expect(rows.map((r) => r.key)).toEqual(["a", "b"]);
  });

  it("defaults to descending", () => {
    expect(buildIdleRanking(allocation, usage, "idleCost").rows).toEqual(
      buildIdleRanking(allocation, usage, "idleCost", "desc").rows,
    );
  });

  it("sorts ascending by idle dollars", () => {
    const { rows } = buildIdleRanking(allocation, usage, "idleCost", "asc");
    expect(rows.map((r) => r.key)).toEqual(["gemma-4-31B-it", "Nemotron", "gpt-oss-120b", "Qwen3-32B"]);
  });

  it("sorts ascending by idle share, breaking ties by smaller idle dollars", () => {
    const { rows } = buildIdleRanking(allocation, usage, "idleFraction", "asc");
    // Nemotron and Qwen3-32B are both 100%; Nemotron has fewer idle dollars.
    expect(rows.map((r) => r.key)).toEqual(["gemma-4-31B-it", "gpt-oss-120b", "Nemotron", "Qwen3-32B"]);
  });

  it("keeps the key tie-break alphabetical in either direction", () => {
    const tied = set({ b: ic({ totalCost: 5 }), a: ic({ totalCost: 5 }) });
    expect(buildIdleRanking(tied, undefined, "idleCost", "asc").rows.map((r) => r.key)).toEqual(["a", "b"]);
  });

  it("clamps usage above allocation to zero idle", () => {
    const { rows } = buildIdleRanking(
      set({ m: ic({ totalCost: 10, totalTokens: 5 }) }),
      set({ m: ic({ totalCost: 12, totalTokens: 5 }) }),
      "idleCost",
    );
    expect(rows[0]).toMatchObject({ usageCost: 10, idleCost: 0, idleFraction: 0 });
  });

  it("treats a missing usage entry as zero usage", () => {
    const { rows } = buildIdleRanking(set({ m: ic({ totalCost: 10, totalTokens: 5 }) }), set({}), "idleCost");
    expect(rows[0]).toMatchObject({ idleCost: 10, idleFraction: 1, noTokens: false });
  });

  it("tolerates missing data and missing fields", () => {
    expect(buildIdleRanking(undefined, undefined, "idleCost")).toEqual({ rows: [], hiddenNoCost: 0 });
    const sparse = set({ a: {} as never, b: { totalCost: 4 } as never });
    const { rows, hiddenNoCost } = buildIdleRanking(sparse, { inferenceCosts: { b: {} } } as never, "idleCost");
    expect(hiddenNoCost).toBe(1);
    expect(rows[0]).toMatchObject({ key: "b", usageCost: 0, totalTokens: 0, noTokens: true });
  });
});

describe("buildCostPerMillionRows", () => {
  const data = set({
    "gemma-4-31B-it": ic({
      totalCost: 371.14,
      totalTokens: 1280718113,
      costPerMillionTokens: 0.2898,
      inputCostPerMillionTokens: 0.1,
      outputCostPerMillionTokens: 2.1,
    }),
    "gpt-oss-120b": ic({
      totalCost: 181.8,
      totalTokens: 79579203,
      costPerMillionTokens: 2.2845,
      inputCostPerMillionTokens: 0.9,
      outputCostPerMillionTokens: 9.4,
    }),
    "Qwen3-32B": ic({ totalCost: 350.79 }),
    "Qwen/Qwen3-32B": ic({ totalTokens: 1871596 }),
  });

  it("sorts cheapest first, scales to the most expensive, and hides rateless rows", () => {
    const { rows, hidden } = buildCostPerMillionRows(data, "costPerMillionTokens");
    expect(rows.map((r) => r.key)).toEqual(["gemma-4-31B-it", "gpt-oss-120b"]);
    expect(hidden).toBe(2);
    expect(rows[1].fraction).toBe(1);
    expect(rows[0].fraction).toBeCloseTo(0.2898 / 2.2845);
    expect(rows[0]).toMatchObject({ totalCost: 371.14, totalTokens: 1280718113 });
  });

  it("uses the selected input or output rate", () => {
    expect(buildCostPerMillionRows(data, "inputCostPerMillionTokens").rows.map((r) => r.value)).toEqual([0.1, 0.9]);
    expect(buildCostPerMillionRows(data, "outputCostPerMillionTokens").rows.map((r) => r.value)).toEqual([2.1, 9.4]);
  });

  it("hides a row with a rate but no tokens", () => {
    const { rows, hidden } = buildCostPerMillionRows(
      set({
        a: ic({ totalCost: 1, costPerMillionTokens: 3 }),
        b: { totalCost: 1, costPerMillionTokens: 3 } as never, // totalTokens missing entirely
      }),
      "costPerMillionTokens",
    );
    expect(rows).toEqual([]);
    expect(hidden).toBe(2);
  });

  it("breaks ties by key and tolerates missing data", () => {
    const tie = buildCostPerMillionRows(
      set({
        b: ic({ totalCost: 1, totalTokens: 1, costPerMillionTokens: 5 }),
        a: ic({ totalCost: 1, totalTokens: 1, costPerMillionTokens: 5 }),
      }),
      "costPerMillionTokens",
    );
    expect(tie.rows.map((r) => r.key)).toEqual(["a", "b"]);
    expect(buildCostPerMillionRows(undefined, "costPerMillionTokens")).toEqual({ rows: [], hidden: 0 });
    const sparse = buildCostPerMillionRows(
      set({ a: { totalTokens: 2, costPerMillionTokens: 1 } as never, b: {} as never }),
      "costPerMillionTokens",
    );
    expect(sparse.rows[0]).toMatchObject({ key: "a", totalCost: 0, fraction: 1 });
    expect(sparse.hidden).toBe(1);
  });
});

describe("gaugeColor", () => {
  it("hits each stop exactly", () => {
    expect(gaugeColor(0)).toBe(GAUGE_STOPS[0]);
    expect(gaugeColor(1 / 3)).toBe(GAUGE_STOPS[1]);
    expect(gaugeColor(2 / 3)).toBe(GAUGE_STOPS[2]);
    expect(gaugeColor(1)).toBe(GAUGE_STOPS[3]);
  });

  it("interpolates between stops", () => {
    expect(gaugeColor(0.5, ["#000000", "#ffffff"])).toBe("#808080");
    expect(gaugeColor(0.25, ["#000000", "#ff0000", "#ffffff"])).toBe("#800000");
  });

  it("clamps out-of-range and non-finite input", () => {
    expect(gaugeColor(-1)).toBe(GAUGE_STOPS[0]);
    expect(gaugeColor(5)).toBe(GAUGE_STOPS[3]);
    expect(gaugeColor(Number.NaN)).toBe(GAUGE_STOPS[0]);
    expect(gaugeColor(Number.POSITIVE_INFINITY)).toBe(GAUGE_STOPS[0]);
  });
});

describe("buildTrendTooltipHTML", () => {
  const fmt = (v: number) => `$${v.toFixed(2)}`;
  const colors = { a: "#111111", b: "#222222" };

  it("shows the step, each model largest first with its colour, and a total", () => {
    const html = buildTrendTooltipHTML(
      [
        { group: "10/20", key: "a", value: 1 },
        { group: "10/20", key: "b", value: 36.01 },
      ],
      fmt,
      colors,
      true,
    )!;
    expect(html).toContain("10/20");
    expect(html.indexOf("b: $36.01")).toBeLessThan(html.indexOf("a: $1.00"));
    expect(html).toContain("#222222");
    expect(html).toContain("Total: $37.01");
    expect(html).not.toContain("x-value");
  });

  it("shows just the hovered value for a single point, with no total", () => {
    for (const data of [{ group: "10/20", key: "a", value: 2 }, [{ group: "10/20", key: "a", value: 2 }]]) {
      const html = buildTrendTooltipHTML(data, fmt, colors, true)!;
      expect(html).toContain("a: $2.00");
      expect(html).not.toContain("Total");
    }
  });

  it("omits the total for rates even with several points", () => {
    const html = buildTrendTooltipHTML(
      [
        { group: "10/20", key: "a", value: 1 },
        { group: "10/20", key: "b", value: 2 },
      ],
      fmt,
      colors,
      false,
    )!;
    expect(html).not.toContain("Total");
  });

  it("falls back to grey for unknown keys, 0 for bad values, and no header without a step", () => {
    const html = buildTrendTooltipHTML([{ key: "z", value: Number.NaN }], fmt, colors, true)!;
    expect(html).toContain("#8d8d8d");
    expect(html).toContain("z: $0.00");
    expect(html).not.toContain("font-size:0.75rem");
  });

  it("escapes names from the API", () => {
    const html = buildTrendTooltipHTML([{ group: "<b>", key: `<img src=x onerror="1">`, value: 1 }], fmt, {}, false)!;
    expect(html).not.toContain("<img");
    expect(html).not.toContain("<b>");
    expect(html).toContain("&#60;img");
  });

  it("returns null when there is nothing to show", () => {
    expect(buildTrendTooltipHTML([], fmt, colors, true)).toBeNull();
    expect(buildTrendTooltipHTML(null, fmt, colors, true)).toBeNull();
    expect(buildTrendTooltipHTML([{ value: 1 }], fmt, colors, true)).toBeNull();
  });
});
