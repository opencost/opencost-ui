import { TableRow, TableCell } from "@carbon/react";

import { toCurrency } from "../../util";

const displayCurrencyAsLessThanPenny = (amount, currency) =>
  amount > 0 && amount < 0.01
    ? `<${toCurrency(0.01, currency)}`
    : toCurrency(amount, currency);

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

const ExternalCostRow = ({ cost, currency, onClick, name, costType }) => {
  return (
    <TableRow onClick={onClick}>
      <TableCell
        style={{ cursor: "pointer", color: "#0f62fe", padding: "1rem" }}
      >
        {name}
      </TableCell>
      <TableCell style={{ textAlign: "right", paddingRight: "2em" }}>
        {capitalizeFirstLetter(costType)}
      </TableCell>
      {/* total cost */}
      <TableCell style={{ textAlign: "right", paddingRight: "2em" }}>
        {`${displayCurrencyAsLessThanPenny(cost, currency)}`}
      </TableCell>
    </TableRow>
  );
};

export { ExternalCostRow };
