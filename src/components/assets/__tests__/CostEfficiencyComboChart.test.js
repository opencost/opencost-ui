import { render, screen } from "@testing-library/react";
import CostEfficiencyComboChart from "../CostEfficiencyComboChart";

jest.mock("@carbon/charts-react", () => ({
  ComboChart: () => <div data-testid="combo-chart" />,
}));

describe("CostEfficiencyComboChart", () => {
  const mockAssets = [
    { id: "1", cluster: "default", totalCost: 50, breakdown: { idle: 0.3 } },
    { id: "2", cluster: "default", totalCost: 30, breakdown: { idle: 0.5 } },
    { id: "3", cluster: "prod", totalCost: 80, breakdown: { idle: 0.4 } },
  ];

  it("renders chart heading", () => {
    render(<CostEfficiencyComboChart assets={mockAssets} />);
    expect(screen.getByText("Cost vs Efficiency")).toBeInTheDocument();
  });

  it("renders stat labels", () => {
    render(<CostEfficiencyComboChart assets={mockAssets} />);
    expect(screen.getByText("Total Cost")).toBeInTheDocument();
    expect(screen.getByText("Avg Utilization")).toBeInTheDocument();
    expect(screen.getByText("Clusters")).toBeInTheDocument();
  });

  it("renders cluster count", () => {
    render(<CostEfficiencyComboChart assets={mockAssets} />);
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("shows empty state when no assets", () => {
    render(<CostEfficiencyComboChart assets={[]} />);
    expect(screen.getByText("No efficiency data available")).toBeInTheDocument();
  });
});
