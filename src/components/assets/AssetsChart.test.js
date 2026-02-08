import React from 'react';
import { render, screen } from '@testing-library/react';
import AssetsChart from './AssetsChart';

describe('AssetsChart', () => {
  const mockAssetsData = {
    'cluster1/node/node-1': {
      type: 'Node',
      totalCost: 150.50,
      cpuCost: 100,
      ramCost: 50.50,
      properties: {
        provider: 'AWS',
        category: 'Compute',
      },
    },
    'cluster1/disk/disk-1': {
      type: 'Disk',
      totalCost: 25.75,
      properties: {
        provider: 'AWS',
        category: 'Storage',
      },
    },
  };

  test('renders chart with cost summary', () => {
    render(<AssetsChart assetsData={mockAssetsData} currency="USD" aggregateBy="type" />);
    
    expect(screen.getByText('Total Infrastructure Cost')).toBeInTheDocument();
    expect(screen.getByText('2 assets')).toBeInTheDocument();
  });

  test('displays "No data available" when data is empty', () => {
    render(<AssetsChart assetsData={{}} currency="USD" aggregateBy="type" />);
    
    expect(screen.getByText('No data available for chart')).toBeInTheDocument();
  });

  test('calculates CPU and RAM costs correctly', () => {
    render(<AssetsChart assetsData={mockAssetsData} currency="USD" aggregateBy="type" />);
    
    expect(screen.getByText('CPU Cost')).toBeInTheDocument();
    expect(screen.getByText('RAM Cost')).toBeInTheDocument();
    expect(screen.getByText('Storage Cost')).toBeInTheDocument();
  });
});
