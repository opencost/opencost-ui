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
});
