import * as React from "react";
import { Dropdown } from "@carbon/react";

function EditCloudCostControls({
  windowOptions,
  window,
  setWindow,
  aggregationOptions,
  aggregateBy,
  setAggregateBy,
  costMetricOptions,
  costMetric,
  setCostMetric,
  currencyOptions,
  currency,
  setCurrency,
}) {
  const currencyItems = currencyOptions?.map((c) => ({ id: c, name: c })) || [];

  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: "0.75rem", flexWrap: "wrap", marginTop: "0.5rem" }}>
      <div style={{ minWidth: "140px" }}>
        <Dropdown
          id="date-range"
          titleText="Date Range"
          size="sm"
          items={windowOptions}
          itemToString={(item) => (item ? item.name : "")}
          selectedItem={windowOptions.find((o) => o.value === window) || windowOptions[0] || null}
          onChange={({ selectedItem }) =>
            setWindow(selectedItem?.value || window)
          }
        />
      </div>
      <div style={{ minWidth: "140px" }}>
        <Dropdown
          id="aggregation-select"
          titleText="Breakdown"
          size="sm"
          items={aggregationOptions}
          itemToString={(item) => (item ? item.name : "")}
          selectedItem={aggregationOptions.find((o) => o.value === aggregateBy) || aggregationOptions[0] || null}
          onChange={({ selectedItem }) =>
            setAggregateBy(selectedItem?.value || aggregateBy)
          }
        />
      </div>
      <div style={{ minWidth: "140px" }}>
        <Dropdown
          id="costMetric"
          titleText="Cost Metric"
          size="sm"
          items={costMetricOptions}
          itemToString={(item) => (item ? item.name : "")}
          selectedItem={costMetricOptions.find((o) => o.value === costMetric) || costMetricOptions[0] || null}
          onChange={({ selectedItem }) =>
            setCostMetric(selectedItem?.value || costMetric)
          }
        />
      </div>
      <div style={{ minWidth: "100px" }}>
        <Dropdown
          id="currency"
          titleText="Currency"
          size="sm"
          items={currencyItems}
          itemToString={(item) => (item ? item.name : "")}
          selectedItem={currencyItems.find((o) => o.id === currency) || currencyItems[0] || null}
          onChange={({ selectedItem }) =>
            setCurrency(selectedItem?.id || currency)
          }
        />
      </div>
    </div>
  );
}

export default React.memo(EditCloudCostControls);
