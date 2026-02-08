import * as React from "react";
import Page from "../components/Page";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Paper, Typography } from "@mui/material";

import {
  DataTable,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  TableContainer,
} from "@carbon/react";

/**
 * Temporary mock data for Assets UI.
 * This will be replaced with the /assets API.
 */
const MOCK_ASSETS = [
  {
    name: "node-1",
    type: "Node",
    costTotal: 12.45,
    cluster: "prod-cluster",
  },
  {
    name: "node-2",
    type: "Node",
    costTotal: 9.87,
    cluster: "prod-cluster",
  },
  {
    name: "persistent-volume-1",
    type: "PersistentVolume",
    costTotal: 3.12,
    cluster: "dev-cluster",
  },
];

const Assets = () => {
  const [assets, setAssets] = React.useState([]);

  React.useEffect(() => {
    // TODO: Replace with /assets API call
    setAssets(MOCK_ASSETS);
  }, []);

  const headers = [
    { key: "name", header: "Asset Name" },
    { key: "type", header: "Type" },
    { key: "cost", header: "Cost ($)" },
    { key: "cluster", header: "Cluster" },
  ];

  const rows = assets.map((asset, index) => ({
    id: String(index),
    name: asset.name,
    type: asset.type,
    cost: asset.costTotal.toFixed(2),
    cluster: asset.cluster,
  }));

  return (
    <Page active="assets.html">
      <Header headerTitle="Assets" />

      <Paper style={{ padding: 24 }}>
        <Typography variant="h5">Assets</Typography>
        <Typography variant="body2" style={{ marginTop: 8, marginBottom: 16 }}>
          Infrastructure assets and their associated costs.
        </Typography>

        <TableContainer title="Assets">
          <DataTable rows={rows} headers={headers}>
            {({ rows, headers, getTableProps }) => (
              <Table {...getTableProps()}>
                <TableHead>
                  <TableRow>
                    {headers.map((header) => (
                      <TableHeader key={header.key}>
                        {header.header}
                      </TableHeader>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.cells.map((cell) => (
                        <TableCell key={cell.id}>
                          {cell.value}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </DataTable>
        </TableContainer>
      </Paper>

      <Footer />
    </Page>
  );
};

export default React.memo(Assets);
