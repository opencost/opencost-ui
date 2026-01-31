import * as React from "react";
import {
  DataTable,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  TableToolbar,
  TableToolbarContent,
  TableToolbarSearch,
} from "@carbon/react";
import { Cell, RadialBar, RadialBarChart, Tooltip } from "recharts";
import { find, get } from "lodash";

import { Button, Dropdown, Heading, InlineLoading, Tag } from "@carbon/react";
import { Renew } from "@carbon/icons-react";

import { primary } from "../constants/colors";
import { useLocation, useNavigate } from "react-router";

import { bytesToString, toCurrency } from "../util";
import { checkCustomWindow, toVerboseTimeRange } from "../util";
import Footer from "../components/Footer";
import PageHeader from "../components/PageHeader";
import Page from "../components/Page";
import SelectWindow from "../components/SelectWindow";
import Subtitle from "../components/Subtitle";
import Warnings from "../components/Warnings";
import AssetsService from "../services/assets";
import { windowOptions, assetTypeOptions } from "../components/assets/tokens";

const tableHeaders = [
  { key: "name", header: "Name" },
  { key: "type", header: "Type" },
  { key: "provider", header: "Provider" },
  { key: "cluster", header: "Cluster" },
  { key: "cpuCores", header: "CPU Cores" },
  { key: "ram", header: "RAM" },
  { key: "totalCost", header: "Total Cost" },
];

function assetsResponseToRows(data, currency) {
  if (!data?.data) return [];
  const raw = typeof data.data === "object" ? data.data : {};
  return Object.entries(raw).map(([id, asset]) => {
    const props = asset.properties || {};
    const name = props.name || id;
    const type = asset.type || "—";
    const provider = props.provider || "—";
    const cluster = props.cluster || "—";
    const totalCost = asset.totalCost != null ? asset.totalCost : 0;
    let cpuCores = "—";
    let ram = "—";
    if (asset.type === "Node") {
      cpuCores = asset.cpuCores != null ? String(asset.cpuCores) : "—";
      ram = asset.ramBytes != null ? bytesToString(asset.ramBytes) : "—";
    }
    if (asset.type === "Disk" && asset.bytes != null) {
      ram = bytesToString(asset.bytes);
    }
    return {
      id,
      name,
      type,
      provider,
      cluster,
      cpuCores,
      ram,
      totalCost: toCurrency(totalCost, currency),
      totalCostNum: totalCost,
    };
  });
}

function assetsToChartData(rows) {
  const byType = {};
  rows.forEach((r) => {
    const t = r.type === "—" ? "Other" : r.type;
    byType[t] = (byType[t] || 0) + r.totalCostNum;
  });
  return Object.entries(byType).map(([name, value]) => ({ name, value }));
}

const Assets = () => {
  const [title, setTitle] = React.useState("Assets — last 7 days");
  const [window, setWindow] = React.useState("7d");
  const [assetTypeFilter, setAssetTypeFilter] = React.useState("");
  const [currency, setCurrency] = React.useState("USD");
  const [init, setInit] = React.useState(false);
  const [fetchTrigger, setFetchTrigger] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [errors, setErrors] = React.useState([]);
  const [assetsRaw, setAssetsRaw] = React.useState(null);

  const routerLocation = useLocation();
  const searchParams = new URLSearchParams(routerLocation.search);
  const navigate = useNavigate();

  function generateTitle({ window: w }) {
    const opt = find(windowOptions, { value: w });
    let windowName = get(opt, "name", "");
    if (!windowName && checkCustomWindow(w)) windowName = toVerboseTimeRange(w);
    return windowName ? `Assets — ${windowName}` : "Assets";
  }

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    setErrors([]);
    try {
      const resp = await AssetsService.fetchAssets(window);
      if (resp?.data) {
        setAssetsRaw(resp);
      } else {
        setAssetsRaw(null);
      }
    } catch (err) {
      const primary = "Failed to load assets";
      let secondary = "Please open an Issue with OpenCost if problems persist.";
      if (err.message?.indexOf("404") === 0) {
        secondary =
          "Please update OpenCost to the latest version, and open an Issue if problems persist.";
      } else if (err.message) {
        secondary = err.message;
      }
      setErrors([{ primary, secondary }]);
      setAssetsRaw(null);
    }
    setLoading(false);
  }, [window]);

  React.useEffect(() => {
    setWindow(searchParams.get("window") || "7d");
    setAssetTypeFilter(searchParams.get("type") || "");
    setCurrency(searchParams.get("currency") || "USD");
  }, [routerLocation]);

  React.useEffect(() => {
    if (!init) setInit(true);
  }, [init]);

  React.useEffect(() => {
    if (init || fetchTrigger) fetchData();
  }, [init, fetchTrigger, fetchData]);

  React.useEffect(() => {
    setFetchTrigger((t) => !t);
    setTitle(generateTitle({ window }));
  }, [window]);

  const allRows = React.useMemo(
    () => assetsResponseToRows(assetsRaw, currency),
    [assetsRaw, currency],
  );

  const filteredRows = React.useMemo(() => {
    if (!assetTypeFilter) return allRows;
    return allRows.filter((r) => r.type === assetTypeFilter);
  }, [allRows, assetTypeFilter]);

  const [searchValue, setSearchValue] = React.useState("");
  const tableRows = React.useMemo(() => {
    if (!searchValue.trim()) return filteredRows;
    const q = searchValue.toLowerCase();
    return filteredRows.filter(
      (r) =>
        String(r.name).toLowerCase().includes(q) ||
        String(r.type).toLowerCase().includes(q) ||
        String(r.provider).toLowerCase().includes(q) ||
        String(r.cluster).toLowerCase().includes(q),
    );
  }, [filteredRows, searchValue]);

  const chartData = React.useMemo(() => assetsToChartData(filteredRows), [filteredRows]);

  const chartDataWithColors = React.useMemo(
    () =>
      chartData
        .slice()
        .sort((a, b) => b.value - a.value)
        .map((d, i) => ({
          ...d,
          fill: primary[i % primary.length],
        })),
    [chartData],
  );

  const totalCostSum = React.useMemo(
    () => tableRows.reduce((sum, r) => sum + (r.totalCostNum || 0), 0),
    [tableRows],
  );

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || payload.length === 0) {
      return null;
    }

    const data = payload[0];
    const percent = totalCostSum > 0 ? ((data.value / totalCostSum) * 100).toFixed(1) : "0.0";

    return (
      <div
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.98)",
          border: "1px solid var(--opencost-border)",
          borderRadius: "4px",
          padding: "12px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
        }}
      >
        <div
          style={{
            fontSize: "0.875rem",
            fontWeight: 600,
            marginBottom: "4px",
            color: "var(--opencost-text-primary)",
          }}
        >
          {data.payload.name}
        </div>
        <div
          style={{
            fontSize: "0.875rem",
            color: "var(--opencost-text-secondary)",
          }}
        >
          {toCurrency(data.value, currency)} ({percent}%)
        </div>
      </div>
    );
  };

  const radialChartData = React.useMemo(
    () =>
      chartDataWithColors.map((d) => ({
        ...d,
        fill: d.fill,
      })),
    [chartDataWithColors],
  );


  const assetTypesCount = React.useMemo(() => {
    const uniqueTypes = new Set(tableRows.map((r) => r.type).filter((t) => t !== "—"));
    return uniqueTypes.size;
  }, [tableRows]);

  const avgCostPerAsset = React.useMemo(() => {
    if (tableRows.length === 0) return 0;
    return totalCostSum / tableRows.length;
  }, [totalCostSum, tableRows.length]);

  return (
    <Page>
      <PageHeader headerTitle="Assets">
        <Button
          hasIconOnly
          renderIcon={Renew}
          iconDescription="Refresh"
          onClick={() => setFetchTrigger((t) => !t)}
          kind="ghost"
          size="md"
        />
      </PageHeader>

      {!loading && errors.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <Warnings warnings={errors} />
        </div>
      )}

      {init && (
        <div
          id="assets-page"
          style={{
            backgroundColor: "var(--opencost-background)",
            padding: "2rem",
            minHeight: "calc(100vh - 200px)",
          }}
        >
          <div
            style={{
              display: "flex",
              flexFlow: "row",
              marginBottom: "1.5rem",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: "1rem",
            }}
          >
            <div style={{ flexGrow: 1 }}>
              <Heading
                style={{
                  fontSize: "1.5rem",
                  fontWeight: 600,
                  marginBottom: "0.25rem",
                }}
              >
                {title}
              </Heading>
              <Subtitle report={{ window }} />
            </div>
            <div style={{ display: "flex", gap: 16, alignItems: "flex-end", flexShrink: 0 }}>
              <SelectWindow
                windowOptions={windowOptions}
                window={window}
                setWindow={(win) => {
                  searchParams.set("window", win);
                  navigate({ search: `?${searchParams.toString()}` });
                }}
              />
              <Dropdown
                id="asset-type-filter"
                titleText="Asset Type"
                label="Asset Type"
                items={assetTypeOptions.map((o) => ({
                  id: o.value,
                  text: o.name,
                  value: o.value,
                }))}
                itemToString={(item) => (item ? item.text : "")}
                selectedItem={assetTypeOptions
                  .map((o) => ({
                    id: o.value,
                    text: o.name,
                    value: o.value,
                  }))
                  .find((item) => item.value === assetTypeFilter)}
                onChange={({ selectedItem }) => {
                  const v = selectedItem ? selectedItem.value : "";
                  setAssetTypeFilter(v);
                  if (v) searchParams.set("type", v);
                  else searchParams.delete("type");
                  navigate({ search: `?${searchParams.toString()}` });
                }}
                style={{ minWidth: 120 }}
              />
            </div>
          </div>

          {loading && (
            <div style={{ display: "flex", justifyContent: "center" }}>
              <div style={{ paddingTop: 100, paddingBottom: 100 }}>
                <InlineLoading description="Loading assets..." status="active" />
              </div>
            </div>
          )}

          {!loading && (
            <>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: "1rem",
                  marginBottom: "2rem",
                }}
              >
                <div
                  style={{
                    backgroundColor: "var(--opencost-surface)",
                    padding: "1.25rem",
                    borderRadius: "8px",
                    border: "1px solid var(--opencost-border)",
                    transition: "box-shadow 0.2s ease",
                  }}
                >
                  <div
                    style={{
                      color: "var(--opencost-text-secondary)",
                      fontSize: "0.8125rem",
                      fontWeight: 500,
                      marginBottom: "0.5rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Total Assets
                  </div>
                  <div
                    style={{
                      color: "var(--opencost-text-primary)",
                      fontSize: "1.75rem",
                      fontWeight: 600,
                      lineHeight: 1.2,
                    }}
                  >
                    {tableRows.length.toLocaleString()}
                  </div>
                </div>
                <div
                  style={{
                    backgroundColor: "var(--opencost-surface)",
                    padding: "1.25rem",
                    borderRadius: "8px",
                    border: "1px solid var(--opencost-border)",
                    transition: "box-shadow 0.2s ease",
                  }}
                >
                  <div
                    style={{
                      color: "var(--opencost-text-secondary)",
                      fontSize: "0.8125rem",
                      fontWeight: 500,
                      marginBottom: "0.5rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Total Cost
                  </div>
                  <div
                    style={{
                      color: "var(--opencost-text-primary)",
                      fontSize: "1.75rem",
                      fontWeight: 600,
                      lineHeight: 1.2,
                    }}
                  >
                    {toCurrency(totalCostSum, currency)}
                  </div>
                </div>
                <div
                  style={{
                    backgroundColor: "var(--opencost-surface)",
                    padding: "1.25rem",
                    borderRadius: "8px",
                    border: "1px solid var(--opencost-border)",
                    transition: "box-shadow 0.2s ease",
                  }}
                >
                  <div
                    style={{
                      color: "var(--opencost-text-secondary)",
                      fontSize: "0.8125rem",
                      fontWeight: 500,
                      marginBottom: "0.5rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Asset Types
                  </div>
                  <div
                    style={{
                      color: "var(--opencost-text-primary)",
                      fontSize: "1.75rem",
                      fontWeight: 600,
                      lineHeight: 1.2,
                    }}
                  >
                    {assetTypesCount}
                  </div>
                </div>
                <div
                  style={{
                    backgroundColor: "var(--opencost-surface)",
                    padding: "1.25rem",
                    borderRadius: "8px",
                    border: "1px solid var(--opencost-border)",
                    transition: "box-shadow 0.2s ease",
                  }}
                >
                  <div
                    style={{
                      color: "var(--opencost-text-secondary)",
                      fontSize: "0.8125rem",
                      fontWeight: 500,
                      marginBottom: "0.5rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Avg Cost per Asset
                  </div>
                  <div
                    style={{
                      color: "var(--opencost-text-primary)",
                      fontSize: "1.75rem",
                      fontWeight: 600,
                      lineHeight: 1.2,
                    }}
                  >
                    {toCurrency(avgCostPerAsset, currency)}
                  </div>
                </div>
              </div>
              {chartData.length > 0 && (
                <div
                  style={{
                    marginBottom: "2rem",
                    backgroundColor: "var(--opencost-surface)",
                    padding: "1.5rem",
                    borderRadius: "8px",
                    border: "1px solid var(--opencost-border)",
                  }}
                >
                  <Heading
                    style={{
                      marginBottom: "1rem",
                      fontSize: "1rem",
                      fontWeight: 600,
                    }}
                  >
                    Cost by asset type
                  </Heading>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "0.75rem",
                      marginBottom: "1.5rem",
                    }}
                  >
                    {chartDataWithColors.map((item, index) => {
                      const percent =
                        totalCostSum > 0
                          ? ((item.value / totalCostSum) * 100).toFixed(1)
                          : "0.0";
                      const tagTypes = ["blue", "red", "green", "purple", "teal", "cyan"];
                      return (
                        <Tag
                          key={`tag-${index}`}
                          type={tagTypes[index % tagTypes.length]}
                          size="md"
                        >
                          <span style={{ fontWeight: 600 }}>{item.name}</span>
                          {" — "}
                          {toCurrency(item.value, currency)} ({percent}%)
                        </Tag>
                      );
                    })}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      width: "100%",
                    }}
                  >
                    <RadialBarChart
                      width={500}
                      height={400}
                      innerRadius="30%"
                      outerRadius="90%"
                      data={radialChartData}
                      startAngle={90}
                      endAngle={-270}
                    >
                      <RadialBar
                        minAngle={15}
                        label={false}
                        background={{ fill: "#f0f0f0" }}
                        dataKey="value"
                      >
                        {radialChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </RadialBar>
                      <Tooltip content={<CustomTooltip />} />
                    </RadialBarChart>
                  </div>
                </div>
              )}
              <DataTable
                rows={tableRows}
                headers={tableHeaders}
                isSortable
              >
                {({
                  rows,
                  headers,
                  getTableProps,
                  getHeaderProps,
                  getRowProps,
                  onInputChange,
                }) => (
                  <TableContainer title="Assets">
                    <TableToolbar>
                      <TableToolbarContent>
                        <TableToolbarSearch
                          onChange={(e) => setSearchValue(e.target.value)}
                          placeholder="Search by name, type, provider, cluster"
                        />
                      </TableToolbarContent>
                    </TableToolbar>
                    <Table {...getTableProps()}>
                      <TableHead>
                        <TableRow>
                          {headers.map((header) => (
                            <TableHeader {...getHeaderProps({ header })} key={header.key}>
                              {header.header}
                            </TableHeader>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {rows.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={headers.length}>
                              No assets found for the selected window.
                            </TableCell>
                          </TableRow>
                        ) : (
                          rows.map((row) => (
                            <TableRow {...getRowProps({ row })} key={row.id}>
                              {row.cells.map((cell) => (
                                <TableCell key={cell.id} style={{ textAlign: "left" }}>
                                  {cell.value}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </DataTable>
            </>
          )}
        </div>
      )}
      <Footer />
    </Page>
  );
};

export default React.memo(Assets);
