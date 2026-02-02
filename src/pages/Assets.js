import React, { useState, useEffect } from 'react';
import {
  Content,
  DataTable,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  TableToolbar,
  TableToolbarContent,
  TableToolbarSearch,
  TableBatchActions,
  TableBatchAction,
  InlineNotification,
  Loading,
  Button
} from '@carbon/react';
import { TrashCan, Save, Download } from '@carbon/icons-react';

const Assets = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Attempt to fetch from the OpenCost Assets API
    fetch('/model/assets')
      .then((res) => res.json())
      .then((json) => {
        // OpenCost returns data as a map; we flatten it for the DataTable
        const flattened = Object.entries(json.data[0] || {}).map(([id, details]) => ({
          id,
          name: id.split('/').pop(), 
          type: details.type || 'N/A',
          category: details.properties?.category || 'Cloud',
          cost: details.totalCost ? `$${details.totalCost.toFixed(2)}` : '$0.00'
        }));
        setData(flattened);
        setLoading(false);
      })
      .catch(() => {
        // Fallback to Mock Data so your UI looks great during development
        setError("Note: Backend unreachable. Displaying mock asset data for preview.");
        setData([
          { id: '1', name: 'gke-node-01', type: 'Node', category: 'Compute', cost: '$142.50' },
          { id: '2', name: 'ssd-storage-disk', type: 'Disk', category: 'Storage', cost: '$18.00' },
          { id: '3', name: 'network-lb-prod', type: 'LoadBalancer', category: 'Network', cost: '$45.00' },
          { id: '4', name: 's3-backup-bucket', type: 'ObjectStorage', category: 'Storage', cost: '$12.40' },
        ]);
        setLoading(false);
      });
  }, []);

  const headers = [
    { key: 'name', header: 'Asset Name' },
    { key: 'type', header: 'Type' },
    { key: 'category', header: 'Category' },
    { key: 'cost', header: 'Total Cost' },
  ];

  if (loading) return <Loading description="Loading assets..." withOverlay={false} />;

  return (
    <Content>
      {error && (
        <InlineNotification
          kind="info"
          title="Status"
          subtitle={error}
          style={{ marginBottom: '1.5rem', maxWidth: '100%' }}
        />
      )}

      <DataTable rows={data} headers={headers}>
        {({
          rows,
          headers,
          getHeaderProps,
          getRowProps,
          getSelectionProps,
          getBatchActionProps,
          onInputChange,
          selectedRows,
        }) => (
          <TableContainer 
            title="Cloud Assets Inventory" 
            description="Manage and monitor costs for individual infrastructure resources."
          >
            <TableToolbar>
              <TableBatchActions {...getBatchActionProps()}>
                <TableBatchAction renderIcon={TrashCan} onClick={() => alert(`Deleting ${selectedRows.length} items`)}>
                  Delete
                </TableBatchAction>
                <TableBatchAction renderIcon={Download} onClick={() => alert('Exporting data...')}>
                  Export
                </TableBatchAction>
              </TableBatchActions>
              <TableToolbarContent>
                <TableToolbarSearch onChange={onInputChange} placeholder="Filter by name, type, or category..." />
                <Button kind="primary" size="sm">Refresh Data</Button>
              </TableToolbarContent>
            </TableToolbar>
            <Table>
              <TableHead>
                <TableRow>
                  <TableSelectAll {...getSelectionProps()} />
                  {headers.map((header) => (
                    <TableHeader {...getHeaderProps({ header })}>
                      {header.header}
                    </TableHeader>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <TableRow {...getRowProps({ row })} key={row.id}>
                    <TableSelectRow {...getSelectionProps({ row })} />
                    {row.cells.map((cell) => (
                      <TableCell key={cell.id}>{cell.value}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DataTable>
    </Content>
  );
};

// Helper components for selection (Standard Carbon patterns)
const TableSelectAll = ({ ...props }) => <TableHeader {...props} />;
const TableSelectRow = ({ ...props }) => <TableCell {...props} />;

export default Assets;