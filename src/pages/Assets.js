import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  Tile,
  Grid,
  Column,
  InlineNotification,
  Tag,
  Button,
  Loading,
  Toggle,
  Dropdown,
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
  Pagination,
  OverflowMenu,
  OverflowMenuItem
} from '@carbon/react';
import { DonutChart } from '@carbon/charts-react';
import { ChartTheme } from '@carbon/charts';
import '@carbon/charts/styles.css';
import '@carbon/styles/css/styles.css';
import '../css/AssetsDashboard.css';
import Page from "../components/Page";
import Header from "../components/Header";
import Footer from "../components/Footer";
import IconButton from "@mui/material/IconButton";
import RefreshIcon from "@mui/icons-material/Refresh";
import DownloadIcon from "@mui/icons-material/Download";
import ImageIcon from "@mui/icons-material/Image";
import Warnings from "../components/Warnings";
import AssetsService from "../services/assets";
import html2canvas from 'html2canvas';

const DEV_MODE = process.env.REACT_APP_USE_MOCK_DATA === 'true';

const bytesToGB = (bytes) => {
  return (bytes / (1024 ** 3)).toFixed(2);
};

const formatCost = (cost) => {
  return `$${cost.toFixed(2)}`;
};

const getTotalProvisioned = (assets) => {
  return assets.reduce((sum, asset) => sum + (asset.bytes || 0), 0);
};

const getTotalCost = (assets) => {
  return assets.reduce((sum, asset) => sum + (asset.totalCost || 0), 0);
};

const getAverageIdle = (assets) => {
  if (assets.length === 0) return 0;
  const totalIdle = assets.reduce((sum, asset) => {
    const breakdown = asset.breakdown || {};
    return sum + (breakdown.idle || 0);
  }, 0);
  return (totalIdle / assets.length) * 100;
};

const categorizeAssets = (assets) => {
  const nodeDisks = assets.filter(asset => asset.local === 1);
  const pvcs = assets.filter(asset => asset.local !== 1);
  return { nodeDisks, pvcs };
};

const calculateUsage = (asset) => {
  const totalBytes = asset.bytes || 0;
  const breakdown = asset.breakdown || {};
  const idlePercentage = breakdown.idle || 0;
  const usedBytes = totalBytes * (1 - idlePercentage);
  const idleBytes = totalBytes * idlePercentage;
  
  return {
    used: usedBytes,
    idle: idleBytes,
    usedGB: bytesToGB(usedBytes),
    idleGB: bytesToGB(idleBytes),
    totalGB: bytesToGB(totalBytes),
    idlePercentage: (idlePercentage * 100).toFixed(0)
  };
};

const getAssetStatus = (idlePercentage) => {
  if (idlePercentage >= 80) return { label: 'WASTE', type: 'red' };
  if (idlePercentage >= 40) return { label: 'REVIEW', type: 'orange' };
  return { label: 'OK', type: 'green' };
};

const generateInsights = (assets) => {
  const insights = [];
  
  const unusedPVCs = assets.filter(
    asset => asset.local !== 1 && (asset.breakdown?.idle || 0) === 1
  );
  
  if (unusedPVCs.length > 0) {
    insights.push({
      type: 'warning',
      title: `Review ${unusedPVCs.length} Unused PVC${unusedPVCs.length > 1 ? 's' : ''}`,
      subtitle: 'These persistent volume claims are 100% idle and may be candidates for cleanup.'
    });
  }
  
  const nodeDisks = assets.filter(asset => asset.local === 1);
  const highIdleNodeDisks = nodeDisks.filter(asset => (asset.breakdown?.idle || 0) > 0.5);
  
  if (highIdleNodeDisks.length > 0) {
    insights.push({
      type: 'warning',
      title: 'Monitor Node Disk Utilization',
      subtitle: `${highIdleNodeDisks.length} node disk${highIdleNodeDisks.length > 1 ? 's have' : ' has'} over 50% idle capacity.`
    });
  }
  
  return insights;
};

