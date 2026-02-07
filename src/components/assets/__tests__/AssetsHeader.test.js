import { render, screen, fireEvent } from "@testing-library/react";
import AssetsHeader from "../AssetsHeader";

jest.mock("@carbon/icons-react", () => ({
  Renew: () => <span data-testid="icon-renew" />,
}));

describe("AssetsHeader", () => {
  const mockProps = {
    timeWindow: "30d",
    onTimeWindowChange: jest.fn(),
    onRefresh: jest.fn(),
    useMockData: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders time window switcher with correct selection", () => {
    render(<AssetsHeader {...mockProps} />);

    expect(screen.getByText("7d")).toBeInTheDocument();
    expect(screen.getByText("14d")).toBeInTheDocument();
    expect(screen.getByText("30d")).toBeInTheDocument();
    expect(screen.getByText("60d")).toBeInTheDocument();
    expect(screen.getByText("90d")).toBeInTheDocument();
  });

  it("renders refresh button", () => {
    render(<AssetsHeader {...mockProps} />);

    expect(screen.getByTestId("icon-renew")).toBeInTheDocument();
  });

  it("calls onRefresh when refresh button clicked", () => {
    render(<AssetsHeader {...mockProps} />);

    const refreshButton = screen.getByRole("button");
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

  it("handles undefined useMockData prop", () => {
    const { useMockData, ...propsWithoutMockData } = mockProps;
    render(<AssetsHeader {...propsWithoutMockData} />);

    expect(screen.queryByText("Mock Data")).not.toBeInTheDocument();
  });
});
