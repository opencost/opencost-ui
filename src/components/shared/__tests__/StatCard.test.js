import { render, screen } from "@testing-library/react";
import StatCard from "../StatCard";
import { Money } from "@carbon/icons-react";

jest.mock("@carbon/icons-react", () => ({
  Money: () => <span data-testid="icon-money" />,
}));

describe("StatCard", () => {
  it("renders label and value", () => {
    render(<StatCard label="Test Label" value="$100.00" />);

    expect(screen.getByText("Test Label")).toBeInTheDocument();
    expect(screen.getByText("$100.00")).toBeInTheDocument();
  });

  it("renders icon when provided", () => {
    render(<StatCard icon={Money} label="Cost" value="$50.00" />);

    expect(screen.getByTestId("icon-money")).toBeInTheDocument();
  });

  it("renders subtitle when provided", () => {
    render(<StatCard label="Total" value="100" subtitle="Last 30 days" />);

    expect(screen.getByText("Last 30 days")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(
      <StatCard label="Test" value="123" className="custom-class" />
    );

    expect(container.querySelector(".stat-card.custom-class")).toBeInTheDocument();
  });

  it("applies custom value color", () => {
    render(
      <StatCard
        label="Error"
        value="Error Value"
        valueColor="var(--cds-support-error)"
      />
    );

    const valueElement = screen.getByText("Error Value");
    expect(valueElement).toHaveStyle({ color: "var(--cds-support-error)" });
  });

  it("handles numeric values", () => {
    render(<StatCard label="Count" value={42} />);

    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("renders without icon", () => {
    render(<StatCard label="No Icon" value="100" />);

    expect(screen.getByText("No Icon")).toBeInTheDocument();
    expect(screen.queryByTestId("icon-money")).not.toBeInTheDocument();
  });

  it("renders without subtitle", () => {
    render(<StatCard label="No Subtitle" value="100" />);

    expect(screen.getByText("No Subtitle")).toBeInTheDocument();
    expect(screen.queryByText("subtitle")).not.toBeInTheDocument();
  });
});
