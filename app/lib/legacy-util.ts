import { forEach, get, round } from "lodash";

// rangeToCumulative takes an AllocationSetRange (array of AllocationSet)
// and accumulates the values into a single AllocationSet (object).
export function rangeToCumulative(allocationSetRange: any[], aggregateBy: string) {
  if (!allocationSetRange || allocationSetRange.length === 0) {
    return null;
  }

  const result: Record<string, any> = {};

  forEach(allocationSetRange, (allocSet) => {
    forEach(allocSet, (alloc) => {
      if (result[alloc.name] === undefined) {
        const hrs = get(alloc, "minutes", 0) / 60.0;
        result[alloc.name] = {
          name: alloc.name,
          [aggregateBy]: alloc.name,
          cpuCost: get(alloc, "cpuCost", 0),
          gpuCost: get(alloc, "gpuCost", 0),
          ramCost: get(alloc, "ramCost", 0),
          pvCost: get(alloc, "pvCost", 0),
          networkCost: get(alloc, "networkCost", 0),
          sharedCost: get(alloc, "sharedCost", 0),
          externalCost: get(alloc, "externalCost", 0),
          totalCost: get(alloc, "totalCost", 0),
          cpuUseCoreHrs: get(alloc, "cpuCoreUsageAverage", 0) * hrs,
          cpuReqCoreHrs: get(alloc, "cpuCoreRequestAverage", 0) * hrs,
          ramUseByteHrs: get(alloc, "ramByteUsageAverage", 0) * hrs,
          ramReqByteHrs: get(alloc, "ramByteRequestAverage", 0) * hrs,
          cpuEfficiency: get(alloc, "cpuEfficiency", 0),
          ramEfficiency: get(alloc, "ramEfficiency", 0),
          totalEfficiency: get(alloc, "totalEfficiency", 0),
        };
      } else {
        const hrs = get(alloc, "minutes", 0) / 60.0;
        result[alloc.name].cpuCost += get(alloc, "cpuCost", 0);
        result[alloc.name].gpuCost += get(alloc, "gpuCost", 0);
        result[alloc.name].ramCost += get(alloc, "ramCost", 0);
        result[alloc.name].pvCost += get(alloc, "pvCost", 0);
        result[alloc.name].networkCost += get(alloc, "networkCost", 0);
        result[alloc.name].sharedCost += get(alloc, "sharedCost", 0);
        result[alloc.name].externalCost += get(alloc, "externalCost", 0);
        result[alloc.name].totalCost += get(alloc, "totalCost", 0);
        result[alloc.name].cpuUseCoreHrs += get(alloc, "cpuCoreUsageAverage", 0) * hrs;
        result[alloc.name].cpuReqCoreHrs += get(alloc, "cpuCoreRequestAverage", 0) * hrs;
        result[alloc.name].ramUseByteHrs += get(alloc, "ramByteUsageAverage", 0) * hrs;
        result[alloc.name].ramReqByteHrs += get(alloc, "ramByteRequestAverage", 0) * hrs;
      }
    });
  });

  if (allocationSetRange.length > 1) {
    forEach(result, (alloc, name) => {
      let cpuEfficiency = 0.0;
      if (alloc.cpuReqCoreHrs > 0) cpuEfficiency = alloc.cpuUseCoreHrs / alloc.cpuReqCoreHrs;
      else if (alloc.cpuUseCoreHrs > 0) cpuEfficiency = 1.0;

      let ramEfficiency = 0.0;
      if (alloc.ramReqByteHrs > 0) ramEfficiency = alloc.ramUseByteHrs / alloc.ramReqByteHrs;
      else if (alloc.ramUseByteHrs > 0) ramEfficiency = 1.0;

      let totalEfficiency = 0.0;
      if (alloc.cpuCost + alloc.ramCost > 0.0) {
        totalEfficiency =
          (alloc.cpuCost * cpuEfficiency + alloc.ramCost * ramEfficiency) /
          (alloc.cpuCost + alloc.ramCost);
      }
      result[name].cpuEfficiency = cpuEfficiency;
      result[name].ramEfficiency = ramEfficiency;
      result[name].totalEfficiency = totalEfficiency;
    });
  }

  return result;
}

