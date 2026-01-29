import React from "react";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import { round } from "lodash";
import { toCurrency } from "../../util";

const AssetsRow = ({ row, currency = "USD", drilldown }) => {
  const handleClick = () => {
    if (drilldown) {
      drilldown(row);
    }
  };

  return (
    <TableRow
      hover
      onClick={handleClick}
      sx={{
        cursor: drilldown ? "pointer" : "default",
        "&:hover": {
          backgroundColor: "#f5f5f5",
        },
      }}
    >
      <TableCell>{row.name || "Unknown"}</TableCell>
      <TableCell>{row.type || "-"}</TableCell>
      <TableCell align="right">{toCurrency(row.cpuCost || 0, currency)}</TableCell>
      <TableCell align="right">{toCurrency(row.gpuCost || 0, currency)}</TableCell>
      <TableCell align="right">{toCurrency(row.ramCost || 0, currency)}</TableCell>
      <TableCell align="right">
        {row.adjustment ? toCurrency(row.adjustment, currency) : "-"}
      </TableCell>
      <TableCell align="right" sx={{ fontWeight: 500 }}>
        {toCurrency(row.totalCost || 0, currency)}
      </TableCell>
    </TableRow>
  );
};

export default AssetsRow;
