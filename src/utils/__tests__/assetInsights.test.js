/**
 * Tests for assetInsights utility
 */

import { generateInsights } from "../assetInsights";

describe("generateInsights", () => {
  it("generates insights for unused PVCs", () => {
    const assets = [
      {
        id: "pvc-1",
        assetType: "PVC",
        totalCost: 50,
        breakdown: { idle: 1.0 },
      },
    ];

    const insights = generateInsights(assets);
    expect(insights.length).toBeGreaterThan(0);

    const unusedInsight = insights.find((i) => i.title.includes("Unused"));
    expect(unusedInsight).toBeDefined();
    expect(unusedInsight.savings).toBe(50);
  });

  it("generates insights for high idle nodes", () => {
    const assets = [
      {
        id: "node-1",
        assetType: "Node",
        local: 1,
        totalCost: 100,
        breakdown: { idle: 0.8 },
      },
    ];

    const insights = generateInsights(assets);
    expect(insights.length).toBeGreaterThan(0);
  });

  it("returns empty array for optimized assets", () => {
    const assets = [
      {
        id: "asset-1",
        assetType: "PVC",
        totalCost: 50,
        breakdown: { idle: 0.1 },
      },
    ];

    const insights = generateInsights(assets);
    expect(insights).toHaveLength(0);
  });

  it("includes required fields in insights", () => {
    const assets = [
      {
        id: "pvc-1",
        assetType: "PVC",
        totalCost: 50,
        breakdown: { idle: 1.0 },
      },
    ];

    const insights = generateInsights(assets);
    const insight = insights[0];

    expect(insight).toHaveProperty("id");
    expect(insight).toHaveProperty("title");
    expect(insight).toHaveProperty("savings");
    expect(insight).toHaveProperty("severity");
  });
});
