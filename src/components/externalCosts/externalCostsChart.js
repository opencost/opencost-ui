import * as React from "react";

import Typography from "@material-ui/core/Typography";

import RangeChart from "./rangeChart";

const ExternalCostsChart = ({
  graphData,
  currency,
  n,
  height,
  aggregateBy,
}) => {
  if (graphData.length === 0) {
    return (
      <Typography variant="body2" style={{ padding: "4em" }}>
        No data
      </Typography>
    );
  }
  return (
    <RangeChart
      data={graphData}
      currency={currency}
      height={height}
      aggregateBy={aggregateBy}
    />
  );
};

export default React.memo(ExternalCostsChart);
