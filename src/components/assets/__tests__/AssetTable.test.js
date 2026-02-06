import { render, screen } from "@testing-library/react";
import AssetTable from "../AssetTable";

describe("AssetTable", () => {
  const mockAssets = [
    {
      id: "node-1",
      name: "control-plane",
      cluster: "default-cluster",
      assetType: "Node Disk",
      storageClass: "__local__",
      totalCost: 12.75,
      bytes: 536870912000,
      breakdown: { idle: 0.55, system: 0.45, user: 0 },
    },
    {
      id: "pvc-1",
      name: "mysql-data",
      cluster: "default-cluster",
      assetType: "PVC",
      storageClass: "fast-ssd",
      claimNamespace: "database",
      totalCost: 24.55,
      bytes: 107374182400,
      breakdown: { idle: 0.3, system: 0, user: 0.7 },
    },
  ];

  it("renders table title", () => {
    render(
      <AssetTable assets={mockAssets} totalAssets={2} filteredAssets={2} />
    );
    expect(screen.getByText("Asset Details")).toBeInTheDocument();
  });

  it("renders table headers", () => {
    render(
      <AssetTable assets={mockAssets} totalAssets={2} filteredAssets={2} />
    );
    expect(screen.getByText("Asset Name")).toBeInTheDocument();
    expect(screen.getAllByText("Cluster").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Type")).toBeInTheDocument();
    expect(screen.getByText("Status")).toBeInTheDocument();
  });

  it("renders asset names", () => {
    render(
      <AssetTable assets={mockAssets} totalAssets={2} filteredAssets={2} />
    );
    expect(screen.getByText("control-plane")).toBeInTheDocument();
    expect(screen.getByText("mysql-data")).toBeInTheDocument();
  });

  it("renders namespace for PVCs", () => {
    render(
      <AssetTable assets={mockAssets} totalAssets={2} filteredAssets={2} />
    );
    expect(screen.getByText("ns: database")).toBeInTheDocument();
  });

  it("shows description with asset count", () => {
    render(
      <AssetTable assets={mockAssets} totalAssets={5} filteredAssets={2} />
    );
    expect(
      screen.getByText(/Showing 2 of 2 assets.*filtered from 5/)
    ).toBeInTheDocument();
  });

  it("renders proportional usage meter with idle label", () => {
    render(
      <AssetTable assets={mockAssets} totalAssets={2} filteredAssets={2} />
    );
    expect(screen.getByText(/45\.0% used/)).toBeInTheDocument();
    expect(screen.getByText(/55\.0% idle/)).toBeInTheDocument();
  });

  it("renders colored tags for asset types", () => {
    render(
      <AssetTable assets={mockAssets} totalAssets={2} filteredAssets={2} />
    );
    expect(screen.getByText("Node Disk")).toBeInTheDocument();
    expect(screen.getByText("PVC")).toBeInTheDocument();
  });

  it("renders storage class as tag", () => {
    render(
      <AssetTable assets={mockAssets} totalAssets={2} filteredAssets={2} />
    );
    expect(screen.getByText("fast-ssd")).toBeInTheDocument();
  });

  it("renders expand header for expandable rows", () => {
    const { container } = render(
      <AssetTable assets={mockAssets} totalAssets={2} filteredAssets={2} />
    );
    const expandHeader = container.querySelector(".cds--table-expand");
    expect(expandHeader).toBeInTheDocument();
  });

  it("renders expand buttons for each row", () => {
    const { container } = render(
      <AssetTable assets={mockAssets} totalAssets={2} filteredAssets={2} />
    );
    const expandButtons = container.querySelectorAll(".cds--table-expand__button");
    expect(expandButtons.length).toBeGreaterThanOrEqual(2);
  });
});
