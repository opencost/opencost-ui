import client from "~/services/api-client";
import { parseFilters } from "~/lib/legacy-util";
import type { ReportFilterRule, ReportLayer } from "~/types/report";

type OpenCostEnvelope<T> = {
  data?: T;
};

export interface ReportFilterAutocompleteParams {
  layer: ReportLayer;
  window: string;
  field: string;
  search?: string;
  filters?: ReportFilterRule[];
  excludeFilterIndex?: number;
  limit?: number;
}

const AUTOCOMPLETE_ENDPOINTS: Partial<Record<ReportLayer, string>> = {
  allocation: "/allocation/autocomplete",
  cloudCost: "/cloudCost/autocomplete",
  infraAssets: "/assets/autocomplete",
};

/** Maps report filter property names to API autocomplete field names. */
export function toAutocompleteField(layer: ReportLayer, property: string): string | null {
  switch (layer) {
    case "allocation": {
      switch (property) {
        case "controller":
          return "controllerName";
        case "deployment":
        case "statefulset":
        case "daemonset":
        case "job":
          return "controllerKind";
        case "cluster":
        case "namespace":
        case "node":
        case "controllerKind":
        case "pod":
        case "container":
        case "service":
          return property;
        default:
          if (property.startsWith("label:") || property.startsWith("namespacelabel:")) {
            return property;
          }
          return null;
      }
    }
    case "cloudCost":
      return property;
    case "infraAssets": {
      switch (property) {
        case "assetType":
          return "type";
        case "account":
        case "cluster":
        case "category":
        case "provider":
        case "providerID":
          return property === "providerID" ? "providerID" : property;
        default:
          if (property.startsWith("label:")) return property;
          return null;
      }
    }
    default:
      return null;
  }
}

export function supportsReportFilterAutocomplete(
  layer: ReportLayer,
  property: string,
): boolean {
  return toAutocompleteField(layer, property) !== null;
}

function unwrapAutocompletePayload(body: unknown): string[] {
  if (!body || typeof body !== "object") return [];
  const envelope = body as OpenCostEnvelope<unknown>;
  const inner = envelope.data;
  if (Array.isArray(inner)) {
    return inner.filter((item): item is string => typeof item === "string");
  }
  if (inner && typeof inner === "object" && "data" in inner) {
    const nested = (inner as { data?: unknown }).data;
    if (Array.isArray(nested)) {
      return nested.filter((item): item is string => typeof item === "string");
    }
  }
  return [];
}

export async function fetchReportFilterAutocomplete(
  params: ReportFilterAutocompleteParams,
): Promise<string[]> {
  const endpoint = AUTOCOMPLETE_ENDPOINTS[params.layer];
  const apiField = toAutocompleteField(params.layer, params.field);
  if (!endpoint || !apiField) {
    return [];
  }

  const {
    window,
    search = "",
    filters = [],
    excludeFilterIndex,
    limit = 25,
  } = params;

  const scopedFilters = filters.filter(
    (rule, index) =>
      index !== excludeFilterIndex && rule.value.trim().length > 0,
  );
  const filter = parseFilters(scopedFilters);

  const query: Record<string, string | number> = {
    window,
    field: apiField,
    limit,
  };
  if (search.trim()) {
    query.search = search.trim();
  }
  if (filter) {
    query.filter = filter;
  }

  const { data } = await client.get(endpoint, { params: query });
  return unwrapAutocompletePayload(data);
}
