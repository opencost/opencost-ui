export type AllocationFilter = { property: string; value: string };

// Allocation drill-down levels, from the widest to the narrowest. Clicking a
// row at one level shows the next level, filtered by the clicked row.
const AGGREGATE_HIERARCHY = [
  "namespace",
  "controllerKind",
  "controller",
  "pod",
  "container",
];

// Filter property that each drill-down level adds.
const FILTER_HIERARCHY = [
  "namespace",
  "controllerKind",
  "controllerName",
  "pod",
  "container",
];

/**
 * Returns the leading filters that still apply to the given aggregation.
 *
 * A filter applies when it belongs to a drill-down level above `aggregateBy`
 * and the filters follow the hierarchy order. A drill-down does not have to
 * start at the namespace level: aggregating by controller kind and clicking
 * "deployment" yields `[controllerKind]` at the controller level, which is
 * kept. Filters from a level at or below `aggregateBy` (for example after
 * switching back from pod to namespace) and everything after them are dropped.
 */
export function applicableAllocationFilters(
  filters: AllocationFilter[],
  aggregateBy: string,
): AllocationFilter[] {
  const level = AGGREGATE_HIERARCHY.indexOf(aggregateBy);
  const allowed = level > 0 ? FILTER_HIERARCHY.slice(0, level) : [];

  let previous = -1;
  for (let i = 0; i < filters.length; i++) {
    const index = allowed.indexOf(filters[i].property);
    if (index <= previous) {
      return filters.slice(0, i);
    }
    previous = index;
  }
  return filters;
}
