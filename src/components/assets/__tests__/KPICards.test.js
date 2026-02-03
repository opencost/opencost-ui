/**
 * Tests for KPICards component
 */

import { render, screen } from "@testing-library/react";
import KPICards from "../KPICards";

describe("KPICards", () => {
  const mockAssets = [
    {
      id: "1",
      bytes: 1073741824, // 1 GB
      totalCost: 50,
      breakdown: { idle: 0.3 },
    },
    {
      id: "2",
      bytes: 2147483648, // 2 GB
      totalCost: 100,
      breakdown: { idle: 0.5 },
    },
  ];

  it("renders all KPI cards", () => {
    render(<KPICards assets={mockAssets} />);

    expect(screen.getByText("Total Storage Cost")).toBeInTheDocument();
    expect(screen.getByText("Total Provisioned")).toBeInTheDocument();
    expect(screen.getByText("Wasted Cost")).toBeInTheDocument();
    expect(screen.getByText("Efficiency Score")).toBeInTheDocument();
  });

  it("calculates total cost correctly", () => {
    render(<KPICards assets={mockAssets} />);
    expect(screen.getByText("$150.00")).toBeInTheDocument();
  });

  it("displays asset count", () => {
    render(<KPICards assets={mockAssets} />);
    expect(screen.getByText("2 assets tracked")).toBeInTheDocument();
  });

  it("handles empty assets array", () => {
    render(<KPICards assets={[]} />);
    expect(screen.getByText("$0.00")).toBeInTheDocument();
  });
});
