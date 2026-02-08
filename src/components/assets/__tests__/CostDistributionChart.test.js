import { render, screen } from "@testing-library/react";
import CostDistributionChart from "../CostDistributionChart";

jest.mock("@carbon/charts-react", () => ({
  StackedBarChart: () => <div data-testid="stacked-bar-chart" />,
  GroupedBarChart: () => <div data-testid="grouped-bar-chart" />,
  SimpleBarChart: () => <div data-testid="simple-bar-chart" />,
}));

jest.mock("@carbon/react", () => ({
  Tile: ({ children, className }) => <div className={className}>{children}</div>,
  ContentSwitcher: ({ children }) => <div role="tablist">{children}</div>,
  Switch: ({ text }) => <button role="tab">{text}</button>,
}));

describe("CostDistributionChart", () => {
  const mockAssets = [
    { id: "node-1", assetType: "Node Disk", cluster: "default", totalCost: 25, bytes: 536870912000 },
    { id: "pvc-1", assetType: "PVC", cluster: "default", totalCost: 40, bytes: 107374182400 },
    { id: "pvc-2", assetType: "PVC", cluster: "prod", totalCost: 60, bytes: 214748364800 },
  ];

  it("renders chart heading", () => {
    render(<CostDistributionChart assets={mockAssets} />);
    expect(screen.getByText("Cost Distribution")).toBeInTheDocument();
  });

  it("renders total cost", () => {
    render(<CostDistributionChart assets={mockAssets} />);
    expect(screen.getByText("$125.00")).toBeInTheDocument();
  });

  it("renders the default stacked chart", () => {
    render(<CostDistributionChart assets={mockAssets} />);
    expect(screen.getByTestId("stacked-bar-chart")).toBeInTheDocument();
  });

  it("renders ContentSwitcher with 4 variants", () => {
    render(<CostDistributionChart assets={mockAssets} />);
    expect(screen.getByText("Stacked")).toBeInTheDocument();
    expect(screen.getByText("Grouped")).toBeInTheDocument();
    expect(screen.getByText("Horizontal")).toBeInTheDocument();
    expect(screen.getByText("$/GB")).toBeInTheDocument();
  });

  it("renders stats footer with distribution statistics", () => {
    render(<CostDistributionChart assets={mockAssets} />);
    expect(screen.getByText("Most Expensive")).toBeInTheDocument();
    expect(screen.getByText("Cheapest")).toBeInTheDocument();
    expect(screen.getByText("Avg Cost")).toBeInTheDocument();
    expect(screen.getByText("Groups")).toBeInTheDocument();
  });

  it("displays correct group count", () => {
    render(<CostDistributionChart assets={mockAssets} aggregateBy="cluster" />);
    // 2 unique clusters: default, prod
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("shows empty state when no assets", () => {
    render(<CostDistributionChart assets={[]} />);
    expect(
      screen.getByText("No cost data available for the selected period")
    ).toBeInTheDocument();
  });
});
