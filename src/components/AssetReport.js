import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { toCurrency } from "../util";

const AssetReport = ({ assets = [] }) => {
  if (!assets.length) return <Typography p={3}>No assets found.</Typography>;

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Properties</TableCell>
            <TableCell align="right">Cost</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {assets.map((row, i) => (
            <TableRow key={i}>
              <TableCell>{row.name}</TableCell>
              <TableCell>{row.type}</TableCell>
              <TableCell style={{ fontSize: "0.85em", color: "#666" }}>
                {row.properties
                  ? Object.entries(row.properties).map(([k, v]) => (
                      <div key={k}>
                        {k}: {v}
                      </div>
                    ))
                  : "-"}
              </TableCell>
              <TableCell align="right">{toCurrency(row.totalCost)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default AssetReport;
