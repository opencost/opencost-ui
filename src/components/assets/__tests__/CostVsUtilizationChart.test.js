import { render, screen } from "@testing-library/react";
import CostVsUtilizationChart from "../CostVsUtilizationChart";

jest.mock("@carbon/charts-react", () => ({
  ScatterChart: () => <div data-testid="scatter-chart" />,
}));

describe("CostVsUtilizationChart", () => {
  const mockAssets = [
    { id: "1", name: "node-a", totalCost: 25, breakdown: { idle: 0.1 } },
    { id: "2", name: "pvc-b", totalCost: 40, breakdown: { idle: 0.5 } },
    { id: "3", name: "pvc-c", totalCost: 10, breakdown: { idle: 0.85 } },
  ];

  it("renders chart heading", () => {
    render(<CostVsUtilizationChart assets={mockAssets} />);
    expect(screen.getByText("Cost vs Utilization")).toBeInTheDocument();
  });

  it("renders stat labels", () => {
    render(<CostVsUtilizationChart assets={mockAssets} />);
    expect(screen.getByText(/Efficient/)).toBeInTheDocument();
    expect(screen.getByText(/Healthy/)).toBeInTheDocument();
    expect(screen.getByText(/Critical/)).toBeInTheDocument();
    expect(screen.getByText("Total Tracked")).toBeInTheDocument();
  });

  it("shows empty state when no assets", () => {
    render(<CostVsUtilizationChart assets={[]} />);
    expect(
      screen.getByText("No utilization data available")
    ).toBeInTheDocument();
  });
});
