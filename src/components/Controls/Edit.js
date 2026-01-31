import React from "react";
import { Dropdown } from "@carbon/react";

import SelectWindow from "../SelectWindow";

function EditControl({
  windowOptions,
  window,
  setWindow,
  aggregationOptions,
  aggregateBy,
  setAggregateBy,
  accumulateOptions,
  accumulate,
  setAccumulate,
  currencyOptions,
  currency,
  setCurrency,
}) {
  const breakdownItems = aggregationOptions.map((opt) => ({
    id: opt.value,
    text: opt.name,
    value: opt.value,
  }));

  const resolutionItems = accumulateOptions.map((opt) => ({
    id: opt.value,
    text: opt.name,
    value: opt.value,
  }));

  const currencyItems = currencyOptions?.map((curr) => ({
    id: curr,
    text: curr,
    value: curr,
  })) || [];

  const selectedBreakdown = breakdownItems.find((item) => item.value === aggregateBy);
  const selectedResolution = resolutionItems.find((item) => item.value === accumulate);
  const selectedCurrency = currencyItems.find((item) => item.value === currency);

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
        id="accumulate"
        titleText="Resolution"
        label="Resolution"
        items={resolutionItems}
        itemToString={(item) => (item ? item.text : "")}
        selectedItem={selectedResolution}
        onChange={({ selectedItem }) => {
          if (selectedItem) {
            setAccumulate(selectedItem.value);
          }
        }}
        style={{ minWidth: 120 }}
      />
      <Dropdown
        id="currency"
        titleText="Currency"
        label="Currency"
        items={currencyItems}
        itemToString={(item) => (item ? item.text : "")}
        selectedItem={selectedCurrency}
        onChange={({ selectedItem }) => {
          if (selectedItem) {
            setCurrency(selectedItem.value);
          }
        }}
        style={{ minWidth: 120 }}
      />
    </div>
  );
}

export default React.memo(EditControl);
