import { Button } from "@carbon/react";
import { ChartColumn, ChartLineSmooth } from "@carbon/icons-react";

export type ChartMode = "bar" | "line";

interface ChartTypeToggleProps {
  mode: ChartMode;
  onChange: (mode: ChartMode) => void;
}

export function ChartTypeToggle({ mode, onChange }: ChartTypeToggleProps) {
  return (
    <div className="flex gap-1">
      <Button
        kind={mode === "bar" ? "primary" : "ghost"}
        size="sm"
        hasIconOnly
        renderIcon={ChartColumn}
        iconDescription="Bar chart"
        onClick={() => onChange("bar")}
      />
      <Button
        kind={mode === "line" ? "primary" : "ghost"}
        size="sm"
        hasIconOnly
        renderIcon={ChartLineSmooth}
        iconDescription="Line chart"
        onClick={() => onChange("line")}
      />
    </div>
  );
}
