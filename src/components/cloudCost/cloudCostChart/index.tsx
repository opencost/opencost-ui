import * as React from "react";

import RangeChart from "./rangeChart";

const CloudCostChart = ({ graphData, currency, n, height }) => {
  if (graphData.length === 0) {
    return <p style={{ fontSize: "0.875rem", color: "var(--cds-text-secondary)" }}>No data</p>;
  }
  return <RangeChart data={graphData} currency={currency} height={height} />;
};

export default React.memo(CloudCostChart);
