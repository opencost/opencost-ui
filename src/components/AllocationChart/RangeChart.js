import { reverse } from "lodash";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { primary, primaryDark, greyscale, greyscaleDark, browns, brownsDark } from "../../constants/colors";
import { toCurrency } from "../../util";
import { useTheme } from "../../contexts/ThemeContext";

function toBarLabels(allocationRange, isDarkMode) {
  let keyToFill = {};
  let p = 0;
  let g = 0;
  let b = 0;

  const primaryColors = isDarkMode ? primaryDark : primary;
  const greyColors = isDarkMode ? greyscaleDark : greyscale;
  const brownColors = isDarkMode ? brownsDark : browns;

  for (const { idle } of allocationRange) {
    for (const allocation of idle) {
      const key = allocation.name;
      if (keyToFill[key] === undefined) {
        // idle allocations are assigned grey
        keyToFill[key] = greyColors[g];
        g = (g + 1) % greyColors.length;
      }
    }
  }

  for (const { top } of allocationRange) {
    for (const allocation of top) {
      const key = allocation.name;
      if (keyToFill[key] === undefined) {
        if (key === "__unallocated__") {
          // unallocated gets dark color
          keyToFill[key] = isDarkMode ? "#525252" : "#212121";
        } else {
          // non-idle allocations get the next available color
          keyToFill[key] = primaryColors[p];
          p = (p + 1) % primaryColors.length;
        }
      }
    }
  }

  for (const { other } of allocationRange) {
    for (const allocation of other) {
      const key = allocation.name;
      if (keyToFill[key] === undefined) {
        // idle allocations are assigned grey
        keyToFill[key] = brownColors[b];
        b = (b + 1) % brownColors.length;
      }
    }
  }

  let labels = [];
  for (const key in keyToFill) {
    labels.push({
      dataKey: key,
      fill: keyToFill[key],
    });
  }

  return reverse(labels);
}

function toBar(datum) {
  const { top, other, idle } = datum;
  const bar = {};

  for (const key in top) {
    const allocation = top[key];
    const start = new Date(allocation.start);
    bar.start = `${start.getUTCFullYear()}-${start.getUTCMonth() + 1}-${start.getUTCDate()}`;
    bar[allocation.name] = allocation.totalCost;
  }

  for (const key in other) {
    const allocation = other[key];
    const start = new Date(allocation.start);
    bar.start = `${start.getUTCFullYear()}-${start.getUTCMonth() + 1}-${start.getUTCDate()}`;
    bar[allocation.name] = allocation.totalCost;
  }

  for (const key in idle) {
    const allocation = idle[key];
    const start = new Date(allocation.start);
    bar.start = `${start.getUTCFullYear()}-${start.getUTCMonth() + 1}-${start.getUTCDate()}`;
    bar[allocation.name] = allocation.totalCost;
  }

  return bar;
}

const RangeChart = ({ data, currency, height }) => {
  const { isDarkMode } = useTheme();
  const barData = data.map(toBar);
  const barLabels = toBarLabels(data, isDarkMode);

  const CustomTooltip = (params) => {
    const { active, payload } = params;

    if (!payload || payload.length == 0) {
      return null;
    }

    const total = payload.reduce((sum, item) => sum + item.value, 0.0);
    if (active) {
      return (
        <div
          style={{
            borderRadius: 2,
            background: isDarkMode ? "rgba(38, 38, 38, 0.95)" : "rgba(255, 255, 255, 0.95)",
            padding: 12,
          }}
        >
          <p
            style={{
              fontSize: "1rem",
              margin: 0,
              marginBottom: 4,
              padding: 0,
              color: isDarkMode ? "#f4f4f4" : "#000000",
            }}
          >{`Total: ${toCurrency(total, currency)}`}</p>
          {reverse(payload).map((item, i) => (
            <p
              key={i}
              style={{
                fontSize: "1rem",
                margin: 0,
                marginBottom: 4,
                padding: 0,
                color: item.fill,
              }}
            >{`${item.name}: ${toCurrency(item.value, currency)}`}</p>
          ))}
        </div>
      );
    }

    return null;
  };

  return (
    <BarChart
      data={barData}
      margin={{ top: 30, right: 30, left: 30, bottom: 12 }}
      responsive
      width="100%"
      height={height}
    >
      <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#525252" : "#ccc"} />
      <XAxis dataKey="start" tick={{ fill: isDarkMode ? "#c6c6c6" : "#333" }} />
      <YAxis tick={{ fill: isDarkMode ? "#c6c6c6" : "#333" }} />
      <Tooltip content={<CustomTooltip />} />
      {barLabels.map((barLabel, i) => (
        <Bar
          key={i}
          dataKey={barLabel.dataKey}
          stackId="a"
          fill={barLabel.fill}
        />
      ))}
    </BarChart>
  );
};

export default RangeChart;
