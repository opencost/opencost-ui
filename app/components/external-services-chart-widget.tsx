import { useEffect, useState } from "react";
import {
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Tile,
  Tag,
  DataTable,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
} from "@carbon/react";
import { SimpleBarChart } from "@carbon/charts-react";
import { ScaleTypes } from "@carbon/charts";
import ExternalCostsService from "~/services/external-costs";
import { toCurrency } from "~/lib/legacy-util";

interface ChartPoint {
  group: string;
  key: string;
  value: number;
}

interface ExternalCostTableRow {
  id: string;
  name: string;
  cost: string;
  domain: string;
  status: string;
}

function buildChartData(timeseriesData: any[]): ChartPoint[] {
  if (!Array.isArray(timeseriesData)) return [];
  const points: ChartPoint[] = [];
  for (const entry of timeseriesData) {
    const date = entry.window?.start
      ? new Date(entry.window.start).toLocaleDateString("en-US", {
          month: "2-digit",
          day: "2-digit",
        })
      : "?";
    if (entry.externalCosts) {
      for (const [name, item] of Object.entries(entry.externalCosts) as [
        string,
        any,
      ][]) {
        points.push({
          group: date,
          key: name,
          value: item.blendedCost ?? item.cost ?? 0,
        });
      }
    }
  }
  return points;
}

function buildTableData(tableData: any[]): ExternalCostTableRow[] {
  if (!Array.isArray(tableData)) return [];
  return tableData.slice(0, 20).map((item, i) => ({
    id: String(i),
    name: item.name ?? item.resourceName ?? "—",
    cost: toCurrency(item.blendedCost ?? item.cost ?? 0, "USD", 2),
    domain: item.domain ?? "—",
    status: "Billed",
  }));
}

const chartOptions = {
  title: "External Services Cost Trend",
  axes: {
    left: { mapsTo: "value", scaleType: ScaleTypes.LINEAR },
    bottom: { mapsTo: "group", scaleType: ScaleTypes.LABELS },
  },
  height: "400px",
};

const headers = [
  { key: "name", header: "Service" },
  { key: "cost", header: "Cost" },
  { key: "domain", header: "Domain" },
  { key: "status", header: "Status" },
];

export default function ExternalServicesChartWidget({
  window = "7d",
}: {
  window?: string;
}) {
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [tableData, setTableData] = useState<ExternalCostTableRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const [timeseries, totals] = await Promise.allSettled([
          ExternalCostsService.fetchExternalGraphCosts(
            window,
            "domain",
            [],
            "blended",
            "cost",
            "desc",
          ),
          ExternalCostsService.fetchExternalTableCosts(
            window,
            "domain",
            [],
            "blended",
            "cost",
            "desc",
          ),
        ]);
        if (!cancelled) {
          if (timeseries.status === "fulfilled")
            setChartData(buildChartData(timeseries.value ?? []));
          if (totals.status === "fulfilled")
            setTableData(buildTableData(totals.value ?? []));
        }
      } catch {
        // leave empty
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [window]);

  return (
    <div className="w-full">
      <Tabs>
        <TabList aria-label="External Services Tabs">
          <Tab>Chart</Tab>
          <Tab>Details</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <div className="w-full h-[400px] mt-4">
              {loading ? (
                <div className="h-[400px] flex items-center justify-center text-[#8d8d8d]">
                  Loading…
                </div>
              ) : chartData.length > 0 ? (
                <SimpleBarChart data={chartData} options={chartOptions} />
              ) : (
                <div className="h-[400px] flex items-center justify-center text-[#8d8d8d]">
                  No external cost data available. Configure external cost
                  integrations to see data here.
                </div>
              )}
            </div>
          </TabPanel>
          <TabPanel>
            <div className="mt-4">
              {loading ? (
                <p className="text-[#8d8d8d]">Loading…</p>
              ) : tableData.length === 0 ? (
                <p className="text-[#8d8d8d]">
                  No external cost data available.
                </p>
              ) : (
                <DataTable rows={tableData} headers={headers}>
                  {({
                    rows,
                    headers,
                    getTableProps,
                    getHeaderProps,
                    getRowProps,
                  }: any) => (
                    <TableContainer>
                      <Table {...getTableProps()}>
                        <TableHead>
                          <TableRow>
                            {headers.map((header: any) => (
                              <TableHeader
                                {...getHeaderProps({ header })}
                                key={header.key}
                              >
                                {header.header}
                              </TableHeader>
                            ))}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {rows.map((row: any) => (
                            <TableRow
                              {...getRowProps({ row })}
                              key={row.id}
                              onClick={() =>
                                setSelectedService(row.cells[0].value)
                              }
                              className="cursor-pointer"
                            >
                              {row.cells.map((cell: any) => (
                                <TableCell key={cell.id}>
                                  {cell.info.header === "status" ? (
                                    <Tag type="gray">{cell.value}</Tag>
                                  ) : (
                                    cell.value
                                  )}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </DataTable>
              )}

              {selectedService && (
                <Tile className="mt-4 p-4 bg-[#f4f4f4]">
                  <h4 className="font-semibold mb-2">
                    {selectedService} Details
                  </h4>
                  <p className="text-sm text-[#525252]">
                    Service: {selectedService}
                  </p>
                </Tile>
              )}
            </div>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  );
}
