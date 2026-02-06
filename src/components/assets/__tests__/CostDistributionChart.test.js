import { render, screen } from "@testing-library/react";
import CostDistributionChart from "../CostDistributionChart";

jest.mock("@carbon/charts-react", () => ({
  StackedBarChart: () => <div data-testid="stacked-bar-chart" />,
  GroupedBarChart: () => <div data-testid="grouped-bar-chart" />,
  ComboChart: () => <div data-testid="combo-chart" />,
}));

describe("CostDistributionChart", () => {
  const mockAssets = [
    { id: "node-1", assetType: "Node Disk", cluster: "default", totalCost: 25 },
    { id: "pvc-1", assetType: "PVC", cluster: "default", totalCost: 40 },
    { id: "pvc-2", assetType: "PVC", cluster: "prod", totalCost: 60 },
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

  it("renders ContentSwitcher with 3 variants", () => {
    render(<CostDistributionChart assets={mockAssets} />);
    expect(screen.getByText("Stacked")).toBeInTheDocument();
    expect(screen.getByText("Grouped")).toBeInTheDocument();
    expect(screen.getByText("Combo")).toBeInTheDocument();
  });

  it("shows empty state when no assets", () => {
    render(<CostDistributionChart assets={[]} />);
    expect(
      screen.getByText("No cost data available for the selected period")
    ).toBeInTheDocument();
  });
});
