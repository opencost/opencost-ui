import React, { useState, useEffect } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import { toCurrency } from "../../util";

const AssetsTable = ({ assetsData, currency = "USD" }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [searchTerm, setSearchTerm] = useState("");

  const headers = [
    { id: "name", label: "Name", align: "left" },
    { id: "type", label: "Type", align: "left" },
    { id: "category", label: "Category", align: "left" },
    { id: "provider", label: "Provider", align: "left" },
    { id: "providerId", label: "Provider ID", align: "left" },
    { id: "service", label: "Service", align: "left" },
    { id: "cluster", label: "Cluster", align: "left" },
    { id: "totalCost", label: "Total Cost", align: "right" },
  ];

  // Transform assets data into table rows
  const allRows = React.useMemo(() => {
    if (!assetsData || typeof assetsData !== 'object') return [];

    const rows = [];
    
    Object.entries(assetsData).forEach(([assetKey, asset]) => {
      if (!asset || typeof asset !== 'object' || !asset.type) {
        return;
      }
      
      // Calculate total cost
      let cost = 0;
      if (typeof asset.totalCost === 'number') {
        cost = asset.totalCost;
      } else {
        cost = (asset.cpuCost || 0) + 
               (asset.ramCost || 0) + 
               (asset.gpuCost || 0) + 
               (asset.pvCost || 0) +
               (asset.networkCost || 0) +
               (asset.loadBalancerCost || 0) +
               (asset.sharedCost || 0) +
               (asset.externalCost || 0);
      }
      
      rows.push({
        id: assetKey,
        name: asset.properties?.name || asset.name || assetKey.split('/').pop() || 'Unknown',
        type: asset.type || "N/A",
        category: asset.properties?.category || asset.category || "N/A",
        provider: asset.properties?.provider || asset.provider || "N/A",
        providerId: asset.properties?.providerID || asset.providerID || "N/A",
        service: asset.properties?.service || asset.service || "N/A",
        cluster: asset.properties?.cluster || asset.cluster || "N/A",
        totalCost: toCurrency(cost, currency),
        totalCostValue: cost,
      });
    });

    return rows.sort((a, b) => b.totalCostValue - a.totalCostValue);
  }, [assetsData, currency]);

  // Filter rows based on search
  const filteredRows = React.useMemo(() => {
    if (!searchTerm) return allRows;
    
    const term = searchTerm.toLowerCase();
    return allRows.filter(row => 
      row.name.toLowerCase().includes(term) ||
      row.type.toLowerCase().includes(term) ||
      row.category.toLowerCase().includes(term) ||
      row.provider.toLowerCase().includes(term) ||
      row.providerId.toLowerCase().includes(term) ||
      row.service.toLowerCase().includes(term) ||
      row.cluster.toLowerCase().includes(term)
    );
  }, [allRows, searchTerm]);

  useEffect(() => {
    setPage(0);
  }, [filteredRows.length]);

  const paginatedRows = filteredRows.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (allRows.length === 0) {
    return (
      <Paper style={{ padding: "2rem", textAlign: "center", marginTop: "2rem" }}>
        No asset data available
      </Paper>
    );
  }

  return (
    <Paper style={{ marginTop: "2rem" }}>
      <div style={{ padding: "1rem 1.5rem", borderBottom: "1px solid #e0e0e0" }}>
        <h3 style={{ margin: "0 0 1rem 0", fontSize: "1.25rem", fontWeight: "500" }}>
          Infrastructure Assets
        </h3>
        <TextField
          placeholder="Search assets..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          variant="outlined"
          size="small"
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </div>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {headers.map((header) => (
                <TableCell
                  key={header.id}
                  align={header.align}
                  style={{ fontWeight: 600 }}
                >
                  {header.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedRows.map((row) => (
              <TableRow key={row.id} hover>
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.type}</TableCell>
                <TableCell>{row.category}</TableCell>
                <TableCell>{row.provider}</TableCell>
                <TableCell>{row.providerId}</TableCell>
                <TableCell>{row.service}</TableCell>
                <TableCell>{row.cluster}</TableCell>
                <TableCell align="right" style={{ fontWeight: 500 }}>
                  {row.totalCost}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[10, 25, 50, 100]}
        component="div"
        count={filteredRows.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
};

export default AssetsTable;
