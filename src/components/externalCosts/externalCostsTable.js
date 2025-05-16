import * as React from "react";
import { makeStyles } from "@material-ui/styles";
import {
  Typography,
  TableContainer,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Table,
  TableBody,
} from "@material-ui/core";
import { useLocation, useHistory } from "react-router";
import { toCurrency } from "../../util";
import { ExternalCostRow } from "./externalCostRow";
import { aggToKeyMapExternalCosts } from "./tokens";

const ExternalCostsTable = ({
  tableData,
  currency = "USD",
  aggregateBy = "usageUnit",
  drilldown,
}) => {
  const useStyles = makeStyles({
    noResults: {
      padding: 24,
    },
  });

  const classes = useStyles();

  const headCells = [
    {
      id: "aggregate",
      numeric: false,
      label: "Name",
      width: "auto",
    },
    {
      id: "costType",
      numeric: false,
      label: "Cost Type",
      width: 160,
    },
    {
      id: "cost",
      numeric: true,
      label: "Cost",
      width: 160,
    },
  ];

  const routerLocation = useLocation();
  const searchParams = new URLSearchParams(routerLocation.search);
  const routerHistory = useHistory();
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(25);
  const numData = tableData.customCosts?.length;

  const lastPage = Math.floor(numData / rowsPerPage);

  const handleChangePage = (event, newPage) => setPage(newPage);

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const pageRows = tableData.customCosts.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  React.useEffect(() => {
    setPage(0);
  }, [numData]);

  if (tableData.customCosts.length === 0) {
    return (
      <Typography variant="body2" className={classes.noResults}>
        No results
      </Typography>
    );
  }

  function dataToExternalCostRow(row) {
    return (
      <ExternalCostRow
        cost={row.cost}
        key={row.usage_unit}
        costType={row.cost_type}
        onClick={() =>
          // we don't want to allow drilldown on item without an empty name
          row[aggToKeyMapExternalCosts[aggregateBy]] ? drilldown(row) : {}
        }
        name={row[aggToKeyMapExternalCosts[aggregateBy]] || "Unallocated"}
      />
    );
  }
  const currentSortBy = searchParams.get("sortBy");
  const currentSortDirection = searchParams.get("sortDirection");

  return (
    <div id="cloud-cost-table">
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {headCells.map((cell) => (
                <TableCell
                  key={cell.id}
                  colSpan={cell.colspan}
                  align={cell.numeric ? "right" : "left"}
                  style={{ width: cell.width }}
                >
                  <TableSortLabel
                    active={currentSortBy === cell.id}
                    direction={currentSortBy === cell.id ? currentSortDirection : 'desc'}
                    onClick={() => {
                      if (currentSortBy === cell.id) {
                        // then we simply need to update direction
                        searchParams.set(
                          "sortDirection",
                          currentSortDirection === "desc" ? "asc" : "desc"
                        );
                      } else {
                        searchParams.set("sortBy", cell.id);
                        searchParams.set("sortDirection", "desc");
                      }
                      routerHistory.push({
                        search: `?${searchParams.toString()}`,
                      });
                    }}
                  >
                    {cell.label}
                  </TableSortLabel>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell align={"left"} style={{ fontWeight: 500 }}>
                {"Total Cost"}
              </TableCell>

              <TableCell
                align={"right"}
                style={{ fontWeight: 500, paddingRight: "2em" }}
              >
                {/* Cost Type */}
              </TableCell>
              <TableCell
                align={"right"}
                style={{ fontWeight: 500, paddingRight: "2em" }}
              >
                {toCurrency(tableData.totalCost || 0, currency)}
              </TableCell>
            </TableRow>
            {pageRows.map(dataToExternalCostRow)}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={numData}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[10, 25, 50]}
        page={Math.min(page, lastPage)}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </div>
  );
};

export default React.memo(ExternalCostsTable);
