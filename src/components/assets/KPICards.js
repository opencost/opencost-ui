import PropTypes from "prop-types";
import { Money, WarningAlt, ChartBar, Folder } from "@carbon/icons-react";
import StatCard from "../shared/StatCard";
import {
  getTotalCost,
  getTotalWastedCost,
  calculateEfficiencyScore,
  formatCurrency,
  parseDays,
} from "../../utils/assetCalculations";

function windowLabel(timeWindow) {
  const days = parseDays(timeWindow);
  return `Last ${days} days`;
}

const KPICards = ({ assets, timeWindow }) => {
  const totalCost = getTotalCost(assets);
  const wastedCost = getTotalWastedCost(assets);
  const efficiencyScore = calculateEfficiencyScore(assets);
  const assetCount = assets.length;

  const getEfficiencyColor = (score) => {
    if (score >= 80) return "var(--cds-support-success)";
    if (score >= 50) return "var(--color-warning-badge-bg)";
    return "var(--cds-support-error)";
  };

  const period = windowLabel(timeWindow);
  const pvcCount = assets.filter((a) => a.assetType === "PVC").length;
  const nodeCount = assets.filter((a) => a.assetType === "Node Disk").length;

  return (
    <div className="kpi-cards-container">
      <StatCard
        icon={Money}
        label="Total Storage Cost"
        value={formatCurrency(totalCost)}
        subtitle={period}
      />

      <StatCard
        icon={WarningAlt}
        label="Wasted Cost"
        value={formatCurrency(wastedCost)}
        valueColor="var(--cds-support-error)"
        subtitle={`${totalCost > 0 ? ((wastedCost / totalCost) * 100).toFixed(1) : 0}% of total`}
        className="kpi-waste"
      />

      <StatCard
        icon={ChartBar}
        label="Efficiency Score"
        value={`${efficiencyScore}%`}
        valueColor={getEfficiencyColor(efficiencyScore)}
        subtitle={efficiencyScore >= 80 ? "Excellent" : efficiencyScore >= 50 ? "Good" : "Needs attention"}
      />

      <StatCard
        icon={Folder}
        label="Total Assets"
        value={assetCount}
        subtitle={`${pvcCount} PVCs, ${nodeCount} Nodes`}
      />
    </div>
  );
};

KPICards.propTypes = {
  assets: PropTypes.arrayOf(
    PropTypes.shape({
      assetType: PropTypes.string,
      totalCost: PropTypes.number,
    })
  ).isRequired,
  timeWindow: PropTypes.string.isRequired,
};

export default KPICards;
