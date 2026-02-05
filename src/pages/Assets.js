import * as React from "react";
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Divider,
} from "@mui/material";

import Page from "../components/Page";
import SelectWindow from "../components/SelectWindow";
import { fetchAssets } from "../services/assets";

const windowOptions = [
  { label: "Today", value: "today" },
  { label: "Last 7 days", value: "7d" },
  { label: "Last 14 days", value: "14d" },
  { label: "Last 30 days", value: "30d" },
];

const Assets = () => {
  const [timeWindow, setTimeWindow] = React.useState("7d");
  const [assets, setAssets] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const totalAssets = assets.length;
  const totalCost = assets.reduce(
    (sum, asset) => sum + (asset.totalCost || 0),
    0
  );

  React.useEffect(() => {
    let mounted = true;

    const loadAssets = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await fetchAssets({
          window: timeWindow,
          currency: "USD",
        });

        if (mounted) {
          setAssets(result.assets || []);
          setPage(0); 
        }
      } catch (err) {
        if (mounted) {
          setError(err);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadAssets();

    return () => {
      mounted = false;
    };
  }, [timeWindow]);

  return (
    <Page title="Assets">
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Typography variant="h5">Assets</Typography>

        <SelectWindow
          window={timeWindow}
          setWindow={setTimeWindow}
          windowOptions={windowOptions}
        />
      </Box>

      <Paper elevation={1} sx={{ padding: "1rem" }}>
        {loading && (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Typography color="error">
            Failed to load assets data. Please ensure the OpenCost backend is running.
          </Typography>
        )}

        {!loading && !error && (
          <>
            <Box mb={2}>
              <Typography variant="subtitle2" color="text.secondary">
                Summary
              </Typography>

              <Box
                display="grid"
                gridTemplateColumns="repeat(3, 1fr)"
                gap={2}
                mt={1}
              >
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Total Assets
                  </Typography>
                  <Typography variant="h6">
                    {totalAssets}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Total Cost (USD)
                  </Typography>
                  <Typography variant="h6">
                    ${totalCost.toFixed(2)}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Time Window
                  </Typography>
                  <Typography variant="h6">
                    {windowOptions.find(w => w.value === timeWindow)?.label}
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Divider />

            {/*  Assets Table */}
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Provider</TableCell>
                    <TableCell>Cluster</TableCell>
                    <TableCell align="right">Total Cost (USD)</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {assets.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        No assets found for selected window
                      </TableCell>
                    </TableRow>
                  )}

                  {assets
                    .slice(
                      page * rowsPerPage,
                      page * rowsPerPage + rowsPerPage
                    )
                    .map((asset, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{asset.name || "-"}</TableCell>
                        <TableCell>{asset.type || "-"}</TableCell>
                        <TableCell>{asset.provider || "-"}</TableCell>
                        <TableCell>{asset.cluster || "-"}</TableCell>
                        <TableCell align="right">
                          {asset.totalCost?.toFixed(2) ?? "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>

              <TablePagination
                component="div"
                count={assets.length}
                page={page}
                onPageChange={(e, newPage) => setPage(newPage)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10));
                  setPage(0);
                }}
                rowsPerPageOptions={[10, 25, 50]}
              />
            </TableContainer>
          </>
        )}
      </Paper>
    </Page>
  );
};

export default Assets;
