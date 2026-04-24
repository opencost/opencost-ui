import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@carbon/react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from "recharts";
import type { ReportRunResult } from "~/services/report-query";
import type { ReportChartType, ReportQuery } from "~/types/report";

interface ReportResultsViewProps {
  result: ReportRunResult | null;
  loading: boolean;
  error: string | null;
  query: ReportQuery;
}

function MultiSeriesChart({
  chartType,
  chartData,
  seriesKeys,
  chartPalette,
}: {
  chartType: ReportChartType;
  chartData: Array<Record<string, number | string>>;
  seriesKeys: string[];
  chartPalette: string[];
}) {
  if (chartType === "table") return null;

  if (chartType === "line") {
    return (
      <div className="h-[380px] w-full px-2 pb-2 pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" />
            <YAxis />
            <Tooltip />
            <Legend />
            {seriesKeys.map((key, idx) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={chartPalette[idx % chartPalette.length]}
                strokeWidth={2}
                dot={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (chartType === "bar" || chartType === "stackedBar") {
    return (
      <div className="h-[380px] w-full px-2 pb-2 pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" />
            <YAxis />
            <Tooltip />
            <Legend />
            {seriesKeys.map((key, idx) => (
              <Bar
                key={key}
                dataKey={key}
                fill={chartPalette[idx % chartPalette.length]}
                stackId={chartType === "stackedBar" ? "stack" : undefined}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div className="h-[380px] w-full px-2 pb-2 pt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="label" />
          <YAxis />
          <Tooltip />
          <Legend />
          {seriesKeys.map((key, idx) => (
            <Area
              key={key}
              type="monotone"
              dataKey={key}
              stackId="stack"
              stroke={chartPalette[idx % chartPalette.length]}
              fill={chartPalette[idx % chartPalette.length]}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function ReportResultsView({
  result,
  loading,
  error,
  query,
}: ReportResultsViewProps) {
  const chartPalette = [
    "#5B8FF9",
    "#61DDAA",
    "#65789B",
    "#F6BD16",
    "#7262FD",
    "#78D3F8",
    "#9661BC",
    "#F6903D",
    "#008685",
  ];

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-[#8d8d8d]">
        Running report...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded border border-[#da1e28] bg-[#fff1f1] p-4 text-sm text-[#a2191f]">
        {error}
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex h-full items-center justify-center text-center text-[#8d8d8d]">
        <div>
          <p className="m-0 text-2xl font-semibold text-[#a8b0b7]">Run your report</p>
          <p className="mt-2 text-sm">Configure your report and click Run Report.</p>
        </div>
      </div>
    );
  }

  if (result.layer === "allocation") {
    const chartData = result.timeSeries.points.map((point) => ({
      label: point.label,
      ...point.values,
    }));
    const pieData = result.rows.slice(0, 10).map((row) => ({
      name: row.name,
      value: row.measureValue,
    }));

    return (
      <div className="h-full overflow-auto rounded border border-[#e0e0e0] bg-white">
        <div className="border-b border-[#e0e0e0] px-4 py-3">
          <h3 className="m-0 text-lg font-semibold text-[#262626]">
            {result.measureLabel} by {result.groupingLabel}
          </h3>
          <p className="mt-1 text-sm text-[#525252]">
            Total: <span className="font-semibold">{result.totalDisplayValue}</span>
          </p>
        </div>
        {query.chartType === "pie" ? (
          <div className="h-[380px] w-full px-2 pb-2 pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={140} label />
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <MultiSeriesChart
            chartType={query.chartType}
            chartData={chartData}
            seriesKeys={result.timeSeries.seriesKeys}
            chartPalette={chartPalette}
          />
        )}
        <div className="p-4">
          <Table size="md" useZebraStyles>
            <TableHead>
              <TableRow>
                <TableHeader>{result.groupingLabel}</TableHeader>
                <TableHeader>{result.measureLabel}</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {result.rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.measureDisplayValue}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  if (result.layer === "cloudCost") {
    const chartData = result.timeSeries.points.map((point) => ({
      label: point.label,
      ...point.values,
    }));
    const pieData = result.rows.slice(0, 10).map((row) => ({
      name: row.name,
      value: row.cost,
    }));

    return (
      <div className="h-full overflow-auto rounded border border-[#e0e0e0] bg-white">
        <div className="border-b border-[#e0e0e0] px-4 py-3">
          <h3 className="m-0 text-lg font-semibold text-[#262626]">
            Cloud Cost by {result.groupingLabel}
          </h3>
          <p className="mt-1 text-sm text-[#525252]">
            Metric: <span className="font-semibold">{result.metricLabel}</span> · Total:{" "}
            <span className="font-semibold">{result.totalDisplayValue}</span>
          </p>
        </div>
        {query.chartType === "pie" ? (
          <div className="h-[380px] w-full px-2 pb-2 pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={140} label>
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cloud-pie-${entry.name}-${index}`}
                      fill={chartPalette[index % chartPalette.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <MultiSeriesChart
            chartType={query.chartType}
            chartData={chartData}
            seriesKeys={result.timeSeries.seriesKeys}
            chartPalette={chartPalette}
          />
        )}
        <div className="p-4">
          <Table size="md" useZebraStyles>
            <TableHead>
              <TableRow>
                <TableHeader>{result.groupingLabel}</TableHeader>
                <TableHeader>K8s Utilization</TableHeader>
                <TableHeader>Cost</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {result.rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{Math.round(row.kubernetesPercent)}%</TableCell>
                  <TableCell>{row.costDisplay}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  if (result.layer === "infraAssets") {
    const typeData = result.typeTotals.map((item) => ({
      name: item.type,
      value: item.totalCost,
    }));
    const topAssets = [...result.assets]
      .sort((a, b) => b.totalCost - a.totalCost)
      .slice(0, 10)
      .map((asset) => ({ label: asset.name, Cost: asset.totalCost }));

    return (
      <div className="h-full overflow-auto rounded border border-[#e0e0e0] bg-white">
        <div className="border-b border-[#e0e0e0] px-4 py-3">
          <h3 className="m-0 text-lg font-semibold text-[#262626]">
            Infrastructure Assets by {result.groupingLabel}
          </h3>
          <p className="mt-1 text-sm text-[#525252]">
            Total: <span className="font-semibold">{result.totalDisplayValue}</span> · Carbon:{" "}
            <span className="font-semibold">{result.totalCarbon.toFixed(2)} kg CO2e</span>
          </p>
        </div>
        {query.chartType === "table" ? null : query.chartType === "pie" ? (
          <div className="h-[380px] w-full px-2 pb-2 pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={typeData} dataKey="value" nameKey="name" outerRadius={140} label>
                  {typeData.map((entry, index) => (
                    <Cell
                      key={`assets-pie-${entry.name}-${index}`}
                      fill={chartPalette[index % chartPalette.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[380px] w-full px-2 pb-2 pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topAssets}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Cost">
                  {topAssets.map((entry, index) => (
                    <Cell
                      key={`assets-bar-${entry.label}-${index}`}
                      fill={chartPalette[index % chartPalette.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
        <div className="p-4">
          <Table size="md" useZebraStyles>
            <TableHead>
              <TableRow>
                <TableHeader>Asset Name</TableHeader>
                <TableHeader>Type</TableHeader>
                <TableHeader>Cluster</TableHeader>
                <TableHeader>Total Cost</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {result.assets.map((asset) => (
                <TableRow key={asset.id}>
                  <TableCell>{asset.name}</TableCell>
                  <TableCell>{asset.type}</TableCell>
                  <TableCell>{asset.cluster}</TableCell>
                  <TableCell>${asset.totalCost.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  const chartData = result.timeSeries.points.map((point) => ({
    label: point.label,
    ...point.values,
  }));
  const pieData = result.rows.slice(0, 10).map((row) => ({
    name: row.name,
    value: row.cost,
  }));

  return (
    <div className="h-full overflow-auto rounded border border-[#e0e0e0] bg-white">
      <div className="border-b border-[#e0e0e0] px-4 py-3">
        <h3 className="m-0 text-lg font-semibold text-[#262626]">
          External Cost by {result.groupingLabel}
        </h3>
        <p className="mt-1 text-sm text-[#525252]">
          Cost type: <span className="font-semibold">{result.costType}</span> · Total:{" "}
          <span className="font-semibold">{result.totalDisplayValue}</span>
        </p>
      </div>
      {query.chartType === "pie" ? (
        <div className="h-[380px] w-full px-2 pb-2 pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={140} label>
                {pieData.map((entry, index) => (
                  <Cell
                    key={`external-pie-${entry.name}-${index}`}
                    fill={chartPalette[index % chartPalette.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <MultiSeriesChart
          chartType={query.chartType}
          chartData={chartData}
          seriesKeys={result.timeSeries.seriesKeys}
          chartPalette={chartPalette}
        />
      )}
      <div className="p-4">
        <Table size="md" useZebraStyles>
          <TableHead>
            <TableRow>
              <TableHeader>{result.groupingLabel}</TableHeader>
              <TableHeader>Cost Type</TableHeader>
              <TableHeader>Cost</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {result.rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.costType}</TableCell>
                <TableCell>{row.costDisplay}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
