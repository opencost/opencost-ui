import PropTypes from "prop-types";
import { ContentSwitcher, Switch, Button } from "@carbon/react";
import { Renew } from "@carbon/icons-react";

const TIME_WINDOWS = [
  { value: "7d", label: "7d" },
  { value: "14d", label: "14d" },
  { value: "30d", label: "30d" },
  { value: "60d", label: "60d" },
  { value: "90d", label: "90d" },
];

const AssetsHeader = ({
  timeWindow,
  onTimeWindowChange,
  onRefresh,
  useMockData,
}) => {
  const selectedIndex = TIME_WINDOWS.findIndex((tw) => tw.value === timeWindow);

  return (
    <div className="assets-header-controls">
      {useMockData && <span className="mock-data-badge">Mock Data</span>}

      <ContentSwitcher
        selectedIndex={selectedIndex >= 0 ? selectedIndex : 2}
        onChange={(e) => {
          const newWindow = TIME_WINDOWS[e.index]?.value;
          if (newWindow) onTimeWindowChange(newWindow);
        }}
        size="sm"
      >
        {TIME_WINDOWS.map((tw) => (
          <Switch key={tw.value} name={tw.value} text={tw.label} />
        ))}
      </ContentSwitcher>

      <Button
        kind="ghost"
        renderIcon={Renew}
        onClick={onRefresh}
        iconDescription="Refresh data"
        hasIconOnly
        size="sm"
      />
    </div>
  );
};

AssetsHeader.propTypes = {
  timeWindow: PropTypes.string.isRequired,
  onTimeWindowChange: PropTypes.func.isRequired,
  onRefresh: PropTypes.func.isRequired,
  useMockData: PropTypes.bool,
};

export default AssetsHeader;
