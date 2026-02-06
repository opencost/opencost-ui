import { render, screen } from "@testing-library/react";
import KPICards from "../KPICards";

jest.mock("@carbon/icons-react", () => ({
  Money: () => <span data-testid="icon-money" />,
  WarningAlt: () => <span data-testid="icon-warning" />,
  ChartBar: () => <span data-testid="icon-chart" />,
  Folder: () => <span data-testid="icon-folder" />,
}));

describe("KPICards", () => {
  const mockAssets = [
    {
      id: "1",
      bytes: 1073741824,
      totalCost: 50,
      breakdown: { idle: 0.3 },
    },
    {
      id: "2",
      bytes: 2147483648,
      totalCost: 100,
      breakdown: { idle: 0.5 },
    },
  ];

  it("renders all 4 KPI cards", () => {
    render(<KPICards assets={mockAssets} timeWindow="30d" />);

    expect(screen.getByText("Total Storage Cost")).toBeInTheDocument();
    expect(screen.getByText("Wasted Cost")).toBeInTheDocument();
    expect(screen.getByText("Efficiency Score")).toBeInTheDocument();
    expect(screen.getByText("Total Assets")).toBeInTheDocument();
  });

  it("calculates total cost correctly", () => {
    render(<KPICards assets={mockAssets} timeWindow="30d" />);
    expect(screen.getByText("$150.00")).toBeInTheDocument();
  });

  it("displays asset count", () => {
    render(<KPICards assets={mockAssets} timeWindow="30d" />);
    expect(screen.getByText("Total Assets")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("handles empty assets array", () => {
    render(<KPICards assets={[]} timeWindow="30d" />);
    const zeroCosts = screen.getAllByText("$0.00");
    expect(zeroCosts.length).toBeGreaterThanOrEqual(1);
  });

  it("displays correct time window label", () => {
    render(<KPICards assets={mockAssets} timeWindow="7d" />);
    expect(screen.getByText("Last 7 days")).toBeInTheDocument();
  });

  it("renders Carbon icons instead of emoji", () => {
    render(<KPICards assets={mockAssets} timeWindow="30d" />);
    expect(screen.getByTestId("icon-money")).toBeInTheDocument();
    expect(screen.getByTestId("icon-warning")).toBeInTheDocument();
    expect(screen.getByTestId("icon-chart")).toBeInTheDocument();
    expect(screen.getByTestId("icon-folder")).toBeInTheDocument();
  });
});
