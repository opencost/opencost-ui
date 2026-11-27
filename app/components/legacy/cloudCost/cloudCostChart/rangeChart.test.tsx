import { describe, expect, it } from "vitest";
import { getDataForCloudDay } from "./rangeChart";

const day = (items: { name: string; value: number }[]) => ({
  start: "2026-11-01T00:00:00Z",
  end: "2026-11-02T00:00:00Z",
  items,
});

// Eight items that always make the top 8, plus `n` smaller leftovers.
const withLeftovers = (leftovers: number[]) => [
  ...Array.from({ length: 8 }, (_, i) => ({ name: `top${i}`, value: 100 + i })),
  ...leftovers.map((value, i) => ({ name: `small${i}`, value })),
];

const otherOf = (graph: { name: string; value: unknown }[]) =>
  graph.find((item) => item.name === "other");

describe("getDataForCloudDay", () => {
  it.each([
    [[5], 5],
    [[5, 4], 9],
    [[5, 4, 3], 12],
    [[5, 4, 3, 2, 1], 15],
  ])("sums leftovers %j into a new other item", (leftovers, expected) => {
    const { graph } = getDataForCloudDay(day(withLeftovers(leftovers)));

    expect(otherOf(graph)?.value).toBe(expected);
    expect(graph).toHaveLength(9);
  });

  it.each([
    [[5], 15],
    [[5, 4, 3], 22],
  ])("adds leftovers %j to an existing other item", (leftovers, expected) => {
    const items = [...withLeftovers(leftovers), { name: "others", value: 10 }];
    const { graph } = getDataForCloudDay(day(items));

    expect(otherOf(graph)?.value).toBe(expected);
  });

  it("keeps the total cost unchanged after grouping", () => {
    const items = [
      ...withLeftovers([5, 4, 3]),
      { name: "__idle__", value: 7 },
      { name: "others", value: 10 },
    ];
    const total = items.reduce((sum, item) => sum + item.value, 0);
    const { graph } = getDataForCloudDay(day(items));

    expect(graph.reduce((sum, item) => sum + item.value, 0)).toBe(total);
  });

  it("does not add an other item when every item fits in the top 8", () => {
    const { graph } = getDataForCloudDay(day(withLeftovers([])));

    expect(otherOf(graph)).toBeUndefined();
    expect(graph).toHaveLength(8);
  });
});
