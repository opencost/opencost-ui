import React, { useEffect, useState, useMemo } from "react";
import {
  DataTable,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  TableContainer,
  TableToolbar,
  TableToolbarContent,
  TableToolbarSearch,
  Pagination,
  Tag,
  TableExpandHeader,
  TableExpandRow,
  TableExpandedRow,
  Tile,
  Layer,
  Section,
  Heading,
  Button,
  OverflowMenu,
  OverflowMenuItem,
  Grid,
  Column,
  DataTableSkeleton,
} from "@carbon/react";
import { Renew, Download, Launch } from "@carbon/icons-react";

import Page from "../components/Page";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Controls from "../components/Controls";
import AssetsService from "../services/assets";
import { toCurrency } from "../util";

// Constants for the Select controls to prevent "out-of-range" errors
const WINDOW_OPTIONS = ["1d", "2d", "7d", "30d", "all"];
const CURRENCY_OPTIONS = ["USD", "EUR", "GBP", "INR", "JPY"];

const Assets = () => {
  const [assets, setAssets] = useState([]);
  const [filteredAssets, setFilteredAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [window, setWindow] = useState("7d");
  const [currency, setCurrency] = useState("USD");
  const [firstRowIndex, setFirstRowIndex] = useState(0);
  const [currentPageSize, setCurrentPageSize] = useState(10);

  const headers = [
    { header: "Asset Name", key: "name" },
    { header: "Category", key: "category" },
    { header: "Type", key: "type" },
    { header: "Cluster", key: "cluster" },
    { header: "Total Cost", key: "totalCost" },
  ];

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await AssetsService.fetchAssets(window);
      const safeData = Array.isArray(data) ? data : [];
      setAssets(safeData);
      setFilteredAssets(safeData);
      setFirstRowIndex(0);
    } catch (e) {
      console.error("Fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [window]);

  const assetById = useMemo(() => {
    const map = new Map();
    assets.forEach((asset, index) => {
      const id = asset.id || asset.providerId || asset.name || `asset-${index}`;
      map.set(id, asset);
    });
    return map;
  }, [assets]);

  const tableRows = useMemo(() => {
    return filteredAssets.map((asset, index) => {
      const id = asset.id || asset.providerId || asset.name || `asset-${index}`;
      return {
        id,
        name: asset.name || "(unnamed asset)",
        category: asset.category || "Unknown",
        type: asset.type || "Unknown",
        cluster: asset.cluster || "Unknown",
        totalCost: asset.totalCost || 0,
        ...asset,
      };
    });
  }, [filteredAssets]);

  const handleSearch = (e) => {
    const rawValue = e.target.value || "";
    const value = rawValue.toLowerCase().trim();

    if (!value) {
      setFilteredAssets(assets);
      setFirstRowIndex(0);
      return;
    }

    const filtered = assets.filter((asset) => {
      const name = (asset.name || "").toLowerCase();
      const type = (asset.type || "").toLowerCase();
      const cluster = (asset.cluster || "").toLowerCase();
      return (
        name.includes(value) ||
        type.includes(value) ||
        cluster.includes(value)
      );
    });

    setFilteredAssets(filtered);
    setFirstRowIndex(0);
  };

  const stats = useMemo(() => {
    const total = assets.reduce((sum, a) => sum + (a.totalCost || 0), 0);
    const compute = assets.filter(
      (a) => (a.category || "").toLowerCase() === "compute"
    ).length;
    const storage = assets.filter(
      (a) => (a.category || "").toLowerCase() === "storage"
    ).length;
    return { total, compute, storage, count: assets.length };
  }, [assets]);

  const pagedRows = useMemo(() => {
    return tableRows.slice(firstRowIndex, firstRowIndex + currentPageSize);
  }, [tableRows, firstRowIndex, currentPageSize]);

  return (
    <Page active="assets.html">
      <Header headerTitle="Infrastructure Assets">
        <Button
          renderIcon={Renew}
          hasIconOnly
          iconDescription="Refresh Data"
          kind="ghost"
          onClick={fetchData}
        />
      </Header>

      <Controls
        window={window}
        setWindow={setWindow}
        windowOptions={WINDOW_OPTIONS}
        currency={currency}
        setCurrency={setCurrency}
        currencyOptions={CURRENCY_OPTIONS}
        title="Asset Discovery"
      />

      <main className="opencost-main-content">
        <Grid className="stats-grid">
          <Column sm={4} md={4} lg={4}>
            <Tile className="stats-tile">
              <span className="label">Total Spend ({window})</span>
              <h2 className="value">
                {toCurrency(stats.total, currency)}
              </h2>
            </Tile>
          </Column>
          <Column sm={4} md={4} lg={4}>
            <Tile className="stats-tile">
              <span className="label">Active Assets</span>
              <h2 className="value">{stats.count}</h2>
            </Tile>
          </Column>
          <Column sm={4} md={4} lg={4}>
            <Tile className="stats-tile">
              <span className="label">Compute / Storage Ratio</span>
              <h2 className="value">
                {stats.compute} : {stats.storage}
              </h2>
            </Tile>
          </Column>
        </Grid>

        <Section className="table-section">
          <Grid>
            <Column lg={16} md={8} sm={4}>
              <Layer>
                {loading ? (
                  <DataTableSkeleton
                    headers={headers}
                    rowCount={5}
                    columnCount={headers.length + 1}
                  />
                ) : (
                  <DataTable rows={pagedRows} headers={headers}>
                    {({
                      rows,
                      headers,
                      getHeaderProps,
                      getTableProps,
                      getRowProps,
                    }) => {
                      const tableProps = getTableProps();
                      const { key: _tableKey, ...tableRest } = tableProps || {};
                      return (
                        <TableContainer
                          title="Asset Inventory"
                          description="Deep visibility into underlying cloud provider resources."
                        >
                          <TableToolbar>
                            <TableToolbarContent>
                              <TableToolbarSearch
                                onChange={handleSearch}
                                persistent
                                placeholder="Filter by name, type, or cluster..."
                              />
                              <Button
                                kind="ghost"
                                renderIcon={Download}
                                onClick={() =>
                                  AssetsService.downloadCSV(assets)
                                }
                              >
                                Export
                              </Button>
                            </TableToolbarContent>
                          </TableToolbar>
                          <Table {...tableRest} size="lg">
                            <TableHead>
                              <TableRow>
                                <TableExpandHeader />
                                {headers.map((header) => {
                                  const hp = getHeaderProps({ header });
                                  const { key: _h, ...hpRest } = hp || {};
                                  return (
                                    <TableHeader {...hpRest} key={header.key}>
                                      {header.header}
                                    </TableHeader>
                                  );
                                })}
                                <TableHeader />
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {rows.map((row) => {
                                const fullAsset = assetById.get(row.id);
                                const rp = getRowProps({ row });
                                const { key: _r, ...rpRest } = rp || {};
                                return (
                                  <React.Fragment key={row.id}>
                                    <TableExpandRow {...rpRest}>
                                      {row.cells.map((cell) => (
                                        <TableCell key={cell.id}>
                                          {cell.info.header === "totalCost" ? (
                                            <span className="cost-cell">
                                              {toCurrency(cell.value, currency)}
                                            </span>
                                          ) : cell.info.header === "category" ? (
                                            <Tag
                                              type={
                                                (cell.value || "").toLowerCase() === "compute"
                                                  ? "blue"
                                                  : "cyan"
                                              }
                                            >
                                              {cell.value}
                                            </Tag>
                                          ) : (
                                            cell.value
                                          )}
                                        </TableCell>
                                      ))}
                                      <TableCell>
                                        <OverflowMenu flipped size="sm">
                                          <OverflowMenuItem
                                            itemText="Provider Console"
                                            renderIcon={Launch}
                                          />
                                          <OverflowMenuItem itemText="View Allocations" />
                                        </OverflowMenu>
                                      </TableCell>
                                    </TableExpandRow>
                                    <TableExpandedRow
                                      colSpan={headers.length + 2}
                                    >
                                      <div className="expanded-asset-content">
                                        <Grid>
                                          <Column lg={8} md={4}>
                                            <Heading className="sub-heading">Identity</Heading>
                                            <p className="detail-item">
                                              <strong>Provider ID:</strong>{" "}
                                              <code>{fullAsset?.providerId || "—"}</code>
                                            </p>
                                            <p className="detail-item">
                                              <strong>Cluster:</strong>{" "}
                                              {fullAsset?.cluster || "Unknown"}
                                            </p>
                                          </Column>
                                          <Column lg={8} md={4}>
                                            <Heading className="sub-heading">Resource Breakdown</Heading>
                                            <div className="cost-mini-grid">
                                              <div>
                                                <span className="caption">CPU</span>
                                                <p className="cost-value">
                                                  {toCurrency(fullAsset?.cpuCost || 0, currency)}
                                                </p>
                                              </div>
                                              <div>
                                                <span className="caption">RAM</span>
                                                <p className="cost-value">
                                                  {toCurrency(fullAsset?.ramCost || 0, currency)}
                                                </p>
                                              </div>
                                            </div>
                                          </Column>
                                        </Grid>
                                      </div>
                                    </TableExpandedRow>
                                  </React.Fragment>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      );
                    }}
                  </DataTable>
                )}
                <Pagination
                  totalItems={tableRows.length}
                  pageSize={currentPageSize}
                  pageSizes={[10, 20, 50]}
                  onChange={({ page, pageSize }) => {
                    setCurrentPageSize(pageSize);
                    setFirstRowIndex((page - 1) * pageSize);
                  }}
                />
              </Layer>
            </Column>
          </Grid>
        </Section>
      </main>
      <Footer />
    </Page>
  );
};

export default Assets;