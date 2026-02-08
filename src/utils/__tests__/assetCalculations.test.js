import {
  bytesToGB,
  getTotalCost,
  calculateEfficiencyScore,
  getAssetStatus,
  formatCurrency,
  buildColorScale,
  CHART_PALETTE,
  CHART_PALETTE_LIGHT,
  CHART_PALETTE_DARK,
} from "../assetCalculations";

describe("assetCalculations", () => {
  describe("bytesToGB", () => {
    it("converts bytes to GB", () => {
      expect(bytesToGB(1073741824)).toBe(1);
      expect(bytesToGB(5368709120)).toBe(5);
    });

    it("returns 0 for falsy input", () => {
      expect(bytesToGB(0)).toBe(0);
      expect(bytesToGB(null)).toBe(0);
    });
  });

  describe("getTotalCost", () => {
    it("calculates total cost from assets", () => {
      const assets = [
        { totalCost: 10.5 },
        { totalCost: 20.3 },
        { totalCost: 5.2 },
      ];
      expect(getTotalCost(assets)).toBe(36);
    });

    it("returns 0 for empty array", () => {
      expect(getTotalCost([])).toBe(0);
    });
  });

  describe("calculateEfficiencyScore", () => {
    it("calculates average efficiency from idle percentages", () => {
      const assets = [
        { breakdown: { idle: 0.2 } },
        { breakdown: { idle: 0.4 } },
      ];
      expect(calculateEfficiencyScore(assets)).toBe(70);
    });

    it("returns 100 for empty array", () => {
      expect(calculateEfficiencyScore([])).toBe(100);
    });
  });

  describe("getAssetStatus", () => {
    it("returns WASTE for high idle assets", () => {
      expect(getAssetStatus({ breakdown: { idle: 0.85 } }).label).toBe("WASTE");
    });

    it("returns REVIEW for medium idle assets", () => {
      expect(getAssetStatus({ breakdown: { idle: 0.5 } }).label).toBe("REVIEW");
    });

    it("returns OK for low idle assets", () => {
      expect(getAssetStatus({ breakdown: { idle: 0.2 } }).label).toBe("OK");
    });
  });

  describe("formatCurrency", () => {
    it("formats numbers as USD currency", () => {
      expect(formatCurrency(100)).toBe("$100.00");
      expect(formatCurrency(1234.56)).toBe("$1,234.56");
    });

    it("formats zero", () => {
      expect(formatCurrency(0)).toBe("$0.00");
    });
  });

  describe("buildColorScale", () => {
    it("assigns colors from light palette by default", () => {
      const scale = buildColorScale(["A", "B", "C"]);
      expect(scale["A"]).toBe(CHART_PALETTE_LIGHT[0]);
      expect(scale["B"]).toBe(CHART_PALETTE_LIGHT[1]);
      expect(scale["C"]).toBe(CHART_PALETTE_LIGHT[2]);
    });

    it("assigns colors from dark palette when isDark is true", () => {
      const scale = buildColorScale(["A", "B"], true);
      expect(scale["A"]).toBe(CHART_PALETTE_DARK[0]);
      expect(scale["B"]).toBe(CHART_PALETTE_DARK[1]);
    });

    it("wraps around palette for more groups than colors", () => {
      const groups = Array.from({ length: 16 }, (_, i) => `g${i}`);
      const scale = buildColorScale(groups);
      expect(scale["g14"]).toBe(CHART_PALETTE_LIGHT[0]);
      expect(scale["g15"]).toBe(CHART_PALETTE_LIGHT[1]);
    });

    it("deduplicates groups", () => {
      const scale = buildColorScale(["A", "B", "A", "B"]);
      expect(Object.keys(scale).length).toBe(2);
    });

    it("CHART_PALETTE alias equals CHART_PALETTE_LIGHT", () => {
      expect(CHART_PALETTE).toBe(CHART_PALETTE_LIGHT);
    });

    it("light palette has no duplicate colors", () => {
      expect(new Set(CHART_PALETTE_LIGHT).size).toBe(CHART_PALETTE_LIGHT.length);
    });

    it("dark palette has no duplicate colors", () => {
      expect(new Set(CHART_PALETTE_DARK).size).toBe(CHART_PALETTE_DARK.length);
    });

    it("light palette leads with Magenta 50", () => {
      expect(CHART_PALETTE_LIGHT[0]).toBe("#ee538b");
    });

    it("dark palette leads with Magenta 60", () => {
      expect(CHART_PALETTE_DARK[0]).toBe("#d12771");
    });
  });
});
