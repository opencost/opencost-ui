import React, { useState, useMemo } from 'react';
import {
  DataTable, Table, TableHead, TableRow, TableHeader, TableBody, TableCell,
  TableContainer, TableToolbar, TableToolbarContent, TableToolbarSearch, 
  Pagination, Button, ProgressBar, Tag 
} from '@carbon/react';
import { 
  Download, 
  VirtualMachine, 
  StorageRequest, 
  Network_2, 
  Help 
} from '@carbon/icons-react';

const AssetsTable = ({ assets }) => {
  const [firstRowIndex, setFirstRowIndex] = useState(0);
  const [currentPageSize, setCurrentPageSize] = useState(10);

  // --- Logic Helpers ---
  const getCategory = (type) => {
    const t = (type || '').toLowerCase();
    if (t.includes('node')) return 'Compute';
    if (t.includes('disk') || t.includes('pvc') || t.includes('volume')) return 'Storage';
    if (t.includes('loadbalancer') || t.includes('network')) return 'Network';
    return 'Other';
  };

  const getCategoryColor = (cat) => {
    switch(cat) {
      case 'Compute': return 'blue';
      case 'Storage': return 'purple';
      case 'Network': return 'cyan';
      default: return 'gray';
    }
  };

  const getTypeIcon = (type) => {
    const t = (type || '').toLowerCase();
    if (t.includes('node')) return <VirtualMachine size={20} fill="#0f62fe" />;
    if (t.includes('disk') || t.includes('pvc') || t.includes('volume')) return <StorageRequest size={20} fill="#8a3ffc" />;
    if (t.includes('loadbalancer') || t.includes('network')) return <Network_2 size={20} fill="#0072c3" />;
    return <Help size={20} fill="#525252" />;
  };

  const maxCost = useMemo(() => {
    return Math.max(...assets.map(a => (a.totalCost || a.cost || 0)), 1);
  }, [assets]);

  // 1. RENAME THIS TO 'allRows' (Fixes the crash)
  const allRows = assets.map((asset, index) => {
    const cost = asset.totalCost || asset.cost || 0;
    const category = getCategory(asset.type);

    return {
      id: index.toString(),
      name: asset.properties?.name || asset.name || 'N/A',
      category: category,
      type: asset.type || 'Unknown',
      provider: asset.properties?.provider || 'Unknown',
      costValue: cost, 
      categoryColor: getCategoryColor(category) // We need to access this safely later
    };
  });

  const headers = [
    { key: 'name', header: 'Resource Name' },
    { key: 'type', header: 'Type' },
    { key: 'category', header: 'Category' },
    { key: 'provider', header: 'Provider' },
    { key: 'costValue', header: 'Cost ($)' },
  ];

  const handleDownload = () => {
    const csvHeaders = ['Resource Name', 'Type', 'Category', 'Provider', 'Cost ($)'];
    const csvRows = allRows.map(row => [
      `"${row.name}"`,
      row.type,
      row.category,
      row.provider,
      row.costValue.toFixed(2)
    ]);
    const csvContent = [csvHeaders.join(','), ...csvRows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `opencost_assets.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="assets-table-container">
      {/* 2. Pass the sliced 'allRows' to the DataTable */}
      <DataTable rows={allRows.slice(firstRowIndex, firstRowIndex + currentPageSize)} headers={headers} isSortable>
        {({
          rows, // This 'rows' is ONLY the current page (10 items)
          headers, getHeaderProps, getRowProps, getTableProps, onInputChange
        }) => (
          <TableContainer title="Asset Breakdown" description={`Showing ${assets.length} total resources`}>
            <TableToolbar>
              <TableToolbarContent>
                <TableToolbarSearch onChange={onInputChange} placeholder="Filter resources..." />
                <Button kind="ghost" hasIconOnly renderIcon={Download} iconDescription="Download CSV" onClick={handleDownload} />
              </TableToolbarContent>
            </TableToolbar>
            
            <Table {...getTableProps()}>
              <TableHead>
                <TableRow>
                  {headers.map((header) => {
                    const { key, ...headerProps } = getHeaderProps({ header });
                    return <TableHeader key={key} {...headerProps}>{header.header}</TableHeader>;
                  })}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.length > 0 ? (
                  rows.map((row) => {
                    const { key, ...rowProps } = getRowProps({ row });
                    
                    // 3. SAFETY FIX: Lookup the original data from 'allRows' using the ID
                    const originalData = allRows[parseInt(row.id)] || {}; 
                    
                    const cost = row.cells.find(c => c.id.includes('costValue'))?.value || 0;
                    const percent = (cost / maxCost) * 100;

                    return (
                      <TableRow key={key} {...rowProps}>
                        {row.cells.map((cell) => {
                          
                          if (cell.info.header === 'type') {
                             return (
                               <TableCell key={cell.id}>
                                 <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                   {getTypeIcon(cell.value)}
                                   <span>{cell.value}</span>
                                 </div>
                               </TableCell>
                             );
                          }

                          if (cell.info.header === 'category') {
                             return (
                               <TableCell key={cell.id}>
                                 {/* 4. Use the SAFE 'originalData' here */}
                                 <Tag type={originalData.categoryColor || 'gray'} size="sm">
                                   {cell.value}
                                 </Tag>
                               </TableCell>
                             );
                          }

                          if (cell.info.header === 'costValue') {
                             return (
                               <TableCell key={cell.id}>
                                 <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                                   <span style={{ fontWeight: '600' }}>
                                     {cost.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                                   </span>
                                   <ProgressBar value={percent} max={100} size="small" hideLabel style={{ maxWidth: '80px', opacity: 0.6 }} />
                                 </div>
                               </TableCell>
                             );
                          }
                          return <TableCell key={cell.id}>{cell.value}</TableCell>;
                        })}
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow><TableCell colSpan={5}>No assets found.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DataTable>
      
      <Pagination
        totalItems={assets.length}
        backwardText="Previous page"
        forwardText="Next page"
        itemsPerPageText="Items per page:"
        pageSizes={[10, 20, 50]}
        pageSize={currentPageSize}
        onChange={({ page, pageSize }) => {
            if (pageSize !== currentPageSize) setCurrentPageSize(pageSize);
            setFirstRowIndex(pageSize * (page - 1));
        }}
      />
    </div>
  );
};

export default AssetsTable;