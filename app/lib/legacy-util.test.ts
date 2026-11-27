import { describe, expect, it } from "vitest";
import { formatSampleItemsForGraph } from "./legacy-util";

// One cloud cost item whose cost metrics all differ, so the test can tell
// which metric each part of the output was built from.
function sampleData() {
  const item = {
    properties: { providerID: "i-123", labels: { name: "web" } },
    netCost: { cost: 10, kubernetesPercent: 0.5 },
    amortizedNetCost: { cost: 20, kubernetesPercent: 0.5 },
    listCost: { cost: 30, kubernetesPercent: 0.5 },
    invoicedCost: { cost: 40, kubernetesPercent: 0.5 },
  };
  return {
    sets: [
      {
        window: { start: "2026-11-01T00:00:00Z", end: "2026-11-02T00:00:00Z" },
        cloudCosts: { "i-123": item },
      },
    ],
  };
}

describe("formatSampleItemsForGraph", () => {
  it.each([
    ["AmortizedNetCost", 20],
    ["NetCost", 10],
    ["ListCost", 30],
    ["InvoicedCost", 40],
  ])("charts and tabulates the selected %s metric", (costMetric, expected) => {
    const { graphData, tableRows, tableTotal } = formatSampleItemsForGraph({
      data: sampleData(),
      costMetric,
    });

    expect(graphData[0].items).toEqual([{ name: "i-123", value: expected }]);
    expect(tableRows[0].cost).toBe(expected);
    expect(tableTotal.cost).toBe(expected);
  });

  it("uses amortized net cost when no metric is given", () => {
    const { graphData, tableRows } = formatSampleItemsForGraph({
      data: sampleData(),
    });

    expect(graphData[0].items[0].value).toBe(20);
    expect(tableRows[0].cost).toBe(20);
  });
});
