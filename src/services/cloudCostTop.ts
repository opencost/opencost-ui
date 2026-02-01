import { formatSampleItemsForGraph, parseFilters } from "../util";
import client from "./api_client";
import {
  CloudCostFilter,
  CloudCostResponse,
  SampleDataResponse,
} from "../types/cloudCost";

class CloudCostTopService {
  async fetchCloudCostData(
    window: string,
    aggregate: string,
    costMetric: string,
    filters: CloudCostFilter[]
  ): Promise<CloudCostResponse | SampleDataResponse> {
    const params = {
      window,
      aggregate,
      costMetric,
      filter: parseFilters(filters ?? []),
      limit: 1000,
    };

    if (aggregate.includes("item")) {
      const resp = await client.get(
        `/cloudCost?window=${window}&costMetric=${costMetric}&filter=${parseFilters(
          filters,
        )}`,
      );
      const result_2 = await resp.data;

      return formatSampleItemsForGraph({ data: result_2, costMetric }) as SampleDataResponse;
    }

    const tableView = await client.get(`/cloudCost/view/table`, {
      params,
    });
    const totalsView = await client.get(`/cloudCost/view/totals`, {
      params,
    });
    const graphView = await client.get(`/cloudCost/view/graph`, {
      params,
    });

    const status = await client.get(`/cloudCost/status`);

    return {
      tableRows: tableView.data.data,
      graphData: graphView.data.data,
      tableTotal: totalsView.data.data.combined,
      cloudCostStatus: status.data.data,
    };
  }
}

export default new CloudCostTopService();

