import React from 'react';

// Mock all recharts components
const MockedChart = ({ children }) => <div>{children}</div>;

module.exports = {
  BarChart: MockedChart,
  Bar: MockedChart,
  PieChart: MockedChart,
  Pie: MockedChart,
  Cell: MockedChart,
  XAxis: MockedChart,
  YAxis: MockedChart,
  CartesianGrid: MockedChart,
  Tooltip: MockedChart,
  ResponsiveContainer: ({ children }) => <div>{children}</div>,
};