export function cumulativeToTotals(allocationSet: Record<string, any>) {
  const totals: Record<string, any> = {
    name: "Totals",
    cpuCost: 0,
    gpuCost: 0,
    ramCost: 0,
    pvCost: 0,
    networkCost: 0,
    sharedCost: 0,
    externalCost: 0,
    totalCost: 0,
    cpuEfficiency: 0,
    ramEfficiency: 0,
    totalEfficiency: 0,
  };

  let cpuReqCoreHrs = 0, cpuUseCoreHrs = 0, ramReqByteHrs = 0, ramUseByteHrs = 0, cpuCost = 0, ramCost = 0;

  forEach(allocationSet, (alloc, name) => {
    if (name !== "__idle__") {
      cpuReqCoreHrs += get(alloc, "cpuReqCoreHrs", 0.0);
      cpuUseCoreHrs += get(alloc, "cpuUseCoreHrs", 0.0);
      ramReqByteHrs += get(alloc, "ramReqByteHrs", 0.0);
      ramUseByteHrs += get(alloc, "ramUseByteHrs", 0.0);
      cpuCost += get(alloc, "cpuCost", 0.0);
      ramCost += get(alloc, "ramCost", 0.0);
    }
    totals.cpuCost += get(alloc, "cpuCost", 0);
    totals.gpuCost += get(alloc, "gpuCost", 0);
    totals.ramCost += get(alloc, "ramCost", 0);
    totals.pvCost += get(alloc, "pvCost", 0);
    totals.networkCost += get(alloc, "networkCost", 0);
    totals.sharedCost += get(alloc, "sharedCost", 0);
    totals.externalCost += get(alloc, "externalCost", 0);
    totals.totalCost += get(alloc, "totalCost", 0);
  });

  if (cpuReqCoreHrs > 0) totals.cpuEfficiency = cpuUseCoreHrs / cpuReqCoreHrs;
  else if (cpuUseCoreHrs > 0) totals.cpuEfficiency = 1.0;

  if (ramReqByteHrs > 0) totals.ramEfficiency = ramUseByteHrs / ramReqByteHrs;
  else if (ramUseByteHrs > 0) totals.ramEfficiency = 1.0;

  if (cpuCost + ramCost > 0) {
    totals.totalEfficiency =
      (cpuCost * totals.cpuEfficiency + ramCost * totals.ramEfficiency) / (cpuCost + ramCost);
  }

  totals.cpuReqCoreHrs = cpuReqCoreHrs;
  totals.cpuUseCoreHrs = cpuUseCoreHrs;
  totals.ramReqByteHrs = ramReqByteHrs;
  totals.ramUseByteHrs = ramUseByteHrs;

  return totals;
}

export function toVerboseTimeRange(window: string): string | null {
  const months = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December",
  ];

  const start = new Date();
  start.setUTCHours(0, 0, 0, 0);
  const end = new Date();
  end.setUTCHours(0, 0, 0, 0);

  switch (window) {
    case "today":
      return `${start.getUTCDate()} ${months[start.getUTCMonth()]} ${start.getUTCFullYear()}`;
    case "yesterday":
      start.setUTCDate(start.getUTCDate() - 1);
      return `${start.getUTCDate()} ${months[start.getUTCMonth()]} ${start.getUTCFullYear()}`;
    case "week":
      start.setUTCDate(start.getUTCDate() - start.getUTCDay());
      return `${start.getUTCDate()} ${months[start.getUTCMonth()]} ${start.getUTCFullYear()} until now`;
    case "month":
      start.setUTCDate(1);
      return `${start.getUTCDate()} ${months[start.getUTCMonth()]} ${start.getUTCFullYear()} until now`;
    case "lastweek":
      start.setUTCDate(start.getUTCDate() - (start.getUTCDay() + 7));
      end.setUTCDate(end.getUTCDate() - (end.getUTCDay() + 1));
      return `${start.getUTCDate()} ${months[start.getUTCMonth()]} ${start.getUTCFullYear()} through ${end.getUTCDate()} ${months[end.getUTCMonth()]} ${end.getUTCFullYear()}`;
    case "lastmonth":
      end.setUTCDate(1);
      end.setUTCDate(end.getUTCDate() - 1);
      start.setUTCDate(1);
      start.setUTCDate(start.getUTCDate() - 1);
      start.setUTCDate(1);
      return `${start.getUTCDate()} ${months[start.getUTCMonth()]} ${start.getUTCFullYear()} through ${end.getUTCDate()} ${months[end.getUTCMonth()]} ${end.getUTCFullYear()}`;
    case "6d":
      start.setUTCDate(start.getUTCDate() - 6);
      return `${start.getUTCDate()} ${months[start.getUTCMonth()]} ${start.getUTCFullYear()} through now`;
    case "29d":
      start.setUTCDate(start.getUTCDate() - 29);
      return `${start.getUTCDate()} ${months[start.getUTCMonth()]} ${start.getUTCFullYear()} through now`;
    case "59d":
      start.setUTCDate(start.getUTCDate() - 59);
      return `${start.getUTCDate()} ${months[start.getUTCMonth()]} ${start.getUTCFullYear()} through now`;
    case "89d":
      start.setUTCDate(start.getUTCDate() - 89);
      return `${start.getUTCDate()} ${months[start.getUTCMonth()]} ${start.getUTCFullYear()} through now`;
  }

  const splitDates = window.split(",");
  if (checkCustomWindow(window) && splitDates.length > 1) {
    const s = splitDates[0].split(/\D+/).slice(0, 3);
    const e = splitDates[1].split(/\D+/).slice(0, 3);
    if (s.length === 3 && e.length === 3) {
      start.setUTCFullYear(Number(s[0]), Number(s[1]) - 1, Number(s[2]));
      end.setUTCFullYear(Number(e[0]), Number(e[1]) - 1, Number(e[2]));
      if (start.getTime() === end.getTime()) {
        return `${start.getUTCDate()} ${months[start.getUTCMonth()]} ${start.getUTCFullYear()}`;
      }
      return `${start.getUTCDate()} ${months[start.getUTCMonth()]} ${start.getUTCFullYear()} through ${end.getUTCDate()} ${months[end.getUTCMonth()]} ${end.getUTCFullYear()}`;
    }
  }
  return null;
}

