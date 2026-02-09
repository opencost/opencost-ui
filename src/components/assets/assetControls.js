import React, { useMemo } from "react";
import { Button, Dropdown, Toggle } from "@carbon/react";
import { Download } from "@carbon/icons-react";
import { windowOptions, aggregationOptions } from "./tokens";
import { currencyCodes } from "../../constants/currencyCodes";
import { checkCustomWindow, toVerboseTimeRange } from "../../util";

const AssetControls = ({
  window,
  setWindow,
  aggregateBy,
  setAggregateBy,
  currency,
  setCurrency,
  onDownloadCSV,
  onCustomRange,
  showCharts,
  onToggleCharts,
}) => {
  const windowItems = useMemo(() => {
    if (checkCustomWindow(window)) {
      return [{ name: toVerboseTimeRange(window), value: window }, ...windowOptions];
    }
    return windowOptions;
  }, [window]);

  const selectedWindow = windowItems.find((opt) => opt.value === window) || windowItems[0];
  const selectedAggregation =
    aggregationOptions.find((opt) => opt.value === aggregateBy) || aggregationOptions[0];

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "12px",
        alignItems: "center",
        fontSize: "0.875rem",
      }}
    >
      <Toggle
        id="assets-charts-toggle"
        labelText="Charts"
        toggled={showCharts}
        onToggle={() => onToggleCharts && onToggleCharts()}
        size="sm"
      />

      <Dropdown
        id="assets-window"
        titleText="Window"
        label="Select window"
        items={windowItems}
        itemToString={(item) => (item ? item.name : "")}
        selectedItem={selectedWindow}
        size="sm"
        style={{ minWidth: 200 }}
        onChange={({ selectedItem }) => {
          if (!selectedItem) return;
          if (selectedItem.value === "custom") {
            if (onCustomRange) onCustomRange();
            return;
          }
          setWindow(selectedItem.value);
        }}
      />

      <Dropdown
        id="assets-aggregate"
        titleText="Aggregate By"
        label="Aggregate"
        items={aggregationOptions}
        itemToString={(item) => (item ? item.name : "")}
        selectedItem={selectedAggregation}
        size="sm"
        style={{ minWidth: 200 }}
        onChange={({ selectedItem }) => {
          if (selectedItem) setAggregateBy(selectedItem.value);
        }}
      />

      <Dropdown
        id="assets-currency"
        titleText="Currency"
        label="Currency"
        items={currencyCodes}
        itemToString={(item) => item || ""}
        selectedItem={currency}
        size="sm"
        style={{ minWidth: 140 }}
        onChange={({ selectedItem }) => {
          if (selectedItem) setCurrency(selectedItem);
        }}
      />

      <Button
        kind="ghost"
        size="sm"
        hasIconOnly
        renderIcon={Download}
        iconDescription="Download CSV"
        onClick={onDownloadCSV}
        style={{ alignSelf: "flex-end", marginTop: 24 }}
      />
    </div>
  );
};

export default AssetControls;
