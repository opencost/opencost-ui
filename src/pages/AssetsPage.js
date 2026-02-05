import React, { useState, useMemo } from 'react';
import { mockAssetsData, assetTypeConfig, costTrendData } from '../mockdata/assetsData';
import {
  Button,
  DataTable,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  TableContainer,
  Tag,
  Tile,
  Grid,
  Column
} from '@carbon/react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { Download } from '@carbon/icons-react';
import { SidebarNav } from '../components/Nav/SidebarNav';
import '../css/AssetsPage.css';

const AssetsPage = () => {
  // State for filtering, searching, sorting, pagination
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [providerFilter, setProviderFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('high-to-low');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // Get all assets from mock data
  const allAssets = mockAssetsData.data;

  // Calculate total cost of all assets
  const totalCost = allAssets.reduce((sum, asset) => sum + asset.cost.totalCost, 0);

  // Create dynamic card data from asset types
  const cardData = assetTypeConfig.map(config => {
    const typeAssets = allAssets.filter(asset => asset.type === config.type);
    const typeTotalCost = typeAssets.reduce((sum, asset) => sum + asset.cost.totalCost, 0);

    return {
      ...config,
      count: typeAssets.length,
      totalCost: typeTotalCost,
      assets: typeAssets
    };
  });

  // Find the most expensive asset
  const mostExpensive = allAssets.length > 0 ? allAssets.reduce((max, asset) =>
    asset.cost.totalCost > max.cost.totalCost ? asset : max
    , allAssets[0]) : null;

  // Filter, search, and sort assets
  const filteredAssets = useMemo(() => {
    let result = allAssets;

    // Filter by type
    if (selectedFilter !== 'all') {
      result = result.filter(asset => asset.type === selectedFilter);
    }

    // Filter by provider
    if (providerFilter !== 'all') {
      result = result.filter(asset => asset.provider === providerFilter);
    }

    // Search by name
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(asset => asset.name.toLowerCase().includes(term));
    }

    // Sort by cost
    if (sortOrder === 'high-to-low') {
      result = [...result].sort((a, b) => b.cost.totalCost - a.cost.totalCost);
    } else {
      result = [...result].sort((a, b) => a.cost.totalCost - b.cost.totalCost);
    }

    return result;
  }, [allAssets, selectedFilter, providerFilter, searchTerm, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredAssets.length / pageSize);
  const paginatedAssets = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAssets.slice(start, start + pageSize);
  }, [filteredAssets, currentPage, pageSize]);

  // Reset to page 1 when filters change
  const handleFilterChange = (filter) => {
    setSelectedFilter(filter);
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleSortChange = (sort) => {
    setSortOrder(sort);
    setCurrentPage(1);
  };

  const handleProviderChange = (provider) => {
    setProviderFilter(provider);
    setCurrentPage(1);
  };

  // Reusable Card Component
  const AssetCard = ({ type, label, icon, color, count, totalCost, totalInfrastructureCost }) => {
    return (
      <Tile className="metric-tile">
        <div className="card-title">{icon} {label}</div>
        <div className="card-value">{count}</div>
        <div className="card-cost">${totalCost.toFixed(2)}</div>
        <div className="progress-bar">
          <div
            className={`progress-fill progress-fill-${color}`}
            style={{ width: `${totalCost > 0 && totalInfrastructureCost > 0 ? (totalCost / totalInfrastructureCost * 100) : 0}%` }}
          ></div>
        </div>
        <Tag type={color} size="sm">{label}</Tag>
      </Tile>
    );
  };

  // Chart Colors
  const COLORS = ['#0f62fe', '#8a3ffc', '#d12771', '#0072c3', '#1192e8', '#009d9a'];

  // Prepare data for Area Chart
  const areaChartData = useMemo(() => {
    return costTrendData.map(day => ({
      date: day.date,
      'Compute Nodes': day.Node,
      'Disks': day.Disk,
      'Persistent Volumes': day.PersistentVolume,
      'Load Balancers': day.LoadBalancer,
      'Networks': day.Network,
      'Clusters': day.Cluster
    }));
  }, []);

  // Prepare data for Pie Chart
  const pieChartData = useMemo(() => {
    return cardData
      .filter(card => card.totalCost > 0) // Only include cards with cost
      .map((card, index) => ({
        name: card.label,
        value: card.totalCost,
        color: COLORS[index % COLORS.length]
      }));
  }, [cardData]);

  // Prepare data for Bar Chart
  const barChartData = useMemo(() => {
    const sortedAssets = [...allAssets]
      .sort((a, b) => b.cost.totalCost - a.cost.totalCost)
      .slice(0, 10) // Top 10
      .map(asset => ({
        name: asset.name.length > 20 ? asset.name.substring(0, 20) + '...' : asset.name,
        cost: asset.cost.totalCost
      }));
    return sortedAssets;
  }, [allAssets]);

  // Custom Tooltip Component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip" style={{
          backgroundColor: '#fff',
          padding: '10px',
          border: '1px solid #ccc',
          borderRadius: '4px',
        }}>
          <p className="tooltip-label" style={{ margin: 0, fontWeight: 'bold' }}>{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="tooltip-value" style={{ margin: '5px 0 0 0', color: entry.color }}>
              {entry.dataKey}: ${Number(entry.value).toFixed(2)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Function to download CSV file
  const downloadCSV = () => {
    // Create CSV header
    const headers = ['Name', 'Type', 'Cluster', 'Provider', 'Cost'];

    // Create CSV rows
    const rows = filteredAssets.map(asset => [
      asset.name,
      asset.type,
      asset.cluster,
      asset.provider,
      `$${asset.cost.totalCost.toFixed(2)}`
    ]);

    // Combine headers and rows
    const csvContent = [headers, ...rows]
      .map(row => row.join(','))
      .join('\n');

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'assets-report.csv';
    link.click();
  };

  // Get nice display name for asset type
  const getTypeName = (type) => {
    const names = {
      node: 'Compute Node',
      disk: 'Disk',
      persistentVolume: 'Persistent Volume',
      loadBalancer: 'Load Balancer'
    };
    return names[type] || type;
  };

  // Get color for type badge
  const getTypeColor = (type) => {
    const colors = {
      node: 'blue',           // Compute Node → blue
      disk: 'purple',         // Disk → purple
      persistentVolume: 'cyan', // Persistent Volume → cyan
      loadBalancer: 'green',  // Load Balancer → green
      network: 'purple'       // Network → purple
    };
    return colors[type] || 'gray'; // Other → gray
  };

  // Prepare data for Carbon DataTable
  const headers = [
    { key: 'name', header: 'Asset Name' },
    { key: 'type', header: 'Type' },
    { key: 'cluster', header: 'Cluster' },
    { key: 'provider', header: 'Provider' },
    { key: 'cost', header: 'Cost (7d)' },
  ];

  const rows = paginatedAssets.map((asset, index) => ({
    id: String(index),
    name: asset.name,
    type: asset.type,
    cluster: asset.cluster,
    provider: asset.provider,
    cost: asset.cost.totalCost,
    _asset: asset, // Store full asset for expanded content
  }));

  // Filter dropdown options
  const filterOptions = [
    { id: 'all', text: 'All Types' },
    ...cardData.map(card => ({ id: card.type, text: card.label }))
  ];

  // Sort dropdown options
  const sortOptions = [
    { id: 'high-to-low', text: 'Cost: High to Low' },
    { id: 'low-to-high', text: 'Cost: Low to High' }
  ];

  // Provider dropdown options - get unique providers from assets
  const uniqueProviders = [...new Set(allAssets.map(asset => asset.provider))];
  const providerOptions = [
    { id: 'all', text: 'All Providers' },
    ...uniqueProviders.map(provider => ({ id: provider, text: provider }))
  ];

  return (
    <div className="assets-page-container">
      <SidebarNav active="/assets" />

      {/* Page Title */}
      <h1 className="page-title">Assets Overview</h1>

      {/* Total Cost Card using Carbon Tile */}
      <Tile className="total-cost-tile">
        <div className="total-cost-label">Total Infrastructure Cost</div>
        <div className="total-cost-value">${totalCost.toFixed(2)}</div>
        <div className="total-cost-subtext">Last 7 days • {allAssets.length} total assets</div>
      </Tile>

      {/* Most Expensive Asset Banner */}
      <div className="expensive-banner">
        <span className="expensive-icon">💡</span>
        <div className="expensive-text">
          <strong>Cost Insight:</strong> {mostExpensive.name} is your most expensive asset at ${mostExpensive.cost.totalCost.toFixed(2)} per week
        </div>
      </div>

      {/* Dynamic Cards Row using Carbon Tiles */}
      <div className="cards-row">
        {cardData.map(card => (
          <AssetCard
            key={card.type}
            type={card.type}
            label={card.label}
            icon={card.icon}
            color={card.color}
            count={card.count}
            totalCost={card.totalCost}
            totalInfrastructureCost={totalCost}
          />
        ))}
      </div>

      <section className="charts-section" style={{ marginBottom: "2rem" }}>
        {/*  Area Chart and Pie Chart */}
        <Grid style={{ marginBottom: "2rem" }}>
          <Column lg={8} md={8} sm={4}>
            {/* Area Chart - Cost Trend Over Time */}
            <Tile className="chart-tile" style={{ padding: "1.5rem" }}>
              <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1.125rem", fontWeight: 600 }}>Cost Trend by Asset Type</h3>
              <p style={{ margin: "0 0 1rem 0", fontSize: "0.875rem", color: "#525252" }}>Last 7 days infrastructure costs</p>
              <div style={{ height: "280px", width: "100%" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={areaChartData}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11 }}
                      stroke="#525252"
                    />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      stroke="#525252"
                      tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        padding: '8px'
                      }}
                      formatter={(value) => [`$${Number(value).toFixed(2)}`, '']}
                    />
                    <Legend
                      wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                      iconSize={10}
                    />
                    <Area
                      type="monotone"
                      dataKey="Compute Nodes"
                      stackId="1"
                      stroke={COLORS[0]}
                      fill={COLORS[0]}
                      fillOpacity={0.8}
                    />
                    <Area
                      type="monotone"
                      dataKey="Disks"
                      stackId="1"
                      stroke={COLORS[1]}
                      fill={COLORS[1]}
                      fillOpacity={0.8}
                    />
                    <Area
                      type="monotone"
                      dataKey="Persistent Volumes"
                      stackId="1"
                      stroke={COLORS[2]}
                      fill={COLORS[2]}
                      fillOpacity={0.8}
                    />
                    <Area
                      type="monotone"
                      dataKey="Load Balancers"
                      stackId="1"
                      stroke={COLORS[3]}
                      fill={COLORS[3]}
                      fillOpacity={0.8}
                    />
                    <Area
                      type="monotone"
                      dataKey="Networks"
                      stackId="1"
                      stroke={COLORS[4]}
                      fill={COLORS[4]}
                      fillOpacity={0.8}
                    />
                    <Area
                      type="monotone"
                      dataKey="Clusters"
                      stackId="1"
                      stroke={COLORS[5]}
                      fill={COLORS[5]}
                      fillOpacity={0.8}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Tile>
          </Column>

          <Column lg={8} md={8} sm={4}>
            {/* Pie Chart - Cost Distribution */}
            <Tile className="chart-tile" style={{ padding: "1.5rem" }}>
              <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1.125rem", fontWeight: 600 }}>Cost by Asset Type</h3>
              <p style={{ margin: "0 0 1rem 0", fontSize: "0.875rem", color: "#525252" }}>Distribution of infrastructure costs</p>
              <div style={{ height: "280px", width: "100%" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="45%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                      label={({ name, value }) => `$${value.toFixed(0)}`}
                      labelLine={false}
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        padding: '8px'
                      }}
                      formatter={(value, name) => [`$${Number(value).toFixed(2)}`, name]}
                    />
                    <Legend
                      layout="horizontal"
                      verticalAlign="bottom"
                      align="center"
                      wrapperStyle={{ fontSize: '11px', paddingTop: '5px' }}
                      iconSize={10}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Tile>
          </Column>
        </Grid>

        {/*  Bar Chart */}
        <Grid>
          <Column lg={8} md={8} sm={4}>
            {/* Horizontal Bar Chart - Top 10 Most Expensive Assets */}
            <Tile className="chart-tile" style={{ padding: "1.5rem" }}>
              <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1.125rem", fontWeight: 600 }}>Top 10 Most Expensive Assets</h3>
              <p style={{ margin: "0 0 1rem 0", fontSize: "0.875rem", color: "#525252" }}>Sorted by total cost descending</p>
              <div style={{ height: "280px", width: "100%" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={barChartData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" horizontal={false} />
                    <XAxis
                      type="number"
                      tick={{ fontSize: 11 }}
                      stroke="#525252"
                      tickFormatter={(value) => `$${value}`}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={150}
                      tick={{ fontSize: 10 }}
                      stroke="#525252"
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        padding: '8px'
                      }}
                      formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Cost']}
                      cursor={{ fill: '#f4f4f4' }}
                    />
                    <Bar
                      dataKey="cost"
                      fill={COLORS[0]}
                      barSize={20}
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Tile>
          </Column>
        </Grid>
      </section>

      {/* Filter Section: Search, Filter Dropdown, Sort Dropdown */}
      <div className="filter-section">
        {/* Search Bar with Icon */}
        <div className="search-wrapper">
          <svg className="search-icon" viewBox="0 0 16 16" fill="currentColor">
            <path d="M6.5 12a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11zm4.157-1.343a6.5 6.5 0 1 1 1.06-1.06l3.686 3.686a.75.75 0 1 1-1.06 1.06l-3.686-3.686z" />
          </svg>
          <input
            type="text"
            className="search-input"
            placeholder="Search by asset name..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
          {searchTerm && (
            <button
              type="button"
              className="search-clear"
              onClick={() => { setSearchTerm(''); setCurrentPage(1); }}
              aria-label="Clear search"
            >
              <svg viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 6.586L11.293 3.293a1 1 0 1 1 1.414 1.414L9.414 8l3.293 3.293a1 1 0 0 1-1.414 1.414L8 9.414l-3.293 3.293a1 1 0 0 1-1.414-1.414L6.586 8 3.293 4.707a1 1 0 0 1 1.414-1.414L8 6.586z" />
              </svg>
            </button>
          )}
        </div>

        {/* Filter Dropdown - Native HTML Select */}
        <div className="filter-dropdown-wrapper">
          <label className="filter-label" htmlFor="type-filter">Filter by Type:</label>
          <select
            id="type-filter"
            className="filter-select"
            value={selectedFilter}
            onChange={(e) => handleFilterChange(e.target.value)}
          >
            {filterOptions.map(opt => (
              <option key={opt.id} value={opt.id}>{opt.text}</option>
            ))}
          </select>
        </div>

        {/* Sort Dropdown - Native HTML Select */}
        <div className="filter-dropdown-wrapper">
          <label className="filter-label" htmlFor="sort-order">Sort by Cost:</label>
          <select
            id="sort-order"
            className="filter-select"
            value={sortOrder}
            onChange={(e) => handleSortChange(e.target.value)}
          >
            {sortOptions.map(opt => (
              <option key={opt.id} value={opt.id}>{opt.text}</option>
            ))}
          </select>
        </div>

        {/* Provider Filter Dropdown */}
        <div className="filter-dropdown-wrapper">
          <label className="filter-label" htmlFor="provider-filter">Provider:</label>
          <select
            id="provider-filter"
            className="filter-select"
            value={providerFilter}
            onChange={(e) => handleProviderChange(e.target.value)}
          >
            {providerOptions.map(opt => (
              <option key={opt.id} value={opt.id}>{opt.text}</option>
            ))}
          </select>
        </div>

        {/* Flex Spacer */}
        <div className="filter-spacer"></div>
      </div>


      {/* Data Table using Carbon DataTable */}
      <div className="table-wrapper">
        {/* Custom Table Header with Export Button */}
        <div className="table-header">
          <div className="table-header-text">
            <h4 className="table-title">Assets Inventory</h4>
            <p className="table-description">
              Showing {paginatedAssets.length} of {filteredAssets.length} assets
            </p>
          </div>
          <Button
            className="export-btn"
            kind="primary"
            size="sm"
            renderIcon={Download}
            onClick={downloadCSV}
          >
            Export CSV
          </Button>
        </div>

        {/* Responsive Table Wrapper */}
        <div className="table-responsive-wrapper">
          <DataTable rows={rows} headers={headers}>
            {({
              rows,
              headers,
              getTableProps,
              getRowProps,
            }) => (
              <TableContainer>
                <Table className="assets-table" {...getTableProps()}>
                  <TableHead>
                    <TableRow>
                      {headers.map((header) => (
                        <TableHeader
                          key={header.key}
                          className={header.key === 'cost' ? 'cost-header' : header.key === 'name' ? 'name-header' : ''}
                        >
                          {header.header}
                        </TableHeader>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.map((row) => (
                      <TableRow {...getRowProps({ row })} key={row.id} className="assets-table-row">
                        {row.cells.map((cell) => (
                          <TableCell key={cell.id} className={`cell-${cell.info.header}`}>
                            {cell.info.header === 'type' ? (
                              <Tag type={getTypeColor(cell.value)} size="sm">
                                {getTypeName(cell.value)}
                              </Tag>
                            ) : cell.info.header === 'provider' ? (
                              <Tag type="cool-gray" size="sm">{cell.value}</Tag>
                            ) : cell.info.header === 'cost' ? (
                              <span className="cost-value">${cell.value.toFixed(2)}</span>
                            ) : cell.info.header === 'name' ? (
                              <span className="asset-name">{cell.value}</span>
                            ) : (
                              cell.value
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </DataTable>
        </div>
        {/* Pagination Controls */}
        <div className="pagination-section">
          <div className="pagination-buttons">
            <div className="pagination-button-group">
              <Button
                className="pagination-button"
                kind="secondary"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="pagination-info">
                Page {currentPage} of {totalPages || 1}
              </span>
              <Button
                className="pagination-button"
                kind="secondary"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage >= totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetsPage;