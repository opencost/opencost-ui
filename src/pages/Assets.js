import React, { useEffect, useMemo, useState } from "react";
import {
  Grid,
  Column,
  Tile,
  DataTable,
  Table,
  TableHead,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  InlineLoading,
  InlineNotification,
  Tag,
} from "@carbon/react";
import CarbonShellLayout from "../components/carbon/CarbonShellLayout";
import AssetsService from "../services/assets";
import { toCurrency } from "../util";

const extractAssetsArray = (payload) => {
  if (Array.isArray(payload)) {
    return payload;
  }
  if (Array.isArray(payload?.data)) {
    return payload.data;
  }
  if (Array.isArray(payload?.assets)) {
    return payload.assets;
  }
  if (Array.isArray(payload?.data?.assets)) {
    return payload.data.assets;
  }
  if (Array.isArray(payload?.data?.data)) {
    return payload.data.data;
  }
  return [];
};

const Assets = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await AssetsService.fetchAssets({
          window: "7d",
          aggregate: "asset",
        });

        const rows = extractAssetsArray(data);
        setAssets(rows);
      } catch (err) {
        setError(
          err && err.message
            ? err.message
            : "Failed to load assets data from /assets.",
        );
        setAssets([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAssets();
  }, []);

  const { totalCost, idleCost, assetRows } = useMemo(() => {
    if (!assets || assets.length === 0) {
      return {
        totalCost: 0,
        idleCost: 0,
        assetRows: [],
      };
    }

    let costTotal = 0;
    let idleTotal = 0;

    const rows = assets.map((asset) => {
      const cost = asset.totalCost || asset.cost || 0;
      const idle = asset.idleCost || 0;
      costTotal += cost;
      idleTotal += idle;

      return {
        id: asset.name || asset.asset || asset.providerID || String(costTotal),
        name: asset.name || asset.asset || "Unknown",
        type: asset.type || asset.assetType || "",
        cluster: asset.cluster || asset.clusterName || "",
        region: asset.region || asset.zone || "",
        totalCost: cost,
        idleCost: idle,
        category: asset.category || "",
        providerID: asset.providerID || "",
        labels: asset.labels || {},
      };
    });

    return {
      totalCost: costTotal,
      idleCost: idleTotal,
      assetRows: rows,
    };
  }, [assets]);

  const currency = "USD";

  const headers = [
    { key: "name", header: "Asset" },
    { key: "type", header: "Type" },
    { key: "cluster", header: "Cluster" },
    { key: "region", header: "Region" },
    { key: "totalCost", header: "Total cost (7d)" },
    { key: "idleCost", header: "Idle cost" },
  ];

  return (
    <CarbonShellLayout>
      <main style={{ padding: "2rem 0" }}>
        <Grid fullWidth condensed>
          <Column sm={4} md={8} lg={16}>
            <h2 style={{ margin: "0 0 1rem 0" }}>Assets</h2>
            <p style={{ margin: 0, color: "var(--cds-text-secondary, #6f6f6f)" }}>
              Physical and cloud assets contributing to your spend, with a focus
              on idle and underutilized resources.
            </p>
          </Column>

          <Column sm={4} md={8} lg={4}>
            <Tile>
              <p className="cds--label">Total asset cost (7d)</p>
              <h3 style={{ marginTop: "0.25rem" }}>
                {toCurrency(totalCost || 0, currency)}
              </h3>
            </Tile>
          </Column>

          <Column sm={4} md={8} lg={4}>
            <Tile>
              <p className="cds--label">Idle asset cost</p>
              <h3 style={{ marginTop: "0.25rem" }}>
                {toCurrency(idleCost || 0, currency)}
              </h3>
              <Tag size="sm" type={idleCost > totalCost * 0.3 ? "red" : "yellow"}>
                Potential waste
              </Tag>
            </Tile>
          </Column>

          <Column sm={4} md={8} lg={8}>
            <Tile>
              <p className="cds--label">Assets observed</p>
              <h3 style={{ marginTop: "0.25rem" }}>{assetRows.length}</h3>
            </Tile>
          </Column>

          <Column sm={4} md={8} lg={16} style={{ marginTop: "1.5rem" }}>
            {loading && (
              <InlineLoading
                description="Loading assets..."
                status="active"
              />
            )}
            {!loading && error && (
              <InlineNotification
                kind="error"
                title="Failed to load assets"
                subtitle={error}
                lowContrast
              />
            )}
            {!loading && !error && assetRows.length === 0 && (
              <InlineNotification
                kind="info"
                title="No assets returned"
                subtitle="The backend responded successfully, but no assets were returned for the selected window."
                lowContrast
              />
            )}
          </Column>

          {!loading && !error && assetRows.length > 0 && (
            <Column sm={4} md={8} lg={16} style={{ marginTop: "1.5rem" }}>
              <DataTable rows={assetRows} headers={headers}>
                {({
                  rows,
                  headers: headerSet,
                  getHeaderProps,
                  getRowProps,
                  getTableProps,
                }) => (
                  <TableContainer title="Assets list">
                    <Table {...getTableProps()}>
                      <TableHead>
                        <TableRow>
                          {headerSet.map((header) => (
                            <TableHeader
                              key={header.key}
                              {...getHeaderProps({ header })}
                            >
                              {header.header}
                            </TableHeader>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {rows.map((row) => (
                          <TableRow key={row.id} {...getRowProps({ row })}>
                            {row.cells.map((cell) => {
                              if (
                                cell.info &&
                                (cell.info.header === "totalCost" ||
                                  cell.info.header === "idleCost")
                              ) {
                                return (
                                  <TableCell key={cell.id}>
                                    {toCurrency(cell.value || 0, currency)}
                                  </TableCell>
                                );
                              }
                              return (
                                <TableCell key={cell.id}>{cell.value}</TableCell>
                              );
                            })}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </DataTable>
            </Column>
          )}
        </Grid>
      </main>
    </CarbonShellLayout>
  );
};

export default Assets;

