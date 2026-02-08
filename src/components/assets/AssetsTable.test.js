import React from 'react';
import { render, screen } from '@testing-library/react';
import AssetsTable from './AssetsTable';

// Mock Carbon DataTable components
jest.mock('@carbon/react', () => ({
  DataTable: ({ children, rows, headers }) => children({ 
    rows: rows.map(row => ({
      ...row,
      cells: headers.map(header => ({
        id: `${row.id}-${header.key}`,
        value: row[header.key],
        info: { header: header.key }
      }))
    })),
    headers,
    getHeaderProps: ({ header }) => ({ key: header.key }),
    getRowProps: ({ row }) => ({ key: row.id }),
    getTableProps: () => ({}),
    getTableContainerProps: () => ({})
  }),
  Table: ({ children }) => <table>{children}</table>,
  TableHead: ({ children }) => <thead>{children}</thead>,
  TableRow: ({ children }) => <tr>{children}</tr>,
  TableHeader: ({ children }) => <th>{children}</th>,
  TableBody: ({ children }) => <tbody>{children}</tbody>,
  TableCell: ({ children }) => <td>{children}</td>,
  TableContainer: ({ children, title, description }) => (
    <div>
      <div>{title}</div>
      <div>{description}</div>
      {children}
    </div>
  ),
  TableToolbar: ({ children }) => <div>{children}</div>,
  TableToolbarContent: ({ children }) => <div>{children}</div>,
  TableToolbarSearch: ({ placeholder, onChange, value }) => (
    <input 
      placeholder={placeholder} 
      onChange={onChange} 
      value={value}
      data-testid="search-input"
    />
  ),
  Pagination: ({ page, pageSize, totalItems }) => (
    <div data-testid="pagination">
      Page {page}, Size {pageSize}, Total {totalItems}
    </div>
  ),
}));

describe('AssetsTable', () => {
  const mockAssetsData = {
    'cluster1/node/node-1': {
      type: 'Node',
      totalCost: 150.50,
      cpuCost: 100,
      ramCost: 50.50,
      properties: {
        name: 'node-1',
        category: 'Compute',
        provider: 'AWS',
        providerID: 'i-1234567890',
        service: 'EC2',
        cluster: 'cluster1',
      },
    },
    'cluster1/disk/disk-1': {
      type: 'Disk',
      totalCost: 25.75,
      properties: {
        name: 'disk-1',
        category: 'Storage',
        provider: 'AWS',
        providerID: 'vol-0987654321',
        service: 'EBS',
        cluster: 'cluster1',
      },
    },
  };

  test('renders table with asset data', () => {
    render(<AssetsTable assetsData={mockAssetsData} currency="USD" />);
    
    expect(screen.getByText('Infrastructure Assets')).toBeInTheDocument();
    expect(screen.getByText('node-1')).toBeInTheDocument();
    expect(screen.getByText('disk-1')).toBeInTheDocument();
  });

  test('displays "No asset data available" when data is empty', () => {
    render(<AssetsTable assetsData={{}} currency="USD" />);
    
    expect(screen.getByText('No asset data available')).toBeInTheDocument();
  });

  test('renders search input', () => {
    render(<AssetsTable assetsData={mockAssetsData} currency="USD" />);
    
    expect(screen.getByTestId('search-input')).toBeInTheDocument();
  });

  test('renders pagination', () => {
    render(<AssetsTable assetsData={mockAssetsData} currency="USD" />);
    
    expect(screen.getByTestId('pagination')).toBeInTheDocument();
  });
});
