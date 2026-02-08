import { render, screen, fireEvent } from "@testing-library/react";
import CostTrendChart from "../CostTrendChart";

jest.mock("@carbon/charts-react", () => ({
  StackedAreaChart: ({ data, options }) => (
    <div data-testid="stacked-area-chart" data-chart-data={JSON.stringify(data)}>
      Stacked Area Chart
    </div>
  ),
  LineChart: ({ data, options }) => (
    <div data-testid="line-chart" data-chart-data={JSON.stringify(data)}>
      Line Chart
    </div>
  ),
}));

jest.mock("@carbon/react", () => ({
  Tile: ({ children, className }) => <div className={className}>{children}</div>,
  ContentSwitcher: ({ children, selectedIndex, onChange }) => (
    <div role="tablist">{children}</div>
  ),
  Switch: ({ text }) => <button role="tab">{text}</button>,
}));

describe("CostTrendChart", () => {
  const mockAssets = [
    {
      id: "1",
      cluster: "default-cluster",
      totalCost: 100,
    },
    {
      id: "2",
      cluster: "prod-cluster",
      totalCost: 200,
    },
    {
      id: "3",
      cluster: "default-cluster",
      totalCost: 50,
    },
  ];

  it("renders chart title with default 30 days", () => {
    render(<CostTrendChart assets={mockAssets} />);

    expect(screen.getByText(/Cost Trend/)).toBeTruthy();
    expect(screen.getByText(/Last\s+30\s+Days/)).toBeTruthy();
  });

  it("renders chart title based on timeWindow prop", () => {
    render(<CostTrendChart assets={mockAssets} timeWindow="7d" />);

    expect(screen.getByText(/Last\s+7\s+Days/)).toBeTruthy();
  });

  it("renders chart subtitle", () => {
    render(<CostTrendChart assets={mockAssets} />);

    expect(screen.getByText("Historical cost data by cluster")).toBeInTheDocument();
  });

  it("renders variant switcher", () => {
    render(<CostTrendChart assets={mockAssets} />);

    expect(screen.getByText("Stacked Area")).toBeInTheDocument();
    expect(screen.getByText("Line")).toBeInTheDocument();
  });

  it("renders StackedAreaChart by default", () => {
    render(<CostTrendChart assets={mockAssets} />);

    expect(screen.getByTestId("stacked-area-chart")).toBeInTheDocument();
    expect(screen.queryByTestId("line-chart")).not.toBeInTheDocument();
  });

  it("displays chart footer stats", () => {
    render(<CostTrendChart assets={mockAssets} />);

    expect(screen.getByText("Daily Avg")).toBeTruthy();
    expect(screen.getByText("30d Total")).toBeTruthy();
    expect(screen.getByText("Clusters")).toBeTruthy();
    expect(screen.getByText("Data Points")).toBeTruthy();
  });

  it("calculates monthly total correctly", () => {
    render(<CostTrendChart assets={mockAssets} />);

    // Total = 100 + 200 + 50 = 350
    expect(screen.getByText("$350.00")).toBeInTheDocument();
  });

  it("calculates daily average correctly", () => {
    render(<CostTrendChart assets={mockAssets} />);

    // Daily avg = 350 / 30 = 11.67
    expect(screen.getByText("$11.67")).toBeInTheDocument();
  });

  it("displays correct cluster count", () => {
    render(<CostTrendChart assets={mockAssets} />);

    // 2 unique clusters: default-cluster, prod-cluster
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("generates 30-day trend data by default", () => {
    render(<CostTrendChart assets={mockAssets} />);

    const chartElement = screen.getByTestId("stacked-area-chart");
    const chartData = JSON.parse(chartElement.getAttribute("data-chart-data"));

    // Should have data for 30 days * 2 clusters = 60 data points
    expect(chartData.length).toBe(60);
  });

  it("generates data matching timeWindow prop", () => {
    render(<CostTrendChart assets={mockAssets} timeWindow="7d" />);

    const chartElement = screen.getByTestId("stacked-area-chart");
    const chartData = JSON.parse(chartElement.getAttribute("data-chart-data"));

    // Should have data for 7 days * 2 clusters = 14 data points
    expect(chartData.length).toBe(14);
  });

  it("handles empty assets array", () => {
    render(<CostTrendChart assets={[]} />);

    expect(screen.getByText("No data available for trend visualization")).toBeInTheDocument();
  });

  it("displays zero values for empty assets", () => {
    render(<CostTrendChart assets={[]} />);

    const zeroValues = screen.getAllByText("$0.00");
    expect(zeroValues.length).toBeGreaterThanOrEqual(2); // Daily avg and monthly total
    const zeroNumbers = screen.getAllByText("0");
    expect(zeroNumbers.length).toBeGreaterThanOrEqual(2); // Clusters and data points
  });

  it("groups assets by cluster correctly", () => {
    render(<CostTrendChart assets={mockAssets} />);

    const chartElement = screen.getByTestId("stacked-area-chart");
    const chartData = JSON.parse(chartElement.getAttribute("data-chart-data"));

    const clusters = [...new Set(chartData.map((d) => d.group))];
    expect(clusters).toContain("default-cluster");
    expect(clusters).toContain("prod-cluster");
    expect(clusters.length).toBe(2);
  });

  it("handles assets with unknown cluster", () => {
    const assetsWithUnknown = [
      { id: "1", cluster: undefined, totalCost: 50 },
      { id: "2", cluster: null, totalCost: 100 },
    ];

    render(<CostTrendChart assets={assetsWithUnknown} />);

    const chartElement = screen.getByTestId("stacked-area-chart");
    const chartData = JSON.parse(chartElement.getAttribute("data-chart-data"));

    const clusters = [...new Set(chartData.map((d) => d.group))];
    expect(clusters).toContain("Unknown");
  });

  it("handles assets with zero cost", () => {
    const assetsWithZero = [
      { id: "1", cluster: "test", totalCost: 0 },
      { id: "2", cluster: "test", totalCost: 0 },
    ];

    render(<CostTrendChart assets={assetsWithZero} />);

    const zeroValues = screen.getAllByText("$0.00");
    expect(zeroValues.length).toBeGreaterThanOrEqual(1);
  });

  it("displays data points count correctly", () => {
    render(<CostTrendChart assets={mockAssets} />);

    // Should show 60 (default 30 days * 2 clusters)
    expect(screen.getByText("60")).toBeInTheDocument();
  });
});
