import { TableRow, TableCell } from "@carbon/react";

import { toCurrency } from "../../util";

const displayCurrencyAsLessThanPenny = (amount, currency) =>
  amount > 0 && amount < 0.01
    ? `<${toCurrency(0.01, currency)}`
    : toCurrency(amount, currency);

const CloudCostRow = ({
  cost,
  costSuffix,
  currency,
  drilldown,
  kubernetesPercent,
  name,
  row,
  sampleData,
}) => {
  function calculatePercent() {
    const totalPercent = (kubernetesPercent * 100).toFixed();
    return `${totalPercent}%`;
  }

  const whichPercent = sampleData
    ? `${(kubernetesPercent * 100).toFixed(1)}%`
    : calculatePercent();
  return (
    <TableRow onClick={() => drilldown(row)}>
      <TableCell
        style={{ cursor: "pointer", color: "#0f62fe", padding: "1rem" }}
      >
        {name}
      </TableCell>
      <TableCell style={{ textAlign: "right" }}>{whichPercent}</TableCell>
      {/* total cost */}
      <TableCell style={{ textAlign: "right", paddingRight: "2em" }}>
        {`${displayCurrencyAsLessThanPenny(cost, currency)}${costSuffix}`}
      </TableCell>
    </TableRow>
  );
};

export { CloudCostRow };
