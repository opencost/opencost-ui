import { render, screen } from "@testing-library/react";
import CostEfficiencyChart from "../CostEfficiencyChart";

jest.mock("@carbon/charts-react", () => ({
  ComboChart: () => <div data-testid="combo-chart" />,
  GroupedBarChart: () => <div data-testid="grouped-bar-chart" />,
  AreaChart: () => <div data-testid="area-chart" />,
}));

describe("CostEfficiencyChart", () => {
  const mockAssets = [
    { id: "1", cluster: "default", totalCost: 50, breakdown: { idle: 0.3 } },
    { id: "2", cluster: "default", totalCost: 30, breakdown: { idle: 0.5 } },
    { id: "3", cluster: "prod", totalCost: 80, breakdown: { idle: 0.4 } },
  ];

  it("renders chart heading", () => {
    render(<CostEfficiencyChart assets={mockAssets} />);
    expect(screen.getByText("Cost vs Efficiency")).toBeInTheDocument();
  });

  it("renders stat labels", () => {
    render(<CostEfficiencyChart assets={mockAssets} />);
    expect(screen.getByText("Total Cost")).toBeInTheDocument();
    expect(screen.getByText("Avg Utilization")).toBeInTheDocument();
    expect(screen.getByText("Clusters")).toBeInTheDocument();
  });

  it("renders ContentSwitcher with 3 variants", () => {
    render(<CostEfficiencyChart assets={mockAssets} />);
    expect(screen.getByText("Combo")).toBeInTheDocument();
    expect(screen.getByText("Grouped")).toBeInTheDocument();
    expect(screen.getByText("Area")).toBeInTheDocument();
  });

  it("renders cluster count", () => {
    render(<CostEfficiencyChart assets={mockAssets} />);
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("shows empty state when no assets", () => {
    render(<CostEfficiencyChart assets={[]} />);
    expect(screen.getByText("No efficiency data available")).toBeInTheDocument();
  });
});
