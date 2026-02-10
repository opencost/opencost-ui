'use client';

import { StackedBarChart } from '@carbon/charts-react';

const chartData = [
  { group: '2023-10-27', key: 'kube-system', value: 0.65 },
  { group: '2023-10-27', key: 'prometheus', value: 0.05 },
  { group: '2023-10-27', key: 'calico-system', value: 0.03 },
  { group: '2023-10-27', key: 'opencost', value: 0.02 },
  { group: '2023-10-28', key: 'kube-system', value: 0.64 },
  { group: '2023-10-28', key: 'prometheus', value: 0.05 },
  { group: '2023-10-28', key: 'calico-system', value: 0.03 },
  { group: '2023-10-28', key: 'opencost', value: 0.02 },
  { group: '2023-10-29', key: 'kube-system', value: 0.66 },
  { group: '2023-10-29', key: 'prometheus', value: 0.05 },
  { group: '2023-10-29', key: 'calico-system', value: 0.03 },
  { group: '2023-10-29', key: 'opencost', value: 0.02 },
  { group: '2023-10-30', key: 'kube-system', value: 0.65 },
  { group: '2023-10-30', key: 'prometheus', value: 0.05 },
  { group: '2023-10-30', key: 'calico-system', value: 0.03 },
  { group: '2023-10-30', key: 'opencost', value: 0.02 },
  { group: '2023-10-31', key: 'kube-system', value: 0.64 },
  { group: '2023-10-31', key: 'prometheus', value: 0.05 },
  { group: '2023-10-31', key: 'calico-system', value: 0.03 },
  { group: '2023-10-31', key: 'opencost', value: 0.02 },
  { group: '2023-11-01', key: 'kube-system', value: 0.27 },
  { group: '2023-11-01', key: 'prometheus', value: 0.02 },
  { group: '2023-11-01', key: 'calico-system', value: 0.01 },
  { group: '2023-11-01', key: 'opencost', value: 0.01 },
];

const chartOptions = {
  title: 'Cost Allocation by Namespace',
  axes: {
    left: {
      mapsTo: 'value',
      scaleType: 'linear',
    },
    bottom: {
      mapsTo: 'group',
      scaleType: 'labels',
    },
  },
  height: '400px',
};

export default function CostAllocationChart() {
  return (
    <div style={{ width: '100%', height: '400px' }}>
      <StackedBarChart data={chartData} options={chartOptions} />
    </div>
  );
}