// Export Functions
const exportToCSV = (assets, windowData) => {
  const headers = [
    'Asset Name',
    'Type',
    'Namespace',
    'Storage Class',
    'Total Storage (GB)',
    'Used Storage (GB)',
    'Idle Storage (GB)',
    'Idle Percentage (%)',
    'Total Cost ($)',
    'Status',
    'Provider ID',
    'Volume Name',
    'Claim Name'
  ];
  
  const rows = assets.map(asset => {
    const usage = calculateUsage(asset);
    const status = getAssetStatus(parseFloat(usage.idlePercentage));
    const properties = asset.properties || {};
    
    return [
      properties.name || asset.name || asset.providerID || 'Unknown',
      asset.type || 'Unknown',
      properties.namespace || asset.claimNamespace || '',
      asset.storageClass || '',
      usage.totalGB,
      usage.usedGB,
      usage.idleGB,
      usage.idlePercentage,
      (asset.totalCost || 0).toFixed(2),
      status.label,
      asset.providerID || '',
      asset.volumeName || '',
      asset.claimName || ''
    ];
  });
  
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  const timestamp = new Date().toISOString().split('T')[0];
  
  link.setAttribute('href', url);
  link.setAttribute('download', `storage-assets-${timestamp}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const exportToJSON = (assets, windowData, rawData) => {
  const exportData = {
    exportDate: new Date().toISOString(),
    window: windowData,
    summary: {
      totalAssets: assets.length,
      totalProvisioned: bytesToGB(getTotalProvisioned(assets)),
      totalCost: getTotalCost(assets),
      averageIdle: getAverageIdle(assets).toFixed(2),
      nodeDisksCount: assets.filter(a => a.local === 1).length,
      pvcsCount: assets.filter(a => a.local !== 1).length
    },
    assets: assets.map(asset => {
      const usage = calculateUsage(asset);
      const status = getAssetStatus(parseFloat(usage.idlePercentage));
      
      return {
        id: asset.id,
        name: asset.name || asset.providerID,
        type: asset.type,
        category: asset.category,
        providerID: asset.providerID,
        storageClass: asset.storageClass,
        volumeName: asset.volumeName,
        claimName: asset.claimName,
        claimNamespace: asset.claimNamespace,
        local: asset.local,
        window: asset.window,
        storage: {
          totalBytes: asset.bytes,
          totalGB: usage.totalGB,
          usedGB: usage.usedGB,
          idleGB: usage.idleGB,
          idlePercentage: usage.idlePercentage
        },
        breakdown: asset.breakdown,
        cost: {
          total: asset.totalCost,
          formatted: formatCost(asset.totalCost || 0)
        },
        status: status.label,
        properties: asset.properties
      };
    }),
    rawData: rawData
  };
  
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
    type: 'application/json' 
  });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  const timestamp = new Date().toISOString().split('T')[0];
  
  link.setAttribute('href', url);
  link.setAttribute('download', `storage-assets-${timestamp}.json`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const AssetSummaryTiles = ({ assets, windowDays }) => {
  const totalProvisioned = getTotalProvisioned(assets);
  const totalCost = getTotalCost(assets);
  const avgIdle = getAverageIdle(assets);
  
  const { nodeDisks } = categorizeAssets(assets);
  
  return (
    <div className="summary-tiles" style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
      gap: '12px',
      marginBottom: '24px'
    }}>
      <Tile className="summary-tile" style={{ 
        padding: '12px', 
        textAlign: 'center',
        minHeight: 'auto'
      }}>
        <div className="tile-icon" style={{ fontSize: '20px', marginBottom: '4px' }}>💾</div>
        <div className="tile-value" style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '2px' }}>{nodeDisks.length}</div>
        <div className="tile-label" style={{ fontSize: '11px', color: '#525252' }}>Node Disks</div>
      </Tile>
      
      <Tile className="summary-tile" style={{ 
        padding: '12px', 
        textAlign: 'center',
        minHeight: 'auto'
      }}>
        <div className="tile-icon" style={{ fontSize: '20px', marginBottom: '4px' }}>$</div>
        <div className="tile-value" style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '2px' }}>{formatCost(totalCost)}</div>
        <div className="tile-label" style={{ fontSize: '11px', color: '#525252' }}>Total Cost</div>
      </Tile>
      
      <Tile className="summary-tile" style={{ 
        padding: '12px', 
        textAlign: 'center',
        minHeight: 'auto'
      }}>
        <div className="tile-icon" style={{ fontSize: '20px', marginBottom: '4px' }}>📦</div>
        <div className="tile-value" style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '2px' }}>{bytesToGB(totalProvisioned)} GB</div>
        <div className="tile-label" style={{ fontSize: '11px', color: '#525252' }}>Total Provisioned</div>
      </Tile>
      
      <Tile className="summary-tile" style={{ 
        padding: '12px', 
        textAlign: 'center',
        minHeight: 'auto'
      }}>
        <div className="tile-icon" style={{ fontSize: '20px', marginBottom: '4px' }}>🏛️</div>
        <div className="tile-value" style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '2px' }}>{windowDays}</div>
        <div className="tile-label" style={{ fontSize: '11px', color: '#525252' }}>Days</div>
      </Tile>
      
      <Tile className="summary-tile" style={{ 
        padding: '12px', 
        textAlign: 'center',
        minHeight: 'auto'
      }}>
        <div className="tile-icon" style={{ fontSize: '20px', marginBottom: '4px' }}>📊</div>
        <div className="tile-value" style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '2px' }}>{avgIdle.toFixed(0)}%</div>
        <div className="tile-label" style={{ fontSize: '11px', color: '#525252' }}>Cluster Idle</div>
      </Tile>
    </div>
  );
};

const AssetPieChart = ({ title, data, totalBytes, chartId }) => {
  const chartRef = useRef(null);
  
  const chartData = data.map(item => ({
    group: item.label,
    value: parseFloat(item.value)
  }));
  
  const idleItem = data.find(item => item.label === 'Idle');
  const usedItem = data.find(item => item.label === 'Used');
  
  const idlePercentage = idleItem ? parseFloat(idleItem.percentage || 0) : 0;
  const usedPercentage = usedItem ? parseFloat(usedItem.percentage || 0) : 0;
  
  const options = {
    title: title,
    resizable: true,
    donut: {
      center: {
        label: `${idlePercentage}%`
      },
      alignment: 'center'
    },
    height: '350px',
    legend: {
      enabled: true,
      position: 'bottom',
      alignment: 'center',
      truncation: {
        type: 'none'
      }
    },
    color: {
      scale: {
        'Used': '#0f62fe',
        'Idle': '#ff832b'
      }
    },
    theme: ChartTheme.G90,
    toolbar: {
      enabled: false
    },
    tooltip: {
      truncation: {
        type: 'none'
      },
      valueFormatter: (value) => `${value} GB`
    }
  };
  
  const handleDownloadChart = async () => {
    if (!chartRef.current) return;
    
    try {
      const canvas = await html2canvas(chartRef.current, {
        backgroundColor: '#262626',
        scale: 2,
        logging: false,
        useCORS: true
      });
      
      const link = document.createElement('a');
      const timestamp = new Date().toISOString().split('T')[0];
      const chartName = chartId.replace(/-/g, '_');
      link.download = `${chartName}_${timestamp}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Error downloading chart:', error);
      alert('Failed to download chart image. Please try again.');
    }
  };
  
  return (
    <div className="pie-chart-wrapper">
      <div className="chart-controls" style={{ 
        display: 'flex', 
        justifyContent: 'flex-end', 
        gap: '8px', 
        marginBottom: '8px' 
      }}>
        <Button 
          kind="ghost" 
          size="sm"
          renderIcon={ImageIcon}
          onClick={handleDownloadChart}
          iconDescription="Download chart as image"
        >
          Download
        </Button>
      </div>
      
      <div className="pie-chart-container" id={chartId} ref={chartRef}>
        <DonutChart data={chartData} options={options} />
        <div className="chart-footer">
          <span className="chart-footer-text">
            Total: {bytesToGB(totalBytes)} GB
          </span>
          <span className="chart-footer-text chart-idle-info" style={{ marginLeft: '16px' }}>
            Idle: {idlePercentage}% ({idleItem ? idleItem.value : '0'} GB)
          </span>
        </div>
      </div>
    </div>
  );
};

