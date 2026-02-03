/**
 * Tests for assetCalculations utility functions
 */

import {
  bytesToGB,
  getTotalCost,
  calculateEfficiencyScore,
  getAssetStatus,
  formatCurrency,
} from "../assetCalculations";

describe("assetCalculations", () => {
  describe("bytesToGB", () => {
    it("converts bytes to GB", () => {
      expect(bytesToGB(1073741824)).toBe("1.00");
      expect(bytesToGB(5368709120)).toBe("5.00");
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
        { breakdown: { idle: 0.2 } }, // 80% efficient
        { breakdown: { idle: 0.4 } }, // 60% efficient
      ];
      expect(calculateEfficiencyScore(assets)).toBe(70);
    });
  });

  describe("getAssetStatus", () => {
    it("returns correct status based on idle percentage", () => {
      expect(getAssetStatus(0.85).label).toBe("WASTE");
      expect(getAssetStatus(0.5).label).toBe("REVIEW");
      expect(getAssetStatus(0.2).label).toBe("OK");
    });
  });

  describe("formatCurrency", () => {
    it("formats numbers as USD currency", () => {
      expect(formatCurrency(100)).toBe("$100.00");
      expect(formatCurrency(1234.56)).toBe("$1,234.56");
    });
  });
});
