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
} from "recharts";
import type { AllocationReportResult } from "~/services/report-query";
import type { ReportChartType } from "~/types/report";

interface ReportResultsViewProps {
  result: AllocationReportResult | null;
  loading: boolean;
  error: string | null;
  chartType: ReportChartType;
}

export default function ReportResultsView({
  result,
  loading,
  error,
  chartType,
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
          <p className="m-0 text-2xl font-semibold text-[#a8b0b7]">Select a Measure</p>
          <p className="mt-2 text-sm">Configure your report and click Run Report.</p>
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
    value: row.measureValue,
  }));
  const renderTable = (
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
  );

  const renderSeries = () => {
    if (chartType === "table") return null;

    if (chartType === "pie") {
      return (
        <div className="h-[380px] w-full px-2 pb-2 pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                outerRadius={140}
                fill="#5B8FF9"
                label
              />
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      );
    }

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
              {result.timeSeries.seriesKeys.map((key, idx) => (
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
              {result.timeSeries.seriesKeys.map((key, idx) => (
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
            {result.timeSeries.seriesKeys.map((key, idx) => (
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
  };

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
      {renderSeries()}
      {renderTable}
    </div>
  );
}
