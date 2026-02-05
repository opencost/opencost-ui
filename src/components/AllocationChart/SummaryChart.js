import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LabelList,
  Cell,
} from "recharts";
import { primary, greyscale, browns } from "../../constants/colors";
import { toCurrency } from "../../util";

function toPieData(top, other, idle) {
  let slices = [];

  for (const i in top) {
    const allocation = top[i];
    const fill =
      allocation.name === "__unallocated__"
        ? "#212121"
        : primary[i % primary.length];

    slices.push({
      name: allocation.name,
      value: allocation.totalCost,
      fill: fill,
    });
  }

  for (const i in other) {
    const allocation = other[i];
    const fill = browns[i % browns.length];
    slices.push({
      name: allocation.name,
      value: allocation.totalCost,
      fill: fill,
    });
  }

  for (const i in idle) {
    const allocation = idle[i];
    const fill = greyscale[i % greyscale.length];
    slices.push({
      name: allocation.name,
      value: allocation.totalCost,
      fill: fill,
    });
  }

  return slices;
}

const SummaryChart = ({ top, other, idle, currency, height }) => {
  const pieData = toPieData(top, other, idle);

  const chartData = useMemo(() => {
    if (!pieData || pieData.length === 0) {
      return [];
    }
    const total = pieData.reduce((sum, slice) => sum + slice.value, 0);
    return pieData
      .slice()
      .sort((a, b) => b.value - a.value)
      .map((slice) => ({
        name: slice.name,
        value: slice.value,
        fill: slice.fill,
        percent: total > 0 ? slice.value / total : 0,
      }));
  }, [pieData]);

  if (chartData.length === 0) {
    return null;
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ top: 8, right: 32, left: 0, bottom: 8 }}
      >
        <XAxis
          type="number"
          tickFormatter={(value) => toCurrency(value, currency)}
        />
        <YAxis type="category" dataKey="name" width={160} />
        <Tooltip
          formatter={(value) => toCurrency(value, currency)}
          labelFormatter={(name) => `Name: ${name}`}
        />
        <Bar
          dataKey="value"
          radius={[0, 999, 999, 0]}
          isAnimationActive={false}
        >
          {chartData.map((slice, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <Cell key={`${slice.name}-${index}`} fill={slice.fill} />
          ))}
          <LabelList
            dataKey="value"
            position="right"
            formatter={(value, _name, props) => {
              const percent =
                typeof props?.payload?.percent === "number"
                  ? Math.round(props.payload.percent * 100)
                  : 0;
              return `${toCurrency(
                typeof value === "number" ? value : 0,
                currency,
              )} (${percent}%)`;
            }}
            style={{ fontSize: 12 }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default SummaryChart;
