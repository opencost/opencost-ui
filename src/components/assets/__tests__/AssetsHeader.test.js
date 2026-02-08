import { render, screen, fireEvent } from "@testing-library/react";
import AssetsHeader from "../AssetsHeader";

jest.mock("@carbon/react", () => ({
  Dropdown: ({ id, titleText, selectedItem, items, onChange, size }) => (
    <div data-testid={id}>
      <label>{titleText}</label>
      <span>{selectedItem?.label}</span>
    </div>
  ),
  Button: ({ children, onClick, renderIcon: Icon, iconDescription, hasIconOnly, ...rest }) => (
    <button onClick={onClick} aria-label={iconDescription}>
      {Icon && <Icon />}
      {children}
    </button>
  ),
}));

jest.mock("@carbon/icons-react", () => ({
  Renew: () => <span data-testid="icon-renew" />,
}));

describe("AssetsHeader", () => {
  const mockProps = {
    timeWindow: "30d",
    onTimeWindowChange: jest.fn(),
    aggregateBy: "type",
    onAggregateByChange: jest.fn(),
    accumulate: true,
    onAccumulateChange: jest.fn(),
    onRefresh: jest.fn(),
    useMockData: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders Date Range dropdown with selected value", () => {
    render(<AssetsHeader {...mockProps} />);

    expect(screen.getByText("Date Range")).toBeInTheDocument();
    expect(screen.getByText("Last 30 days")).toBeInTheDocument();
  });

  it("renders Aggregate By dropdown with selected value", () => {
    render(<AssetsHeader {...mockProps} />);

    expect(screen.getByText("Aggregate By")).toBeInTheDocument();
    expect(screen.getByText("Asset Type")).toBeInTheDocument();
  });

  it("renders Resolution dropdown with selected value", () => {
    render(<AssetsHeader {...mockProps} />);

    expect(screen.getByText("Resolution")).toBeInTheDocument();
    expect(screen.getByText("Entire Window")).toBeInTheDocument();
  });

  it("renders refresh button", () => {
    render(<AssetsHeader {...mockProps} />);

    expect(screen.getByTestId("icon-renew")).toBeInTheDocument();
  });

  it("calls onRefresh when refresh button clicked", () => {
    render(<AssetsHeader {...mockProps} />);

    const refreshButton = screen.getByRole("button", { name: /refresh/i });
    fireEvent.click(refreshButton);

    expect(mockProps.onRefresh).toHaveBeenCalledTimes(1);
  });

  it("shows mock data badge when useMockData is true", () => {
    render(<AssetsHeader {...mockProps} useMockData={true} />);

    expect(screen.getByText("Mock Data")).toBeInTheDocument();
  });

  it("does not show mock data badge when useMockData is false", () => {
    render(<AssetsHeader {...mockProps} useMockData={false} />);

    expect(screen.queryByText("Mock Data")).not.toBeInTheDocument();
  });

  it("renders all three dropdowns", () => {
    render(<AssetsHeader {...mockProps} />);

    expect(screen.getByText("Date Range")).toBeInTheDocument();
    expect(screen.getByText("Aggregate By")).toBeInTheDocument();
    expect(screen.getByText("Resolution")).toBeInTheDocument();
  });
});
