import client from "~/services/api-client";
import { parseFilters } from "~/lib/legacy-util";
import type { ReportFilterRule, ReportLayer } from "~/types/report";

const ENDPOINTS: Partial<Record<ReportLayer, string>> = {
  allocation: "/allocation/autocomplete",
  cloudCost: "/cloudCost/autocomplete",
  infraAssets: "/assets/autocomplete",
};

const ALIASES: Partial<Record<ReportLayer, Record<string, string>>> = {
  allocation: {
    controller: "controllerName",
    deployment: "controllerKind",
    statefulset: "controllerKind",
    daemonset: "controllerKind",
    job: "controllerKind",
  },
  infraAssets: {
    assetType: "type",
  },
};

const ALLOWED: Partial<Record<ReportLayer, Set<string>>> = {
  allocation: new Set([
    "cluster",
    "namespace",
    "node",
    "controllerKind",
    "controllerName",
    "pod",
    "container",
  ]),
  cloudCost: new Set([
    "accountID",
    "invoiceEntityID",
    "provider",
    "service",
    "category",
  ]),
  infraAssets: new Set([
    "type",
    "account",
    "cluster",
    "category",
    "provider",
    "providerID",
  ]),
};

function resolveField(layer: ReportLayer, property: string): string | null {
  if (!(layer in ENDPOINTS)) return null;

  if (property.startsWith("label:") || property.startsWith("namespacelabel:")) {
    return property;
  }

  const apiField = ALIASES[layer]?.[property] ?? property;
  return ALLOWED[layer]?.has(apiField) ? apiField : null;
}

export function supportsReportFilterAutocomplete(
  layer: ReportLayer,
  property: string,
): boolean {
  return resolveField(layer, property) !== null;
}

function parseSuggestionList(body: unknown): string[] {
  const payload =
    body && typeof body === "object" && "data" in body
      ? (body as { data: unknown }).data
      : body;
  const list = Array.isArray(payload)
    ? payload
    : payload && typeof payload === "object" && "data" in payload
      ? (payload as { data: unknown }).data
      : [];
  return Array.isArray(list) ? list.filter((x): x is string => typeof x === "string") : [];
}

export async function fetchReportFilterAutocomplete(options: {
  layer: ReportLayer;
  window: string;
  field: string;
  search?: string;
  filters?: ReportFilterRule[];
  excludeFilterIndex?: number;
}): Promise<string[]> {
  const endpoint = ENDPOINTS[options.layer];
  const apiField = resolveField(options.layer, options.field);
  if (!endpoint || !apiField) return [];

  const scopedFilters = (options.filters ?? []).filter(
    (rule, index) =>
      index !== options.excludeFilterIndex && rule.value.trim().length > 0,
  );

  const params: Record<string, string | number> = {
    window: options.window,
    field: apiField,
    limit: 25,
  };
  const search = options.search?.trim();
  if (search) params.search = search;

  const filter = parseFilters(scopedFilters);
  if (filter) params.filter = filter;

  const { data } = await client.get(endpoint, { params });
  return parseSuggestionList(data);
}