export function bytesToString(bytes: number): string {
  const units = [
    [Math.pow(1024, 6), "EiB"],
    [Math.pow(1024, 5), "PiB"],
    [Math.pow(1024, 4), "TiB"],
    [Math.pow(1024, 3), "GiB"],
    [Math.pow(1024, 2), "MiB"],
    [Math.pow(1024, 1), "KiB"],
  ] as [number, string][];
  for (const [size, label] of units) {
    if (bytes >= size) return `${round(bytes / size, 1)} ${label}`;
  }
  return `${round(bytes, 1)} B`;
}

const currencyLocale = "en-US";

export function toCurrency(amount: number, currency = "USD", precision?: number): string {
  if (typeof amount !== "number") {
    console.warn(`Tried to convert "${amount}" to currency, but it is not a number`);
    return "";
  }
  if (!currency) currency = "USD";
  const opts: Intl.NumberFormatOptions = { style: "currency", currency };
  if (typeof precision === "number") {
    opts.minimumFractionDigits = precision;
    opts.maximumFractionDigits = precision;
  }
  return amount.toLocaleString(currencyLocale, opts);
}

export function checkCustomWindow(window: string): boolean {
  const customDateRegex = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z,\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z/;
  return customDateRegex.test(window);
}

export function parseFilters(filters: { property: string; value: string }[] | string): string {
  if (typeof filters === "string") return filters;
  return (
    [...new Set(filters.map((f) => {
      const escapedValue = String(f.value).replace(/"/g, '\\"');
      return `${f.property}:"${escapedValue}"`;
    }))].join("+") || ""
  );
}

export function parseFiltersFromUrl(filterString: string): { property: string; value: string }[] {
  if (!filterString || typeof filterString !== "string") return [];
  const filters: { property: string; value: string }[] = [];
  const parts = filterString.split("+");
  for (const part of parts) {
    const match = part.match(/^([^:]+):"((?:[^"\\]|\\.)*)"$/);
    if (match) {
      filters.push({ property: match[1].trim(), value: match[2].replace(/\\"/g, '"') });
    }
  }
  return filters;
}

export function formatSampleItemsForGraph({ data, costMetric }: { data: any; costMetric?: string }) {
  const costMetricPropName = costMetric
    ? (costMetricToPropName as Record<string, string>)[costMetric] ?? "amortizedNetCost"
    : "amortizedNetCost";
  const graphData = data.sets.map(({ cloudCosts, window: { end, start } }: any) => ({
    end,
    items: Object.entries(cloudCosts).map(([name, item]: [string, any]) => ({
      name,
      value: item.netCost.cost,
    })),
    start,
  }));

  const accumulator: Record<string, any> = {};
  data.sets.forEach(({ cloudCosts, window }: any) => {
    Object.entries(cloudCosts).forEach(([name, cloudCostItem]: [string, any]) => {
      const { properties } = cloudCostItem;
      accumulator[name] ||= { cost: 0, start: "", end: "", providerID: "", labelName: "", kubernetesCost: 0, kubernetesPercent: 0 };
      accumulator[name].cost += cloudCostItem[costMetricPropName].cost;
      accumulator[name].kubernetesCost += cloudCostItem[costMetricPropName].cost * cloudCostItem[costMetricPropName].kubernetesPercent;
      accumulator[name].start = window.start;
      accumulator[name].end = window.end;
      accumulator[name].providerID = properties.providerID;
      accumulator[name].labelName = properties.labels?.name;
      accumulator[name].kubernetesPercent = cloudCostItem[costMetricPropName].kubernetesPercent;
    });
  });

  const tableRows = Object.entries(accumulator)
    .map(([name, { cost, start, end, providerID, kubernetesCost, kubernetesPercent, labelName }]) => ({
      cost, name, kubernetesCost, kubernetesPercent, start, end, providerID, labelName,
    }))
    .sort((a, b) => (a.cost > b.cost ? -1 : 1));

  const tableTotal = tableRows.reduce(
    (tr1: any, tr2: any) => ({ ...tr1, cost: tr1.cost + tr2.cost, kubernetesCost: tr1.kubernetesCost + tr2.kubernetesCost }),
    { cost: 0, name: "", kubernetesCost: 0, kubernetesPercent: 0, end: "", start: "", labelName: "", providerID: "" },
  );

  return { graphData, tableRows, tableTotal };
}

// Needed by cloudCost/tokens via formatSampleItemsForGraph
const costMetricToPropName: Record<string, string> = {
  AmortizedNetCost: "amortizedNetCost",
  NetCost: "netCost",
  ListCost: "listCost",
  InvoicedCost: "invoicedCost",
};
