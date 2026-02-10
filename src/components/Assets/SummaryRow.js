import { StructuredListRow, StructuredListCell } from "@carbon/react";

const SummaryRow = ({ label, value }) => {
  if (value === undefined || value === null || value === "") return null;
  return (
    <StructuredListRow>
      <StructuredListCell
        className="bx--structured-list-content--nowrap"
        style={{ fontWeight: "bold", width: "30%" }}
      >
        {label}
      </StructuredListCell>
      <StructuredListCell>{value}</StructuredListCell>
    </StructuredListRow>
  );
};

export default SummaryRow;
