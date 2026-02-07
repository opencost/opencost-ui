import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Typography,
  Box,
  Collapse,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import SearchIcon from "@mui/icons-material/Search";
import { toCurrency } from "../../util";
import { formatBytes, formatMinutes } from "./tokens";

const TYPE_COLORS = {
  Node: "#0f62fe",
  Disk: "#8a3ffc",
  Network: "#0072c3",
  LoadBalancer: "#198038",
  Management: "#fa4d56",
  Other: "#878d96",
};

/**
 * AssetTableRow - Individual row with expandable breakdown
 */
const AssetTableRow = ({ asset, assetType, currency, onAssetClick }) => {
  const [open, setOpen] = React.useState(false);

  const hasBreakdown =
    (assetType === "Node" && (asset.cpuBreakdown || asset.ramBreakdown)) ||
    (assetType === "Disk" && asset.breakdown);

  return (
    <>
      <TableRow 
        sx={{ 
          "& > *": { borderBottom: "unset" },
          cursor: "pointer",
          "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.04)" }
        }}
        onClick={() => onAssetClick(asset)}
      >
        <TableCell onClick={(e) => e.stopPropagation()}>
          {hasBreakdown && (
            <IconButton
              aria-label="expand row"
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                setOpen(!open);
              }}
            >
              {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </IconButton>
          )}
        </TableCell>
        <TableCell>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Chip
              label={assetType}
              size="small"
              sx={{
                backgroundColor: TYPE_COLORS[assetType] || TYPE_COLORS.Other,
                color: "white",
                fontWeight: 600,
              }}
            />
            <Typography variant="body2">{asset.name || "Unknown"}</Typography>
          </Box>
        </TableCell>
        <TableCell>{asset.properties?.provider || "-"}</TableCell>
        <TableCell>{asset.properties?.cluster || "-"}</TableCell>
        <TableCell align="right">
          {toCurrency(asset.totalCost, currency)}
        </TableCell>
        <TableCell align="right">
          {asset.adjustment
            ? toCurrency(asset.adjustment, currency)
            : toCurrency(0, currency)}
        </TableCell>

        {/* Node-specific columns */}
        {assetType === "Node" && (
          <>
            <TableCell align="right">
              {asset.cpuCores ? asset.cpuCores.toFixed(2) : "-"}
            </TableCell>
            <TableCell align="right">
              {asset.ramBytes ? formatBytes(asset.ramBytes) : "-"}
            </TableCell>
            <TableCell align="right">
              {asset.cpuCost
                ? toCurrency(asset.cpuCost, currency)
                : toCurrency(0, currency)}
            </TableCell>
            <TableCell align="right">
              {asset.ramCost
                ? toCurrency(asset.ramCost, currency)
                : toCurrency(0, currency)}
            </TableCell>
          </>
        )}

        {/* Disk-specific columns */}
        {assetType === "Disk" && (
          <>
            <TableCell align="right">
              {asset.bytes ? formatBytes(asset.bytes) : "-"}
            </TableCell>
            <TableCell align="right">
              {asset.byteHours ? formatBytes(asset.byteHours) : "-"}
            </TableCell>
          </>
        )}

        {/* Network/LoadBalancer-specific columns */}
        {(assetType === "Network" || assetType === "LoadBalancer") && (
          <>
            <TableCell align="right">
              {asset.minutes ? formatMinutes(asset.minutes) : "-"}
            </TableCell>
            <TableCell>{asset.providerID || "-"}</TableCell>
          </>
        )}
      </TableRow>

      {/* Expandable breakdown row */}
      {hasBreakdown && (
        <TableRow>
          <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={12}>
            <Collapse in={open} timeout="auto" unmountOnExit>
              <Box sx={{ margin: 1 }}>
                <Typography variant="h6" gutterBottom component="div">
                  Cost Breakdown
                </Typography>
                {assetType === "Node" && (
                  <>
                    {asset.cpuBreakdown && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2">
                          CPU Breakdown:
                        </Typography>
                        <Typography variant="body2">
                          Idle: {toCurrency(asset.cpuBreakdown.idle, currency)}{" "}
                          | Used:{" "}
                          {toCurrency(asset.cpuBreakdown.used, currency)} |
                          System:{" "}
                          {toCurrency(asset.cpuBreakdown.system, currency)}
                        </Typography>
                      </Box>
                    )}
                    {asset.ramBreakdown && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2">
                          RAM Breakdown:
                        </Typography>
                        <Typography variant="body2">
                          Idle: {toCurrency(asset.ramBreakdown.idle, currency)}{" "}
                          | Used:{" "}
                          {toCurrency(asset.ramBreakdown.used, currency)} |
                          System:{" "}
                          {toCurrency(asset.ramBreakdown.system, currency)}
                        </Typography>
                      </Box>
                    )}
                  </>
                )}
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      )}
    </>
  );
};

