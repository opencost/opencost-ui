import PropTypes from "prop-types";
import { Tile } from "@carbon/react";

const StatCard = ({
  icon: Icon,
  label,
  value,
  subtitle,
  valueColor,
  className = "",
}) => {
  return (
    <Tile className={`stat-card ${className}`}>
      {Icon && (
        <div className="stat-icon">
          <Icon size={24} aria-label={label} />
        </div>
      )}
      <div className="stat-label">{label}</div>
      <div className="stat-value" style={valueColor ? { color: valueColor } : {}}>
        {value}
      </div>
      {subtitle && <div className="stat-subtitle">{subtitle}</div>}
    </Tile>
  );
};

StatCard.propTypes = {
  icon: PropTypes.elementType,
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  subtitle: PropTypes.string,
  valueColor: PropTypes.string,
  className: PropTypes.string,
};

export default StatCard;
