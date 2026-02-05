import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FilterPanel from "../FilterPanel";

describe("FilterPanel", () => {
  const mockFilters = {
    search: "",
    status: [],
    assetType: [],
    storageClass: [],
    cluster: [],
  };

  const mockFilterOptions = {
    assetTypes: ["Node", "PVC"],
    storageClasses: ["fast-ssd", "standard"],
    clusters: ["cluster-1", "cluster-2"],
  };

  const mockOnFiltersChange = jest.fn();
  const mockOnMockDataToggle = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders search input", () => {
    render(
      <FilterPanel
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        filterOptions={mockFilterOptions}
        useMockData={false}
        onMockDataToggle={mockOnMockDataToggle}
      />
    );

    expect(
      screen.getByPlaceholderText(/Search by name, namespace, or cluster/i)
    ).toBeInTheDocument();
  });

  it("renders filter checkboxes", () => {
    render(
      <FilterPanel
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        filterOptions={mockFilterOptions}
        useMockData={false}
        onMockDataToggle={mockOnMockDataToggle}
      />
    );

    expect(screen.getByLabelText(/Ok/i)).toBeInTheDocument();
    expect(screen.getByLabelText("Node")).toBeInTheDocument();
    expect(screen.getByLabelText("PVC")).toBeInTheDocument();
  });

  it("handles filter changes", async () => {
    const user = userEvent.setup();

    render(
      <FilterPanel
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        filterOptions={mockFilterOptions}
        useMockData={false}
        onMockDataToggle={mockOnMockDataToggle}
      />
    );

    const checkbox = screen.getByLabelText(/Ok/i);
    await user.click(checkbox);

    expect(mockOnFiltersChange).toHaveBeenCalled();
  });

  it("handles clear filters", async () => {
    const user = userEvent.setup();

    render(
      <FilterPanel
        filters={{ ...mockFilters, status: ["ok"] }}
        onFiltersChange={mockOnFiltersChange}
        filterOptions={mockFilterOptions}
        useMockData={false}
        onMockDataToggle={mockOnMockDataToggle}
      />
    );

    const clearButton = screen.getByText(/Clear All Filters/i);
    await user.click(clearButton);

    expect(mockOnFiltersChange).toHaveBeenCalled();
  });
});
