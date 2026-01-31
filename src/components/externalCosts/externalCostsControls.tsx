import * as React from "react";
import { Dropdown } from "@carbon/react";

interface ExternalCostsControlsProps {
  windowOptions: Array<{ name: string; value: string }>;
  window: string;
  setWindow: (value: string) => void;
  aggregationOptions: Array<{ name: string; value: string }>;
  aggregateBy: string;
  setAggregateBy: (value: string) => void;
  title?: string;
  currency: string;
  currencyOptions: string[];
  setCurrency: (value: string) => void;
}

function ExternalCostsControls({
  windowOptions,
  window,
  setWindow,
  aggregationOptions,
  aggregateBy,
  setAggregateBy,
  currency,
  currencyOptions,
  setCurrency,
}: ExternalCostsControlsProps) {
  const currencyItems = currencyOptions.map((code) => ({
    name: code,
    value: code,
  }));

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        gap: "0.75rem",
        flexWrap: "wrap",
        marginTop: "0.5rem",
      }}
    >
      <div style={{ minWidth: "140px" }}>
        <Dropdown
          id="window-dropdown"
          titleText="Date Range"
          size="sm"
          items={windowOptions}
          itemToString={(item) => (item ? item.name : "")}
          selectedItem={
            windowOptions.find((opt) => opt.value === window) ||
            windowOptions[0] ||
            null
          }
          onChange={({ selectedItem }) => {
            if (selectedItem) setWindow(selectedItem.value);
          }}
          label={""}
        />
      </div>

      <div style={{ minWidth: "140px" }}>
        <Dropdown
          id="aggregate-dropdown"
          titleText="Aggregate By"
          size="sm"
          items={aggregationOptions}
          itemToString={(item) => (item ? item.name : "")}
          selectedItem={
            aggregationOptions.find((opt) => opt.value === aggregateBy) ||
            aggregationOptions[0] ||
            null
          }
          onChange={({ selectedItem }) => {
            if (selectedItem) setAggregateBy(selectedItem.value);
          }}
        />
      </div>

      <div style={{ minWidth: "100px" }}>
        <Dropdown
          id="currency-dropdown"
          titleText="Currency"
          size="sm"
          items={currencyItems}
          itemToString={(item) => (item ? item.name : "")}
          selectedItem={
            currencyItems.find((opt) => opt.value === currency) ||
            currencyItems[0] ||
            null
          }
          onChange={({ selectedItem }) => {
            if (selectedItem) setCurrency(selectedItem.value);
          }}
        />
      </div>
    </div>
  );
}

export default React.memo(ExternalCostsControls);
