import { render, screen } from "@testing-library/react";
import CostStackedBarChart from "../CostStackedBarChart";

// Carbon charts don't render in jsdom — mock them
jest.mock("@carbon/charts-react", () => ({
  StackedBarChart: () => <div data-testid="stacked-bar-chart" />,
}));

describe("CostStackedBarChart", () => {
  const mockAssets = [
    { id: "node-1", assetType: "Node Disk", cluster: "default", totalCost: 25 },
    { id: "pvc-1", assetType: "PVC", cluster: "default", totalCost: 40 },
    { id: "pvc-2", assetType: "PVC", cluster: "prod", totalCost: 60 },
  ];

  it("renders chart heading", () => {
    render(<CostStackedBarChart assets={mockAssets} />);
    expect(screen.getByText("Cost Distribution")).toBeInTheDocument();
  });

  it("renders total cost", () => {
    render(<CostStackedBarChart assets={mockAssets} />);
    expect(screen.getByText("$125.00")).toBeInTheDocument();
  });

  it("renders the chart component", () => {
    render(<CostStackedBarChart assets={mockAssets} />);
    expect(screen.getByTestId("stacked-bar-chart")).toBeInTheDocument();
  });

  it("shows empty state when no assets", () => {
    render(<CostStackedBarChart assets={[]} />);
    expect(
      screen.getByText("No cost data available for the selected period")
    ).toBeInTheDocument();
  });
});