const StorageOverview = ({ assets }) => {
  const { nodeDisks, pvcs } = categorizeAssets(assets);
  
  const nodeDiskData = useMemo(() => {
    const totalBytes = nodeDisks.reduce((sum, asset) => sum + (asset.bytes || 0), 0);
    const totalIdle = nodeDisks.reduce((sum, asset) => {
      const bytes = asset.bytes || 0;
      const idle = asset.breakdown?.idle || 0;
      return sum + (bytes * idle);
    }, 0);
    const totalUsed = totalBytes - totalIdle;
    
    return {
      data: [
        { label: 'Used', value: bytesToGB(totalUsed), percentage: ((totalUsed / totalBytes) * 100).toFixed(0) },
        { label: 'Idle', value: bytesToGB(totalIdle), percentage: ((totalIdle / totalBytes) * 100).toFixed(0) }
      ],
      totalBytes
    };
  }, [nodeDisks]);
  
  const pvcData = useMemo(() => {
    const totalBytes = pvcs.reduce((sum, asset) => sum + (asset.bytes || 0), 0);
    const totalIdle = pvcs.reduce((sum, asset) => {
      const bytes = asset.bytes || 0;
      const idle = asset.breakdown?.idle || 0;
      return sum + (bytes * idle);
    }, 0);
    const totalUsed = totalBytes - totalIdle;
    
    return {
      data: [
        { label: 'Used', value: bytesToGB(totalUsed), percentage: ((totalUsed / totalBytes) * 100).toFixed(0) },
        { label: 'Idle', value: bytesToGB(totalIdle), percentage: ((totalIdle / totalBytes) * 100).toFixed(0) }
      ],
      totalBytes
    };
  }, [pvcs]);
  
  return (
    <div className="storage-overview">
      <h3 className="section-title">Storage Overview</h3>
      <Grid>
        <Column lg={8} md={4} sm={4}>
          <Tile className="chart-tile">
            <div className="overview-header">
              <h4>Node Disks</h4>
              <span className="total-size">{bytesToGB(nodeDiskData.totalBytes)} GB</span>
            </div>
            <AssetPieChart 
              title="" 
              data={nodeDiskData.data} 
              totalBytes={nodeDiskData.totalBytes}
              chartId="node-disks-chart"
            />
          </Tile>
        </Column>
        
        <Column lg={8} md={4} sm={4}>
          <Tile className="chart-tile">
            <div className="overview-header">
              <h4>PVCs (Persistent Volume Claims)</h4>
              <span className="total-size">{bytesToGB(pvcData.totalBytes)} GB</span>
            </div>
            <AssetPieChart 
              title="" 
              data={pvcData.data} 
              totalBytes={pvcData.totalBytes}
              chartId="pvcs-chart"
            />
          </Tile>
        </Column>
      </Grid>
    </div>
  );
};

