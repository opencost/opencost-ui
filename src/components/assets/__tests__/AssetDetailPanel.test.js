import { render, screen } from "@testing-library/react";
import AssetDetailPanel from "../AssetDetailPanel";

jest.mock("@carbon/icons-react", () => ({
  Money: () => <span data-testid="icon-money" />,
  DataBase: () => <span data-testid="icon-database" />,
  Analytics: () => <span data-testid="icon-analytics" />,
}));

jest.mock("@carbon/react", () => ({
  Modal: ({ children, open, onRequestClose, modalHeading }) =>
    open ? (
      <div data-testid="modal" aria-label={modalHeading}>
        <div data-testid="modal-heading">{modalHeading}</div>
        <button onClick={onRequestClose}>Close</button>
        {children}
      </div>
    ) : null,
  ModalHeader: ({ children }) => <div data-testid="modal-header">{children}</div>,
  ModalBody: ({ children }) => <div data-testid="modal-body">{children}</div>,
}));

describe("AssetDetailPanel", () => {
  const mockAsset = {
    id: "pvc-123",
    name: "test-pvc",
    assetType: "PVC",
    cluster: "default-cluster",
    totalCost: 150.5,
    bytes: 107374182400, // 100 GB
    storageClass: "standard",
    providerID: "provider-id-123",
    volumeName: "pv-volume-123",
    claimName: "test-claim",
    claimNamespace: "default",
    local: 0,
    window: {
      start: "2024-01-01T00:00:00Z",
      end: "2024-01-31T23:59:59Z",
    },
    minutes: 43200,
    breakdown: {
      idle: 0.3,
      system: 0.2,
      user: 0.4,
      other: 0.1,
    },
  };

  const mockProps = {
    asset: mockAsset,
    isOpen: true,
    onClose: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders nothing when asset is null", () => {
    const { container } = render(
      <AssetDetailPanel asset={null} isOpen={true} onClose={jest.fn()} />
    );

    expect(container.firstChild).toBeNull();
  });

  it("renders asset name as modal heading", () => {
    render(<AssetDetailPanel {...mockProps} />);

    expect(screen.getByText("test-pvc")).toBeInTheDocument();
  });

  it("displays asset type and cluster", () => {
    render(<AssetDetailPanel {...mockProps} />);

    expect(screen.getByText("PVC")).toBeInTheDocument();
    expect(screen.getByText("default-cluster")).toBeInTheDocument();
  });

  it("displays cost details section", () => {
    render(<AssetDetailPanel {...mockProps} />);

    expect(screen.getByText("Cost Details")).toBeInTheDocument();
    expect(screen.getByText("Total Cost")).toBeInTheDocument();
    expect(screen.getByText("Daily Rate")).toBeInTheDocument();
    expect(screen.getByText("Wasted Cost")).toBeInTheDocument();
    expect(screen.getByText("Efficiency")).toBeInTheDocument();
  });

  it("calculates and displays total cost correctly", () => {
    render(<AssetDetailPanel {...mockProps} />);

    expect(screen.getByText("$150.50")).toBeInTheDocument();
  });

  it("calculates and displays daily rate", () => {
    render(<AssetDetailPanel {...mockProps} />);

    // Daily rate = 150.5 / 30 = 5.016666...
    expect(screen.getByText("$5.02")).toBeInTheDocument();
  });

  it("displays storage information section", () => {
    render(<AssetDetailPanel {...mockProps} />);

    expect(screen.getByText("Storage Information")).toBeInTheDocument();
    expect(screen.getByText("Total Size")).toBeInTheDocument();
    expect(screen.getByText("Storage Class")).toBeInTheDocument();
    expect(screen.getByText("Provider ID")).toBeInTheDocument();
  });

  it("displays storage size in GB", () => {
    render(<AssetDetailPanel {...mockProps} />);

    expect(screen.getByText(/100(\.00)?\s*GB/)).toBeInTheDocument();
  });

  it("displays storage class", () => {
    render(<AssetDetailPanel {...mockProps} />);

    expect(screen.getByText("standard")).toBeInTheDocument();
  });

  it("displays utilization breakdown section", () => {
    render(<AssetDetailPanel {...mockProps} />);

    expect(screen.getByText("Utilization Breakdown")).toBeInTheDocument();
    expect(screen.getByText("Idle")).toBeInTheDocument();
    expect(screen.getByText("System")).toBeInTheDocument();
    expect(screen.getByText("User")).toBeInTheDocument();
    expect(screen.getByText("Other")).toBeInTheDocument();
  });

  it("displays breakdown percentages correctly", () => {
    render(<AssetDetailPanel {...mockProps} />);

    expect(screen.getByText("30.0%")).toBeInTheDocument(); // idle
    expect(screen.getByText("20.0%")).toBeInTheDocument(); // system
    expect(screen.getByText("40.0%")).toBeInTheDocument(); // user
    expect(screen.getByText("10.0%")).toBeInTheDocument(); // other
  });

  it("displays Kubernetes information for PVCs", () => {
    render(<AssetDetailPanel {...mockProps} />);

    expect(screen.getByText("Kubernetes Information")).toBeInTheDocument();
    expect(screen.getByText("Namespace")).toBeInTheDocument();
    expect(screen.getByText("default")).toBeInTheDocument();
    expect(screen.getByText("Claim Name")).toBeInTheDocument();
    expect(screen.getByText("test-claim")).toBeInTheDocument();
  });

  it("displays measurement window information", () => {
    render(<AssetDetailPanel {...mockProps} />);

    expect(screen.getByText("Measurement Window")).toBeInTheDocument();
    expect(screen.getByText("Start")).toBeInTheDocument();
    expect(screen.getByText("End")).toBeInTheDocument();
    expect(screen.getByText("Duration")).toBeInTheDocument();
  });

  it("hides breakdown items with 0 value", () => {
    const assetWithZeroBreakdown = {
      ...mockAsset,
      breakdown: {
        idle: 0.5,
        system: 0,
        user: 0,
        other: 0,
      },
    };

    render(
      <AssetDetailPanel
        asset={assetWithZeroBreakdown}
        isOpen={true}
        onClose={jest.fn()}
      />
    );

    // Only idle should be visible
    const breakdownNames = screen.getAllByText(/Idle|System|User|Other/);
    expect(breakdownNames.length).toBe(1);
    expect(screen.getByText("Idle")).toBeInTheDocument();
  });

  it("does not display Kubernetes info for non-PVC assets", () => {
    const nodeAsset = {
      ...mockAsset,
      assetType: "Node Disk",
      claimNamespace: undefined,
      claimName: undefined,
    };

    render(
      <AssetDetailPanel asset={nodeAsset} isOpen={true} onClose={jest.fn()} />
    );

    expect(screen.queryByText("Kubernetes Information")).not.toBeInTheDocument();
    expect(screen.queryByText("Namespace")).not.toBeInTheDocument();
  });

  it("renders icons for each section", () => {
    render(<AssetDetailPanel {...mockProps} />);

    expect(screen.getByTestId("icon-money")).toBeInTheDocument();
    expect(screen.getByTestId("icon-database")).toBeInTheDocument();
    expect(screen.getByTestId("icon-analytics")).toBeInTheDocument();
  });

  it("handles missing breakdown data gracefully", () => {
    const assetWithoutBreakdown = {
      ...mockAsset,
      breakdown: undefined,
    };

    render(
      <AssetDetailPanel
        asset={assetWithoutBreakdown}
        isOpen={true}
        onClose={jest.fn()}
      />
    );

    // Should still render without errors
    expect(screen.getByText("Utilization Breakdown")).toBeInTheDocument();
  });
});
