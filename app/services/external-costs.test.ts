import { beforeEach, describe, expect, it, vi } from "vitest";
import ExternalCostsService from "./external-costs";

const get = vi.hoisted(() => vi.fn());
vi.mock("./api-client", () => ({ default: { get } }));

beforeEach(() => {
  get.mockReset();
  get.mockResolvedValue({ data: { data: {} } });
});

function filterParam(): string {
  return get.mock.calls[0][1].params.filter;
}

describe("ExternalCostsService filters", () => {
  it.each([
    ["fetchExternalGraphCosts", "/customCost/timeseries"],
    ["fetchExternalTableCosts", "/customCost/total"],
  ] as const)(
    "%s ignores filter rules without a value",
    async (method, endpoint) => {
      // The report builder adds a new filter rule with an empty value.
      await ExternalCostsService[method](
        "7d",
        "domain",
        [
          { property: "zone", value: "us-east-1" },
          { property: "domain", value: "" },
          { property: "accountName", value: "   " },
        ],
        "blended",
        "cost",
        "desc",
      );

      expect(get).toHaveBeenCalledWith(endpoint, expect.anything());
      expect(filterParam()).toBe('zone:"us-east-1"');
    },
  );

  it("sends no filter when every rule is empty", async () => {
    await ExternalCostsService.fetchExternalTableCosts(
      "7d",
      "domain",
      [{ property: "domain", value: "" }],
      "blended",
      "cost",
      "desc",
    );

    expect(filterParam()).toBe("");
  });

  it("escapes double quotes in filter values", async () => {
    await ExternalCostsService.fetchExternalTableCosts(
      "7d",
      "domain",
      [{ property: "resourceName", value: 'my "db"' }],
      "blended",
      "cost",
      "desc",
    );

    expect(filterParam()).toBe('resourceName:"my \\"db\\""');
  });

  it("joins several rules with + and drops duplicates", async () => {
    await ExternalCostsService.fetchExternalGraphCosts(
      "7d",
      "domain",
      [
        { property: "zone", value: "a" },
        { property: "zone", value: "a" },
        { property: "domain", value: "b" },
      ],
      "blended",
      "cost",
      "desc",
    );

    expect(filterParam()).toBe('zone:"a"+domain:"b"');
  });
});