const ActionableInsights = ({ assets }) => {
  const insights = generateInsights(assets);
  
  if (insights.length === 0) return null;
  
  return (
    <div className="insights-panel">
      <h3 className="section-title">Actionable Insights</h3>
      {insights.map((insight, index) => (
        <InlineNotification
          key={index}
          kind={insight.type}
          title={insight.title}
          subtitle={insight.subtitle}
          lowContrast
          hideCloseButton
        />
      ))}
    </div>
  );
};

// UPDATED: Separate Usage Cell Component (no name)
const UsageCell = ({ row }) => {
  const usedPercentage = row.totalStorage > 0 
    ? (row.usedStorage / row.totalStorage) * 100 
    : 0;
  const idlePercentage = 100 - usedPercentage;
  
  const isUnused = row.usedStorage === 0;
  
  return (
    <div style={{ padding: '8px 0' }}>
      {/* Progress Bar */}
      <div style={{
        width: '100%',
        height: '8px',
        backgroundColor: '#f4f4f4',
        borderRadius: '4px',
        overflow: 'hidden',
        marginBottom: '6px',
        boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)'
      }}>
        <div style={{
          display: 'flex',
          height: '100%',
          width: '100%'
        }}>
          {/* Used portion (blue) */}
          <div style={{
            width: `${usedPercentage}%`,
            backgroundColor: '#0f62fe',
            transition: 'width 0.3s ease'
          }} />
          {/* Idle portion (orange) */}
          <div style={{
            width: `${idlePercentage}%`,
            backgroundColor: '#ff832b',
            transition: 'width 0.3s ease'
          }} />
        </div>
      </div>
      
      {/* Usage Text */}
      <div style={{
        fontSize: '12px',
        color: '#525252',
        fontWeight: 400
      }}>
        {isUnused ? (
          <span style={{ color: '#ff832b', fontWeight: 500 }}>
            Unused (100% idle)
          </span>
        ) : (
          `${row.usedStorage.toFixed(2)} GB / ${row.totalStorage.toFixed(2)} GB`
        )}
      </div>
    </div>
  );
};

