import { reverse } from "lodash";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { primary, greyscale, browns } from "../../constants/colors";
import { toCurrency } from "../../util";

function toBarLabels(allocationRange) {
  let keyToFill = {};
  let p = 0;
  let g = 0;
  let b = 0;

  for (const { idle } of allocationRange) {
    for (const allocation of idle) {
      const key = allocation.name;
      if (keyToFill[key] === undefined) {
        // idle allocations are assigned grey
        keyToFill[key] = greyscale[g];
        g = (g + 1) % greyscale.length;
      }
    }
  }

  for (const { top } of allocationRange) {
    for (const allocation of top) {
      const key = allocation.name;
      if (keyToFill[key] === undefined) {
        if (key === "__unallocated__") {
          // unallocated gets black (clean up)
          keyToFill[key] = "#212121";
        } else {
          // non-idle allocations get the next available color
          keyToFill[key] = primary[p];
          p = (p + 1) % primary.length;
        }
      }
    }
  }

  for (const { other } of allocationRange) {
    for (const allocation of other) {
      const key = allocation.name;
      if (keyToFill[key] === undefined) {
        // idle allocations are assigned grey
        keyToFill[key] = browns[b];
        b = (b + 1) % browns.length;
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
  const barData = data.map(toBar);
  const barLabels = toBarLabels(data);

  const CustomTooltip = (params) => {
    const { active, payload } = params;

    if (!active || !payload || payload.length === 0) {
      return null;
    }

    const total = payload.reduce((sum, item) => sum + item.value, 0.0);
    const sortedPayload = reverse([...payload].sort((a, b) => a.value - b.value));
    const hoveredDate = payload[0]?.payload?.start ?? "";

    return (
      <div
        style={{
          borderRadius: 4,
          background: "rgba(255, 255, 255, 0.96)",
          padding: 12,
          boxShadow: "0 2px 6px rgba(0, 0, 0, 0.12)",
          minWidth: 220,
        }}
      >
        {hoveredDate && (
          <p
            style={{
              fontSize: "0.8rem",
              margin: 0,
              marginBottom: 2,
              padding: 0,
              color: "#6f6f6f",
            }}
          >
            {hoveredDate}
          </p>
        )}
        <p
          style={{
            fontSize: "0.9rem",
            margin: 0,
            marginBottom: 6,
            padding: 0,
            fontWeight: 600,
            color: "#000000",
          }}
        >
          {`Total: ${toCurrency(total, currency)}`}
        </p>
        <div style={{ marginTop: 4 }}>
          {sortedPayload.map((item, index) => {
            const percent =
              total > 0 ? Math.round((item.value / total) * 100) : 0;
            return (
              <div
                key={`${item.name}-${index}`}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: "0.85rem",
                  marginBottom: 2,
                  color: item.fill,
                }}
              >
                <span
                  style={{
                    maxWidth: 140,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {item.name}
                </span>
                <span style={{ marginLeft: 8, color: "#161616" }}>
                  {`${toCurrency(item.value, currency)} (${percent}%)`}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <BarChart
      data={barData}
      margin={{ top: 30, right: 30, left: 30, bottom: 12 }}
      responsive
      width="100%"
      height={height}
    >
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="start" />
      <YAxis tickFormatter={(value) => toCurrency(value, currency)} />
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
