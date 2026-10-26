import * as React from "react";

import Typography from "@mui/material/Typography";

import RangeChart from "./rangeChart";

const ExternalCostsChart = ({
  graphData,
  currency,
  //Cleaned up 'n' as it wasn't being used anywhere and just creating compile errors
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
