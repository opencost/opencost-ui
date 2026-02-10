'use client';

import { AreaChart } from '@carbon/charts-react';

const chartData = [
  { group: '10/22/2023', key: 'AmazonEC2', value: 650 },
  { group: '10/22/2023', key: 'ComputeEngine', value: 350 },
  { group: '10/22/2023', key: 'AmazonS3', value: 200 },
  { group: '10/22/2023', key: 'CloudStorage', value: 150 },
  { group: '10/22/2023', key: 'Other', value: 100 },
  { group: '10/23/2023', key: 'AmazonEC2', value: 700 },
  { group: '10/23/2023', key: 'ComputeEngine', value: 400 },
  { group: '10/23/2023', key: 'AmazonS3', value: 250 },
  { group: '10/23/2023', key: 'CloudStorage', value: 180 },
  { group: '10/23/2023', key: 'Other', value: 120 },
  { group: '10/24/2023', key: 'AmazonEC2', value: 750 },
  { group: '10/24/2023', key: 'ComputeEngine', value: 450 },
  { group: '10/24/2023', key: 'AmazonS3', value: 300 },
  { group: '10/24/2023', key: 'CloudStorage', value: 200 },
  { group: '10/24/2023', key: 'Other', value: 150 },
  { group: '10/25/2023', key: 'AmazonEC2', value: 800 },
  { group: '10/25/2023', key: 'ComputeEngine', value: 500 },
  { group: '10/25/2023', key: 'AmazonS3', value: 350 },
  { group: '10/25/2023', key: 'CloudStorage', value: 220 },
  { group: '10/25/2023', key: 'Other', value: 180 },
  { group: '10/26/2023', key: 'AmazonEC2', value: 780 },
  { group: '10/26/2023', key: 'ComputeEngine', value: 480 },
  { group: '10/26/2023', key: 'AmazonS3', value: 330 },
  { group: '10/26/2023', key: 'CloudStorage', value: 210 },
  { group: '10/26/2023', key: 'Other', value: 170 },
  { group: '10/27/2023', key: 'AmazonEC2', value: 770 },
  { group: '10/27/2023', key: 'ComputeEngine', value: 470 },
  { group: '10/27/2023', key: 'AmazonS3', value: 320 },
  { group: '10/27/2023', key: 'CloudStorage', value: 200 },
  { group: '10/27/2023', key: 'Other', value: 160 },
  { group: '10/28/2023', key: 'AmazonEC2', value: 760 },
  { group: '10/28/2023', key: 'ComputeEngine', value: 460 },
  { group: '10/28/2023', key: 'AmazonS3', value: 310 },
  { group: '10/28/2023', key: 'CloudStorage', value: 190 },
  { group: '10/28/2023', key: 'Other', value: 150 },
];

const chartOptions = {
  title: 'Cloud Service Costs',
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
  curve: 'curveMonotoneX',
  height: '400px',
};

export default function CostByServiceChart() {
  return (
    <div style={{ width: '100%', height: '400px' }}>
      <AreaChart data={chartData} options={chartOptions} />
    </div>
  );
}
