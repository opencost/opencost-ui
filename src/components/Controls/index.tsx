import React from "react";
import { Dropdown } from "@carbon/react";
import DownloadControl from "./Download";

interface ControlsProps {
  windowOptions: Array<{ name: string; value: string }>;
  window: string;
  setWindow: (value: string) => void;
  aggregationOptions: Array<{ name: string; value: string }>;
  aggregateBy: string;
  setAggregateBy: (value: string) => void;
  accumulateOptions: Array<{ name: string; value: boolean }>;
  accumulate: boolean;
  setAccumulate: (value: boolean) => void;
  title: string;
  cumulativeData: any[];
  currency: string;
  currencyOptions: string[];
  setCurrency: (value: string) => void;
}

const Controls: React.FC<ControlsProps> = ({
  windowOptions,
  window,
  setWindow,
  aggregationOptions,
  aggregateBy,
  setAggregateBy,
  accumulateOptions,
  accumulate,
  setAccumulate,
  title,
  cumulativeData,
  currency,
  currencyOptions,
  setCurrency,
}) => {
  const currencyItems = currencyOptions.map((code) => ({ id: code, name: code }));

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
          id="aggregate-by"
          titleText="Aggregate By"
          size="sm"
          items={aggregationOptions}
          itemToString={(item) => (item ? item.name : "")}
          selectedItem={aggregationOptions.find((o) => o.value === aggregateBy) || aggregationOptions[0] || null}
          onChange={({ selectedItem }) =>
            setAggregateBy(selectedItem?.value || aggregateBy)
          }
        />
      </div>

      <div style={{ minWidth: "120px" }}>
        <Dropdown
          id="accumulate"
          titleText="Accumulate"
          size="sm"
          items={accumulateOptions}
          itemToString={(item) => (item ? item.name : "")}
          selectedItem={accumulateOptions.find((o) => o.value === accumulate) || accumulateOptions[0] || null}
          onChange={({ selectedItem }) =>
            setAccumulate(selectedItem?.value ?? accumulate)
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

      <DownloadControl cumulativeData={cumulativeData} title={title} />
    </div>
  );
};

export default React.memo(Controls);