/**
 * AssetTable - Main table component for displaying assets
 */
const AssetTable = ({ assets = [], assetType, currency = "USD", loading, onAssetClick }) => {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(25);
  const [orderBy, setOrderBy] = React.useState("totalCost");
  const [order, setOrder] = React.useState("desc");
  const [searchQuery, setSearchQuery] = React.useState("");

  // Define columns based on asset type
  const getColumns = () => {
    const baseColumns = [
      { id: "expand", label: "", width: 50, sortable: false },
      { id: "name", label: "Name", width: "auto", sortable: true },
      { id: "provider", label: "Provider", width: 150, sortable: true },
      { id: "cluster", label: "Cluster", width: 150, sortable: true },
      {
        id: "totalCost",
        label: "Total Cost",
        width: 150,
        numeric: true,
        sortable: true,
      },
      {
        id: "adjustment",
        label: "Adjustment",
        width: 150,
        numeric: true,
        sortable: true,
      },
    ];

    if (assetType === "Node") {
      return [
        ...baseColumns,
        {
          id: "cpuCores",
          label: "CPU Cores",
          width: 120,
          numeric: true,
          sortable: true,
        },
        {
          id: "ramBytes",
          label: "RAM",
          width: 120,
          numeric: true,
          sortable: true,
        },
        {
          id: "cpuCost",
          label: "CPU Cost",
          width: 120,
          numeric: true,
          sortable: true,
        },
        {
          id: "ramCost",
          label: "RAM Cost",
          width: 120,
          numeric: true,
          sortable: true,
        },
      ];
    }

    if (assetType === "Disk") {
      return [
        ...baseColumns,
        {
          id: "bytes",
          label: "Size",
          width: 120,
          numeric: true,
          sortable: true,
        },
        {
          id: "byteHours",
          label: "Byte Hours",
          width: 120,
          numeric: true,
          sortable: true,
        },
      ];
    }

    if (assetType === "Network" || assetType === "LoadBalancer") {
      return [
        ...baseColumns,
        {
          id: "minutes",
          label: "Runtime",
          width: 120,
          numeric: true,
          sortable: true,
        },
        {
          id: "providerID",
          label: "Provider ID",
          width: 200,
          sortable: false,
        },
      ];
    }

    return baseColumns;
  };

  const columns = getColumns();

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Sort and paginate data
  const sortedAssets = React.useMemo(() => {
    if (!assets || assets.length === 0) return [];

    // Apply search filter
    let filtered = assets;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = assets.filter((asset) => {
        return (
          asset.name?.toLowerCase().includes(query) ||
          asset.type?.toLowerCase().includes(query) ||
          asset.properties?.provider?.toLowerCase().includes(query) ||
          asset.properties?.cluster?.toLowerCase().includes(query)
        );
      });
    }

    const sorted = [...filtered].sort((a, b) => {
      let aVal = a[orderBy];
      let bVal = b[orderBy];

      // Handle nested properties
      if (orderBy === "provider") {
        aVal = a.properties?.provider || "";
        bVal = b.properties?.provider || "";
      } else if (orderBy === "cluster") {
        aVal = a.properties?.cluster || "";
        bVal = b.properties?.cluster || "";
      }

      // Handle missing values
      if (aVal === undefined || aVal === null) aVal = 0;
      if (bVal === undefined || bVal === null) bVal = 0;

      if (typeof aVal === "string") {
        return order === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      return order === "asc" ? aVal - bVal : bVal - aVal;
    });

    return sorted;
  }, [assets, order, orderBy, searchQuery]);

  const paginatedAssets = sortedAssets.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  if (!assets || assets.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="body2">
          No {assetType.toLowerCase()} assets found for this time period.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Search bar */}
      <Box sx={{ mb: 2, px: 2, pt: 2 }}>
        <TextField
          fullWidth
          placeholder={`Search ${assetType.toLowerCase()} assets...`}
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setPage(0); // Reset to first page on search
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          size="small"
        />
      </Box>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.numeric ? "right" : "left"}
                  style={{ width: column.width, fontWeight: 600 }}
                  sortDirection={orderBy === column.id ? order : false}
                >
                  {column.sortable !== false ? (
                    <TableSortLabel
                      active={orderBy === column.id}
                      direction={orderBy === column.id ? order : "asc"}
                      onClick={() => handleRequestSort(column.id)}
                    >
                      {column.label}
                    </TableSortLabel>
                  ) : (
                    column.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedAssets.map((asset, index) => (
              <AssetTableRow
                key={`${asset.name}-${index}`}
                asset={asset}
                assetType={assetType}
                currency={currency}
                onAssetClick={onAssetClick}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 25, 50, 100]}
        component="div"
        count={sortedAssets.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Box>
  );
};

export default AssetTable;
