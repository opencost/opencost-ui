import type { InferenceCost, InferenceCostSet } from "~/services/inference-cost";

/** Builds an InferenceCost with every field zeroed unless overridden. */
export function ic(overrides: Partial<InferenceCost> = {}): InferenceCost {
  return {
    properties: { modelName: "", namespace: "", workloadType: "inference" },
    window: { start: "2026-10-14T00:00:00Z", end: "2026-10-21T00:00:00Z" },
    costBasis: "allocation",
    totalCost: 0,
    promptTokens: 0,
    generationTokens: 0,
    totalTokens: 0,
    costPerMillionTokens: 0,
    inputCost: 0,
    outputCost: 0,
    inputCostPerMillionTokens: 0,
    outputCostPerMillionTokens: 0,
    cacheSavingsFraction: 0,
    ...overrides,
  };
}

export function set(
  inferenceCosts: Record<string, InferenceCost>,
  start = "2026-10-14T00:00:00Z",
): InferenceCostSet {
  return { inferenceCosts, window: { start, end: "2026-10-21T00:00:00Z" } };
}
