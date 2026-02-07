import { parseFilters } from "../util";
import { costMetricToPropName } from "../components/cloudCost/tokens";
import client from "./api_client";
import {
  CloudCostFilter,
  CloudCostResponse,
  SampleDataResponse,
  TableRowItem,
} from "../types/cloudCost";

function formatSampleItemsForGraph({ data, costMetric }) {
  const costMetricPropName = costMetric
    ? costMetricToPropName[costMetric]
    : "amortizedNetCost";
  const graphData = data.sets.map(({ cloudCosts, window: { end, start } }) => {
    return {
      end,
      items: Object.entries(cloudCosts).map(([name, item]) => ({
        name,
        value: item.netCost.cost,
      })),
      start,
    };
  });
  const accumulator: Record<string, Omit<TableRowItem, "name">> = {};
  data.sets.forEach(({ cloudCosts, window }) => {
    Object.entries(cloudCosts).forEach(([name, cloudCostItem]) => {
      const { properties } = cloudCostItem;
      accumulator[name] ||= {
        cost: 0,
        start: "",
        end: "",
        providerID: "",
        labelName: "",
        kubernetesCost: 0,
        kubernetesPercent: 0,
      };
      accumulator[name].cost += cloudCostItem[costMetricPropName].cost;
      accumulator[name].kubernetesCost +=
        cloudCostItem[costMetricPropName].cost *
        cloudCostItem[costMetricPropName].kubernetesPercent;
      accumulator[name].start = window.start;
      accumulator[name].end = window.end;
      accumulator[name].providerID = properties.providerID;
      accumulator[name].labelName = properties.labels?.name;
      accumulator[name].kubernetesPercent =
        cloudCostItem[costMetricPropName].kubernetesPercent;
    });
  });
  const tableRows = Object.entries(accumulator)
    .map(
      ([
        name,
        {
          cost,
          start,
          end,
          providerID,
          kubernetesCost,
          kubernetesPercent,
          labelName,
        },
      ]) => ({
        cost,
        name,
        kubernetesCost,
        kubernetesPercent,
        start,
        end,
        providerID,
        labelName,
      }),
    )
    .sort((a, b) => (a.cost > b.cost ? -1 : 1));

  const tableTotal = tableRows.reduce(
    (tr1, tr2) => ({
      ...tr1,
      cost: tr1.cost + tr2.cost,
      kubernetesCost: tr1.kubernetesCost + tr2.kubernetesCost,
    }),
    {
      cost: 0,
      name: "",
      kubernetesCost: 0,
      kubernetesPercent: 0,
      end: "",
      start: "",
      labelName: "",
      providerID: "",
    },
  );

  return { graphData, tableRows, tableTotal };
}

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

