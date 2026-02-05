import { render, screen } from "@testing-library/react";
import CostUtilizationChart from "../CostUtilizationChart";

jest.mock("@carbon/charts-react", () => ({
  ScatterChart: () => <div data-testid="scatter-chart" />,
  DonutChart: () => <div data-testid="donut-chart" />,
  SimpleBarChart: () => <div data-testid="simple-bar-chart" />,
}));

describe("CostUtilizationChart", () => {
  const mockAssets = [
    { id: "1", name: "node-a", totalCost: 25, breakdown: { idle: 0.1 } },
    { id: "2", name: "pvc-b", totalCost: 40, breakdown: { idle: 0.5 } },
    { id: "3", name: "pvc-c", totalCost: 10, breakdown: { idle: 0.85 } },
  ];

  it("renders chart heading", () => {
    render(<CostUtilizationChart assets={mockAssets} />);
    expect(screen.getByText("Cost vs Utilization")).toBeInTheDocument();
  });

  it("renders stat labels", () => {
    render(<CostUtilizationChart assets={mockAssets} />);
    expect(screen.getByText(/Efficient/)).toBeInTheDocument();
    expect(screen.getByText(/Healthy/)).toBeInTheDocument();
    expect(screen.getByText(/Critical/)).toBeInTheDocument();
    expect(screen.getByText("Total Tracked")).toBeInTheDocument();
  });

  it("renders ContentSwitcher with 3 variants", () => {
    render(<CostUtilizationChart assets={mockAssets} />);
    expect(screen.getByText("Scatter")).toBeInTheDocument();
    expect(screen.getByText("Donut")).toBeInTheDocument();
    expect(screen.getByText("Bar")).toBeInTheDocument();
  });

  it("shows empty state when no assets", () => {
    render(<CostUtilizationChart assets={[]} />);
    expect(
      screen.getByText("No utilization data available")
    ).toBeInTheDocument();
  });
});