// Enhanced Asset Table Component with SEPARATE Name and Usage Columns
const AssetUsageTable = ({ assets, windowDays }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortColumn, setSortColumn] = useState('name');
  const [sortDirection, setSortDirection] = useState('ASC');
  const [timeFilter, setTimeFilter] = useState('all');
  
  // Time filter options
  const timeFilterOptions = [
    { id: 'all', text: `All Time (${windowDays} days)` },
    { id: '1h', text: 'Last 1 Hour' },
    { id: '24h', text: 'Last 24 Hours' },
    { id: '7d', text: 'Last 7 Days' },
    { id: '30d', text: 'Last 30 Days' },
    { id: '90d', text: 'Last 90 Days' }
  ];
  
  // Table headers - UPDATED WITH SEPARATE COLUMNS
  const headers = [
    { key: 'name', header: 'Name' },
    { key: 'usage', header: 'Usage' },
    { key: 'type', header: 'Type' },
    { key: 'avgCost', header: 'Avg Cost ($)' },
    { key: 'status', header: 'Status' },
    { key: 'actions', header: 'Actions' }
  ];
  
  // Transform assets data for table
  const tableRows = useMemo(() => {
    return assets.map(asset => {
      const usage = calculateUsage(asset);
      const status = getAssetStatus(parseFloat(usage.idlePercentage));
      const properties = asset.properties || {};
      
      return {
        id: asset.id,
        name: properties.name || asset.name || asset.claimName || asset.providerID || 'Unknown',
        type: asset.type || 'Unknown',
        namespace: properties.namespace || asset.claimNamespace || '-',
        storageClass: asset.storageClass || '-',
        totalStorage: parseFloat(usage.totalGB),
        usedStorage: parseFloat(usage.usedGB),
        idleStorage: parseFloat(usage.idleGB),
        idlePercentage: parseFloat(usage.idlePercentage),
        avgCost: asset.totalCost || 0,
        status: status,
        assetType: asset.local === 1 ? 'Node Disk' : 'PVC',
        rawAsset: asset
      };
    });
  }, [assets]);
  
  // Filter rows based on search term
  const filteredRows = useMemo(() => {
    if (!searchTerm) return tableRows;
    
    const term = searchTerm.toLowerCase();
    return tableRows.filter(row => 
      row.name.toLowerCase().includes(term) ||
      row.type.toLowerCase().includes(term) ||
      row.assetType.toLowerCase().includes(term)
    );
  }, [tableRows, searchTerm]);
  
  // Sort rows
  const sortedRows = useMemo(() => {
    const sorted = [...filteredRows];
    
    sorted.sort((a, b) => {
      let aVal = a[sortColumn];
      let bVal = b[sortColumn];
      
      // Handle status object
      if (sortColumn === 'status') {
        aVal = a.status.label;
        bVal = b.status.label;
      }
      
      // Handle usage column (sort by used storage)
      if (sortColumn === 'usage') {
        aVal = a.usedStorage;
        bVal = b.usedStorage;
      }
      
      // Handle numeric columns
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'ASC' ? aVal - bVal : bVal - aVal;
      }
      
      // Handle string columns
      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();
      
      if (sortDirection === 'ASC') {
        return aStr < bStr ? -1 : aStr > bStr ? 1 : 0;
      } else {
        return aStr > bStr ? -1 : aStr < bStr ? 1 : 0;
      }
    });
    
    return sorted;
  }, [filteredRows, sortColumn, sortDirection]);
  
  // Paginate rows
  const paginatedRows = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedRows.slice(startIndex, startIndex + pageSize);
  }, [sortedRows, currentPage, pageSize]);
  
  // Handle sort
  const handleSort = (columnKey) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortColumn(columnKey);
      setSortDirection('ASC');
    }
  };
  
  return (
    <div className="asset-usage-table">
      <DataTable
        rows={paginatedRows}
        headers={headers}
        isSortable
        sortRow={(a, b) => 0}
      >
        {({
          rows,
          headers,
          getHeaderProps,
          getRowProps,
          getTableProps,
          getTableContainerProps
        }) => (
          <TableContainer
            title="Hourly Asset Usage Details"
            description={`Showing ${paginatedRows.length} of ${sortedRows.length} assets (${assets.length} total)`}
            {...getTableContainerProps()}
          >
            <TableToolbar>
              <TableToolbarContent>
                <TableToolbarSearch
                  placeholder="Search assets..."
                  onChange={(e) => setSearchTerm(e.target.value)}
                  value={searchTerm}
                />
                
                <Dropdown
                  id="time-filter-dropdown"
                  titleText=""
                  label="Time Window"
                  items={timeFilterOptions}
                  itemToString={(item) => item ? item.text : ''}
                  selectedItem={timeFilterOptions.find(opt => opt.id === timeFilter)}
                  onChange={({ selectedItem }) => setTimeFilter(selectedItem.id)}
                  size="sm"
                />
                
                <Button
                  kind="ghost"
                  size="sm"
                  onClick={() => exportToCSV(assets, { days: windowDays })}
                >
                  Export Table
                </Button>
              </TableToolbarContent>
            </TableToolbar>
            
            <Table {...getTableProps()}>
              <TableHead>
                <TableRow>
                  {headers.map((header) => (
                    <TableHeader
                      key={header.key}
                      {...getHeaderProps({ header })}
                      isSortable={header.key !== 'actions'}
                      onClick={() => header.key !== 'actions' && handleSort(header.key)}
                      sortDirection={sortColumn === header.key ? sortDirection : 'NONE'}
                    >
                      {header.header}
                    </TableHeader>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedRows.map((row, index) => (
                  <TableRow key={row.id} {...getRowProps({ row })}>
                    {/* NAME COLUMN - SEPARATE */}
                    <TableCell>
                      <div style={{ 
                        fontWeight: 600, 
                        fontSize: '14px',
                        color: '#161616',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        {row.name}
                        {row.assetType === 'Node Disk' && (
                          <Tag type="blue" size="sm">
                            Node Disk
                          </Tag>
                        )}
                      </div>
                    </TableCell>
                    
                    {/* USAGE COLUMN - SEPARATE */}
                    <TableCell>
                      <UsageCell row={row} />
                    </TableCell>
                    
                    <TableCell>{row.type}</TableCell>
                    <TableCell>${row.avgCost.toFixed(2)}</TableCell>
                    <TableCell>
                      <Tag type={row.status.type} size="sm">
                        {row.status.label}
                      </Tag>
                    </TableCell>
                    <TableCell>
                      <OverflowMenu size="sm" flipped>
                        <OverflowMenuItem itemText="View Details" />
                        <OverflowMenuItem itemText="View History" />
                        <OverflowMenuItem itemText="Export Data" />
                        <OverflowMenuItem 
                          itemText="Delete Asset" 
                          hasDivider 
                          isDelete 
                        />
                      </OverflowMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            <Pagination
              page={currentPage}
              pageSize={pageSize}
              pageSizes={[10, 20, 50, 100]}
              totalItems={sortedRows.length}
              onChange={({ page, pageSize }) => {
                setCurrentPage(page);
                setPageSize(pageSize);
              }}
            />
          </TableContainer>
        )}
      </DataTable>
      
      {/* Summary Statistics */}
      <div style={{ 
        marginTop: '16px', 
        padding: '16px', 
        backgroundColor: '#f4f4f4',
        borderRadius: '4px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px'
      }}>
        <div>
          <div style={{ fontSize: '12px', color: '#525252' }}>Total Assets</div>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#161616' }}>{sortedRows.length}</div>
        </div>
        <div>
          <div style={{ fontSize: '12px', color: '#525252' }}>Total Storage</div>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#161616' }}>
            {sortedRows.reduce((sum, row) => sum + row.totalStorage, 0).toFixed(2)} GB
          </div>
        </div>
        <div>
          <div style={{ fontSize: '12px', color: '#525252' }}>Avg Idle Rate</div>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#161616' }}>
            {sortedRows.length > 0 
              ? (sortedRows.reduce((sum, row) => sum + row.idlePercentage, 0) / sortedRows.length).toFixed(1)
              : 0}%
          </div>
        </div>
        <div>
          <div style={{ fontSize: '12px', color: '#525252' }}>Total Cost</div>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#161616' }}>
            ${sortedRows.reduce((sum, row) => sum + row.avgCost, 0).toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
};

const AssetsDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState([]);
  const [assetsData, setAssetsData] = useState(null);
  const [rawData, setRawData] = useState(null);
  const [window, setWindow] = useState('120d');
  const [useMockData, setUseMockData] = useState(DEV_MODE);
  const [exportingImage, setExportingImage] = useState(false);
  const dashboardRef = useRef(null);
  
  // Time window options
  const timeWindowOptions = [
    { id: '1h', text: '1 Hour', value: '1h' },
    { id: '1d', text: '1 Day', value: '1d' },
    { id: '7d', text: '7 Days', value: '7d' },
    { id: '30d', text: '30 Days', value: '30d' },
    { id: '60d', text: '60 Days', value: '60d' },
    { id: '120d', text: '120 Days', value: '120d' }
  ];
  
  const fetchData = async () => {
    setLoading(true);
    setErrors([]);
    
    try {
      let result;
      
      if (useMockData) {
        console.log('Using mock data for development');
        result = AssetsService.getMockData();
        await new Promise(resolve => setTimeout(resolve, 500));
      } else {
        result = await AssetsService.fetchAssets(window, {
          resolution: '1d',
          accumulate: true
        });
      }
      
      if (result && result.data) {
        setRawData(result.data);
        
        let assetsArray = [];
        
        Object.entries(result.data).forEach(([clusterKey, clusterData]) => {
          if (clusterData && typeof clusterData === 'object') {
            if (clusterData.nodes) {
              Object.entries(clusterData.nodes).forEach(([nodeKey, nodeData]) => {
                assetsArray.push({
                  id: `${clusterKey}-node-${nodeKey}`,
                  name: nodeKey,
                  cluster: clusterKey,
                  ...nodeData
                });
              });
            }
            
            if (clusterData.pvc) {
              Object.entries(clusterData.pvc).forEach(([pvcKey, pvcData]) => {
                assetsArray.push({
                  id: `${clusterKey}-pvc-${pvcKey}`,
                  name: pvcData.claimName || pvcKey,
                  cluster: clusterKey,
                  ...pvcData
                });
              });
            }
            
            if (!clusterData.nodes && !clusterData.pvc && clusterData.type) {
              assetsArray.push({
                id: clusterKey,
                name: clusterKey,
                ...clusterData
              });
            }
          }
        });
        
        if (assetsArray.length === 0) {
          setErrors([
            {
              primary: "No assets found",
              secondary: "The API returned data but no assets could be parsed."
            }
          ]);
        }
        
        setAssetsData({
          assets: assetsArray,
          window: result.window || { start: '', end: '', days: 120 }
        });
      } else {
        setErrors([
          {
            primary: "No data available",
            secondary: "No assets data found in the response."
          }
        ]);
      }
    } catch (error) {
      console.error("Error fetching assets:", error);
      
      const errorMessage = error.message || 'Unknown error occurred';
      const isNetworkError = errorMessage.includes('Could not connect') || 
                            errorMessage.includes('Failed to fetch');
      
      setErrors([
        {
          primary: isNetworkError ? "Connection Failed" : "Failed to load assets data",
          secondary: errorMessage
        }
      ]);
      
      if (isNetworkError && !useMockData) {
        setErrors(prev => [...prev, {
          primary: "Tip: Enable Mock Data",
          secondary: "You can enable mock data mode below to see how the dashboard works while debugging the API connection."
        }]);
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleExportData = (format) => {
    if (!assetsData || !assetsData.assets) return;
    
    if (format === 'csv') {
      exportToCSV(assetsData.assets, assetsData.window);
    } else if (format === 'json') {
      exportToJSON(assetsData.assets, assetsData.window, rawData);
    }
  };
  
  const handleExportImage = async () => {
    if (!dashboardRef.current) return;
    
    setExportingImage(true);
    
    try {
      const canvas = await html2canvas(dashboardRef.current, {
        backgroundColor: '#161616',
        scale: 2,
        logging: false,
        useCORS: true
      });
      
      const link = document.createElement('a');
      const timestamp = new Date().toISOString().split('T')[0];
      link.download = `storage-assets-dashboard-${timestamp}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Error exporting image:', error);
      setErrors([{
        primary: "Export Failed",
        secondary: "Failed to export dashboard as image. Please try again."
      }]);
    } finally {
      setExportingImage(false);
    }
  };
  
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [window, useMockData]);
  
  if (loading) {
    return (
      <Page active="assets.html">
        <Header headerTitle="Storage Assets">
          <IconButton aria-label="refresh" onClick={fetchData}>
            <RefreshIcon />
          </IconButton>
        </Header>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '400px' 
        }}>
          <Loading description="Loading assets data..." withOverlay={false} />
        </div>
        <Footer />
      </Page>
    );
  }
  
  if (errors.length > 0) {
    return (
      <Page active="assets.html">
        <Header headerTitle="Storage Assets">
          <IconButton aria-label="refresh" onClick={fetchData}>
            <RefreshIcon />
          </IconButton>
        </Header>
        <div style={{ marginBottom: 20 }}>
          <Warnings warnings={errors} />
          <div style={{ marginTop: 20, padding: 20 }}>
            <Toggle
              id="mock-data-toggle"
              labelText="Use Mock Data (Development Mode)"
              toggled={useMockData}
              onToggle={(checked) => setUseMockData(checked)}
            />
          </div>
        </div>
        <Footer />
      </Page>
    );
  }
  
  if (!assetsData || !assetsData.assets || assetsData.assets.length === 0) {
    return (
      <Page active="assets.html">
        <Header headerTitle="Storage Assets">
          <IconButton aria-label="refresh" onClick={fetchData}>
            <RefreshIcon />
          </IconButton>
        </Header>
        <div style={{ marginBottom: 20 }}>
          <Warnings warnings={[
            {
              primary: "No assets found",
              secondary: "There are no storage assets available for the selected time window."
            }
          ]} />
          <div style={{ marginTop: 20, padding: 20 }}>
            <Toggle
              id="mock-data-toggle"
              labelText="Use Mock Data (Development Mode)"
              toggled={useMockData}
              onToggle={(checked) => setUseMockData(checked)}
            />
          </div>
        </div>
        <Footer />
      </Page>
    );
  }
  
  const { assets, window: windowData } = assetsData;
  const windowDays = windowData?.days || 120;
  
  return (
    <Page active="assets.html">
      <Header headerTitle="Storage Assets">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {useMockData && (
            <Tag type="blue" size="sm">MOCK DATA</Tag>
          )}
          <Button 
            kind="ghost" 
            size="sm"
            renderIcon={DownloadIcon}
            onClick={() => handleExportData('csv')}
          >
            Export CSV
          </Button>
          <Button 
            kind="ghost" 
            size="sm"
            renderIcon={DownloadIcon}
            onClick={() => handleExportData('json')}
          >
            Export JSON
          </Button>
          <Button 
            kind="ghost" 
            size="sm"
            renderIcon={ImageIcon}
            onClick={handleExportImage}
            disabled={exportingImage}
          >
            {exportingImage ? 'Exporting...' : 'Export Image'}
          </Button>
          <IconButton aria-label="refresh" onClick={fetchData}>
            <RefreshIcon />
          </IconButton>
        </div>
      </Header>
      
      <div className="assets-dashboard" ref={dashboardRef}>
        <div className="dashboard-header">
          <Breadcrumb noTrailingSlash>
            <BreadcrumbItem href="#overview">Overview</BreadcrumbItem>
            <BreadcrumbItem href="#assets">Assets</BreadcrumbItem>
            <BreadcrumbItem href="#cluster" isCurrentPage>default-cluster</BreadcrumbItem>
          </Breadcrumb>
          
          <div className="header-actions">
            <Dropdown
              id="window-selector"
              titleText=""
              label="Time Window"
              items={timeWindowOptions}
              itemToString={(item) => item ? item.text : ''}
              selectedItem={timeWindowOptions.find(opt => opt.value === window)}
              onChange={({ selectedItem }) => setWindow(selectedItem.value)}
              size="sm"
            />
            <Toggle
              id="mock-data-toggle-header"
              labelText="Mock Data"
              size="sm"
              toggled={useMockData}
              onToggle={(checked) => setUseMockData(checked)}
            />
          </div>
        </div>
        
        <div className="dashboard-title-section">
          {windowData && (
            <p className="time-window">
              Time window: {new Date(windowData.start).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
              })} – {new Date(windowData.end).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
              })} ({windowDays} days)
            </p>
          )}
        </div>
        
        <AssetSummaryTiles assets={assets} windowDays={windowDays} />
        
        <StorageOverview assets={assets} />
        
        <ActionableInsights assets={assets} />
        
        {/* Enhanced Table View with SEPARATE Name and Usage Columns */}
        <div className="asset-table-section" style={{ marginTop: '32px' }}>
          <AssetUsageTable assets={assets} windowDays={windowDays} />
        </div>
      </div>
      
      <Footer />
    </Page>
  );
};

export default AssetsDashboard;