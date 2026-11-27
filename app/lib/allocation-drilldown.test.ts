import { describe, expect, it } from "vitest";
import { applicableAllocationFilters } from "./allocation-drilldown";

const ns = { property: "namespace", value: "shop" };
const kind = { property: "controllerKind", value: "deployment" };
const ctrl = { property: "controllerName", value: "web" };
const pod = { property: "pod", value: "web-1" };

describe("applicableAllocationFilters", () => {
  it("keeps a full drill-down that starts at the namespace level", () => {
    expect(applicableAllocationFilters([ns], "controllerKind")).toEqual([ns]);
    expect(applicableAllocationFilters([ns, kind], "controller")).toEqual([
      ns,
      kind,
    ]);
    expect(applicableAllocationFilters([ns, kind, ctrl], "pod")).toEqual([
      ns,
      kind,
      ctrl,
    ]);
    expect(
      applicableAllocationFilters([ns, kind, ctrl, pod], "container"),
    ).toEqual([ns, kind, ctrl, pod]);
  });

  it("keeps a drill-down that starts below the namespace level", () => {
    // Aggregate by controller kind, click "deployment".
    expect(applicableAllocationFilters([kind], "controller")).toEqual([kind]);
    // Aggregate by controller, click "deployment:web".
    expect(applicableAllocationFilters([kind, ctrl], "pod")).toEqual([
      kind,
      ctrl,
    ]);
    // Aggregate by pod, click "web-1".
    expect(applicableAllocationFilters([pod], "container")).toEqual([pod]);
  });

  it("drops filters for the current level and below when going back up", () => {
    expect(applicableAllocationFilters([ns, kind, ctrl], "controller")).toEqual(
      [ns, kind],
    );
    expect(applicableAllocationFilters([ns, kind], "controllerKind")).toEqual([
      ns,
    ]);
    expect(applicableAllocationFilters([ns, kind, ctrl], "namespace")).toEqual(
      [],
    );
  });

  it("drops everything from the first filter that is out of order", () => {
    expect(applicableAllocationFilters([kind, ns], "pod")).toEqual([kind]);
    expect(applicableAllocationFilters([ns, ns], "pod")).toEqual([ns]);
    expect(
      applicableAllocationFilters(
        [{ property: "cluster", value: "a" }, ns],
        "pod",
      ),
    ).toEqual([]);
  });

  it("drops all filters for aggregations outside the drill-down", () => {
    expect(applicableAllocationFilters([ns], "cluster")).toEqual([]);
    expect(applicableAllocationFilters([ns], "deployment")).toEqual([]);
  });

  it("returns an empty list when there are no filters", () => {
    expect(applicableAllocationFilters([], "pod")).toEqual([]);
  });
});
