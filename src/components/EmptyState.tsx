import React from "react";
import { Button } from "@carbon/react";
import { Renew, DataTable, ChartBar } from "@carbon/icons-react";

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: "chart" | "table" | "data";
  onRetry?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title = "No data available",
  description = "There's no data to display for the selected time range or filters.",
  icon = "data",
  onRetry,
}) => {
  const IconComponent = icon === "chart" ? ChartBar : icon === "table" ? DataTable : DataTable;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "3rem 2rem",
        textAlign: "center",
        minHeight: "250px",
      }}
    >
      <div
        style={{
          width: "64px",
          height: "64px",
          borderRadius: "50%",
          backgroundColor: "var(--cds-layer-02, #e0e0e0)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "1.5rem",
        }}
      >
        <IconComponent size={32} style={{ color: "var(--cds-text-secondary)" }} />
      </div>
      <h4
        style={{
          fontSize: "1.25rem",
          fontWeight: 600,
          color: "var(--cds-text-primary)",
          marginBottom: "0.5rem",
        }}
      >
        {title}
      </h4>
      <p
        style={{
          color: "var(--cds-text-secondary)",
          marginBottom: onRetry ? "1.5rem" : "0",
          maxWidth: "350px",
          lineHeight: 1.5,
        }}
      >
        {description}
      </p>
      {onRetry && (
        <Button
          kind="tertiary"
          size="sm"
          renderIcon={() => <Renew size={16} />}
          onClick={onRetry}
        >
          Try Again
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
