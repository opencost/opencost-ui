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
import { TrashCan, Download, Renew } from '@carbon/icons-react';

const Assets = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAssets = () => {
    setLoading(true);
    fetch('/model/assets')
      .then((res) => res.json())
      .then((json) => {
        // Transform the OpenCost object-map into an array for the DataTable
        const flattened = Object.entries(json.data[0] || {}).map(([id, details]) => ({
          id,
          name: id.split('/').pop(), 
          type: details.type || 'N/A',
          category: details.properties?.category || 'Cloud',
          cost: details.totalCost ? `$${details.totalCost.toFixed(2)}` : '$0.00'
        }));
        setData(flattened);
        setError(null);
        setLoading(false);
      })
      .catch(() => {
        setError("Note: Backend unreachable. Displaying mock data for UI preview.");
        setData([
          { id: '1', name: 'gke-node-pool-1', type: 'Node', category: 'Compute', cost: '$145.20' },
          { id: '2', name: 'persistent-disk-01', type: 'Disk', category: 'Storage', cost: '$22.10' },
          { id: '3', name: 'ingress-lb-external', type: 'LoadBalancer', category: 'Network', cost: '$40.00' },
          { id: '4', name: 'backup-vault-s3', type: 'ObjectStorage', category: 'Storage', cost: '$12.40' },
        ]);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchAssets();
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
          title="Demo Mode"
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
            title="Assets Inventory" 
            description="Detailed view of infrastructure resources and their associated costs."
          >
            <TableToolbar>
              <TableBatchActions {...getBatchActionProps()}>
                <TableBatchAction renderIcon={Download} onClick={() => alert('Exporting selection...')}>
                  Export
                </TableBatchAction>
              </TableBatchActions>
              <TableToolbarContent>
                <TableToolbarSearch onChange={onInputChange} placeholder="Search by name or type..." />
                <Button onClick={fetchAssets} kind="ghost" hasIconOnly renderIcon={Renew} iconDescription="Reload" />
              </TableToolbarContent>
            </TableToolbar>
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeader />
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
                    <TableCell {...getSelectionProps({ row })} />
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

export default Assets;