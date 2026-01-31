import * as React from "react";
import { Dropdown } from "@carbon/react";

import SelectWindow from "../../components/SelectWindow";
import {
  windowOptions,
  aggregationOptions,
  costTypeOptions,
} from "../../components/externalCosts/tokens";

function ExternalCostsControls({
  window,
  setWindow,
  aggregateBy,
  setAggregateBy,
  costType,
  setCostType,
}) {
  const breakdownItems = aggregationOptions.map((opt) => ({
    id: opt.value,
    text: opt.name,
    value: opt.value,
  }));

  const costTypeItems = costTypeOptions.map((opt) => ({
    id: opt.value,
    text: opt.name,
    value: opt.value,
  }));

  const selectedBreakdown = breakdownItems.find((item) => item.value === aggregateBy);
  const selectedCostType = costTypeItems.find((item) => item.value === costType);

  return (
    <div style={{ display: "inline-flex", gap: "0.5rem", alignItems: "flex-end" }}>
      <SelectWindow
        windowOptions={windowOptions}
        window={window}
        setWindow={setWindow}
      />
      <Dropdown
        id="aggregation-select"
        titleText="Breakdown"
        label="Breakdown"
        items={breakdownItems}
        itemToString={(item) => (item ? item.text : "")}
        selectedItem={selectedBreakdown}
        onChange={({ selectedItem }) => {
          if (selectedItem) {
            setAggregateBy(selectedItem.value);
          }
        }}
        style={{ minWidth: 120 }}
      />
      <Dropdown
        id="cost-type-select"
        titleText="Cost Type"
        label="Cost Type"
        items={costTypeItems}
        itemToString={(item) => (item ? item.text : "")}
        selectedItem={selectedCostType}
        onChange={({ selectedItem }) => {
          if (selectedItem) {
            setCostType(selectedItem.value);
          }
        }}
        style={{ minWidth: 120 }}
      />
    </div>
  );
}

export default React.memo(ExternalCostsControls);
