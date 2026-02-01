import React from "react";
import { get, forEach, reverse, round, sortBy } from "lodash";
import { Button } from "@carbon/react";
import { Download } from "@carbon/icons-react";
import { AllocationData } from "../../types/allocation";

interface DownloadControlProps {
  cumulativeData: AllocationData[];
  title: string;
}

interface Column {
  head: string;
  prop: keyof AllocationData | string;
  currency: boolean;
}

const columns: Column[] = [
  {
    head: "Name",
    prop: "name",
    currency: false,
  },
  {
    head: "CPU",
    prop: "cpuCost",
    currency: true,
  },
  {
    head: "GPU",
    prop: "gpuCost",
    currency: true,
  },
  {
    head: "RAM",
    prop: "ramCost",
    currency: true,
  },
  {
    head: "PV",
    prop: "pvCost",
    currency: true,
  },
  {
    head: "Network",
    prop: "networkCost",
    currency: true,
  },
  {
    head: "Shared",
    prop: "sharedCost",
    currency: true,
  },
  {
    head: "Total",
    prop: "totalCost",
    currency: true,
  },
];

const toCSVLine = (datum: AllocationData): string => {
  const cols: (string | number)[] = [];

  forEach(columns, (c) => {
    if (c.currency) {
      cols.push(round(get(datum, c.prop, 0.0), 2));
    } else {
      cols.push(`"${get(datum, c.prop, "")}"`);
    }
  });

  return cols.join(",");
};

const DownloadControl: React.FC<DownloadControlProps> = ({ cumulativeData, title }) => {
  // downloadReport downloads a CSV of the cumulative allocation data
  function downloadReport() {
    // Build CSV
    const head = columns.map((c) => c.head).join(",");
    const body = reverse(sortBy(cumulativeData, "totalCost"))
      .map(toCSVLine)
      .join("\r\n");
    const csv = `${head}\r\n${body}`;

    // Create download link
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const filename = title.toLowerCase().replace(/\s/gi, "-");
    a.setAttribute("download", `${filename}-${Date.now()}.csv`);

    // Click the link
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    
    // Cleanup after a short delay
    setTimeout(() => {
      if (a.parentNode) {
        document.body.removeChild(a);
      }
      URL.revokeObjectURL(a.href);
    }, 100);
  }

  return (
    <Button
      kind="ghost"
      size="md"
      renderIcon={Download}
      iconDescription="Download CSV"
      onClick={downloadReport}
      hasIconOnly
      tooltipPosition="bottom"
    />
  );
};

export default React.memo(DownloadControl);
