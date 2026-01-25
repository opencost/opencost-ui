import * as React from "react";
import Page from "../components/Page";
import Header from "../components/Header";
import Footer from "../components/Footer";
import IconButton from "@mui/material/IconButton";
import RefreshIcon from "@mui/icons-material/Refresh";
import { Paper, Typography } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import {
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router";

import Warnings from "../components/Warnings";
import Subtitle from "../components/Subtitle";
import AssetsService from "../services/assets";
import { toCurrency } from "../util";
import { windowOptions } from "../components/cloudCost/tokens";
import { currencyCodes } from "../constants/currencyCodes";
import SelectWindow from "../components/SelectWindow";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";

const Assets = () => {
  const [window, setWindow] = React.useState(windowOptions[0].value);
  const [currency, setCurrency] = React.useState("USD");

  // page and settings state
  const [init, setInit] = React.useState(false);
  const [fetch, setFetch] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [errors, setErrors] = React.useState([]);

  // data
  const [assetsData, setAssetsData] = React.useState([]);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(25);

  // parse any context information from the URL
  const routerLocation = useLocation();
  const searchParams = new URLSearchParams(routerLocation.search);
  const navigate = useNavigate();

  async function initialize() {
    setInit(true);
  }

  async function fetchData() {
    setLoading(true);
    setErrors([]);
    try {
      const resp = await AssetsService.fetchAssets(window);
      if (resp && resp.data) {
        // Convert the assets object to an array
        const assetsArray = Object.entries(resp.data).map(([key, value]) => ({
          key,
          ...value,
        }));
        setAssetsData(assetsArray);
      } else {
        setAssetsData([]);
      }
    } catch (err) {
      console.log(err);
      const errorMessage = err.response?.data?.error || err.message || "";
      if (errorMessage.indexOf("404") >= 0 || err.response?.status === 404) {
        setErrors([
          {
            primary: "Failed to load assets data",
            secondary:
              "Please update OpenCost to the latest version, and open an Issue if problems persist.",
          },
        ]);
      } else {
        let secondary =
          "Please open an Issue with OpenCost if problems persist.";
        if (errorMessage.length > 0) {
          secondary = errorMessage;
        }
        setErrors([
          {
            primary: "Failed to load assets data",
            secondary: secondary,
          },
        ]);
      }
      setAssetsData([]);
    }
    setLoading(false);
  }

  React.useEffect(() => {
    setWindow(searchParams.get("window") || windowOptions[0].value);
    setCurrency(searchParams.get("currency") || "USD");
  }, [routerLocation]);

  // Initialize once, then fetch report each time setFetch(true) is called
  React.useEffect(() => {
    if (!init) {
      initialize();
    }
    if (init || fetch) {
      fetchData();
    }
  }, [init, fetch]);

  React.useEffect(() => {
    setFetch(!fetch);
  }, [window]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Calculate totals
  const totalCost = React.useMemo(() => {
    return assetsData.reduce((sum, asset) => {
      return sum + (asset.totalCost || 0);
    }, 0);
  }, [assetsData]);

  const pageRows = assetsData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  const getAssetName = (asset) => {
    if (asset.properties) {
      return (
        asset.properties.name ||
        asset.properties.cluster ||
        asset.properties.providerID ||
        asset.key
      );
    }
    return asset.key;
  };

  const getAssetType = (asset) => {
    return asset.type || asset.properties?.category || "Unknown";
  };

  const getProvider = (asset) => {
    return asset.properties?.provider || "Unknown";
  };

  const getCluster = (asset) => {
    return asset.properties?.cluster || "-";
  };

  return (
    <Page active="/assets">
      <Header headerTitle="Assets">
        <IconButton
          aria-label="refresh"
          onClick={() => setFetch(true)}
          style={{ padding: 12 }}
        >
          <RefreshIcon />
        </IconButton>
      </Header>
      {!loading && errors.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <Warnings warnings={errors} />
        </div>
      )}
      {init && (
        <Paper id="assets">
          <div style={{ display: "flex", flexFlow: "row", padding: 24 }}>
            <div style={{ flexGrow: 1 }}>
              <Typography variant="h5">Infrastructure Assets</Typography>
              <Subtitle report={{ window }} />
            </div>
            <div style={{ display: "inline-flex" }}>
              <SelectWindow
                windowOptions={windowOptions}
                window={window}
                setWindow={(win) => {
                  searchParams.set("window", win);
                  navigate({
                    search: `?${searchParams.toString()}`,
                  });
                }}
              />
              <FormControl style={{ margin: 8, minWidth: 120 }} variant="standard">
                <InputLabel id="currency-label">Currency</InputLabel>
                <Select
                  id="currency"
                  value={currency}
                  onChange={(e) => {
                    searchParams.set("currency", e.target.value);
                    navigate({
                      search: `?${searchParams.toString()}`,
                    });
                  }}
                >
                  {currencyCodes?.map((curr) => (
                    <MenuItem key={curr} value={curr}>
                      {curr}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
          </div>

          {loading && (
            <div style={{ display: "flex", justifyContent: "center" }}>
              <div style={{ paddingTop: 100, paddingBottom: 100 }}>
                <CircularProgress />
              </div>
            </div>
          )}

          {!loading && (
            <>
              {assetsData.length === 0 ? (
                <Typography variant="body2" sx={{ padding: 24 }}>
                  No assets found
                </Typography>
              ) : (
                <>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell align="left">Name</TableCell>
                          <TableCell align="left">Type</TableCell>
                          <TableCell align="left">Provider</TableCell>
                          <TableCell align="left">Cluster</TableCell>
                          <TableCell align="right">Total Cost</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell
                            align="left"
                            style={{ fontWeight: 500 }}
                            colSpan={4}
                          >
                            Total Cost
                          </TableCell>
                          <TableCell
                            align="right"
                            style={{ fontWeight: 500, paddingRight: "2em" }}
                          >
                            {toCurrency(totalCost, currency)}
                          </TableCell>
                        </TableRow>
                        {pageRows.map((asset, index) => (
                          <TableRow key={asset.key || index} hover>
                            <TableCell align="left">
                              {getAssetName(asset)}
                            </TableCell>
                            <TableCell align="left">
                              {getAssetType(asset)}
                            </TableCell>
                            <TableCell align="left">
                              {getProvider(asset)}
                            </TableCell>
                            <TableCell align="left">
                              {getCluster(asset)}
                            </TableCell>
                            <TableCell align="right">
                              {toCurrency(asset.totalCost || 0, currency)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <TablePagination
                    component="div"
                    count={assetsData.length}
                    rowsPerPage={rowsPerPage}
                    rowsPerPageOptions={[10, 25, 50]}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                  />
                </>
              )}
            </>
          )}
        </Paper>
      )}
      <Footer />
    </Page>
  );
};

export default React.memo(Assets);
