'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabList, Tab, TabPanels, TabPanel, Tag, Button, Loading } from '@carbon/react';
import { PieChart, SimpleBarChart } from '@carbon/charts-react';
import { Filter, Download } from '@carbon/icons-react';
import '@carbon/charts-react/styles.css';
import { parseAssetsResponse, fetchAssets } from '@/lib/assets-api';

const assetTypeColors = {
  Node: '#3b82f6',
  Pod: '#10b981',
  PersistentVolume: '#f59e0b',
  Storage: '#8b5cf6',
  Container: '#ec4899',
  Disk: '#06b6d4',
};

// Demo data for development/fallback
function getDemoAssets() {
  return [
    {
      id: 'node-oracle-1',
      name: '10.0.147.137',
      type: 'Node',
      provider: 'Oracle',
      cluster: 'default-cluster',
      region: 'iad',
      category: 'Compute',
      cpuCores: 4,
      ramBytes: 33347035136,
      cpuCoreHours: 66,
      cpuCost: 1.782,
      ramCost: 0.768657,
      totalCost: 2.550657,
      cpuUtilization: 0,
      ramUtilization: 0,
      carbonEmissions: 1.275,
      preemptible: true,
      lastModified: '2026-01-10',
    },
    {
      id: 'node-oracle-2',
      name: '10.0.153.45',
      type: 'Node',
      provider: 'Oracle',
      cluster: 'default-cluster',
      region: 'iad',
      category: 'Compute',
      cpuCores: 4,
      ramBytes: 33347035136,
      cpuCoreHours: 73.2,
      cpuCost: 1.9764,
      ramCost: 0.85251,
      totalCost: 2.82891,
      cpuUtilization: 0,
      ramUtilization: 0,
      carbonEmissions: 1.414,
      preemptible: true,
      lastModified: '2026-01-13',
    },
    {
      id: 'pod-1',
      name: 'web-pod-1',
      type: 'Pod',
      provider: 'Oracle',
      cluster: 'default-cluster',
      region: 'iad',
      category: 'Compute',
      cpuCores: 2,
      ramBytes: 8589934592,
      cpuCoreHours: 48,
      cpuCost: 1.296,
      ramCost: 0.384,
      totalCost: 1.68,
      cpuUtilization: 45,
      ramUtilization: 62,
      carbonEmissions: 0.84,
      preemptible: false,
      lastModified: '2026-01-15',
    },
  ];
}

export default function AssetsVisualization() {
  const [selectedAssetType, setSelectedAssetType] = useState(null);
  const [sortBy, setSortBy] = useState('cost');
  const [assets, setAssets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadAssets = async () => {
      setIsLoading(true);
      try {
        // First, try to fetch from local JSON file
        const localResponse = await fetch('/ss.json');
        if (localResponse.ok) {
          const data = await localResponse.json();
          const parsedAssets = parseAssetsResponse(data);
          if (parsedAssets.length > 0) {
            setAssets(parsedAssets);
            setError(null);
            setIsLoading(false);
            return;
          }
        }

        // If local file fails, try OpenCost API endpoint
        const endpoint = 'http://localhost:9003/allocation/assets';
        const fetchedAssets = await fetchAssets(endpoint);
        
        if (fetchedAssets.length > 0) {
          setAssets(fetchedAssets);
          setError(null);
        } else {
          // Fallback to demo data if both fail
          setAssets(getDemoAssets());
          setError('Using demo data - connect to OpenCost API for real data');
        }
      } catch (err) {
        console.error('Failed to load assets:', err);
        setAssets(getDemoAssets());
        setError('Using demo data - place ss.json in public folder or connect to OpenCost API');
      } finally {
        setIsLoading(false);
      }
    };

    loadAssets();
  }, []);

  const filteredAssets = selectedAssetType ? assets.filter((asset) => asset.type === selectedAssetType) : assets;

  const assetsByType = assets.reduce((acc, asset) => {
    const type = asset.type;
    if (!acc[type]) {
      acc[type] = { type, count: 0, totalCost: 0, totalCarbon: 0 };
    }
    acc[type].count += 1;
    acc[type].totalCost += asset.totalCost;
    acc[type].totalCarbon += asset.carbonEmissions;
    return acc;
  }, {});

  const typeData = Object.values(assetsByType);
  const totalCost = filteredAssets.reduce((sum, asset) => sum + asset.totalCost, 0);
  const totalCarbon = filteredAssets.reduce((sum, asset) => sum + asset.carbonEmissions, 0);
  const avgUtilization =
    filteredAssets.length > 0
      ? Math.round(
          (filteredAssets.reduce((sum, asset) => sum + asset.cpuUtilization + asset.ramUtilization, 0) /
            (filteredAssets.length * 2)) *
            100,
        ) / 100
      : 0;

  const sortedAssets = [...filteredAssets].sort((a, b) => {
    if (sortBy === 'cost') return b.totalCost - a.totalCost;
    return b.cpuUtilization + b.ramUtilization - (a.cpuUtilization + a.ramUtilization);
  });

  // Prepare chart data
  const pieChartData = typeData.map((item) => ({
    group: item.type,
    value: item.totalCost,
  }));

  const barChartData = sortedAssets.slice(0, 5).map((asset) => ({
    group: asset.name,
    value: asset.totalCost,
  }));

  const pieOptions = {
    title: 'Cost by Asset Type',
    resizable: true,
    height: '300px',
    pie: {
      alignment: 'center',
    },
    legend: {
      alignment: 'center',
    },
  };

  const barOptions = {
    title: 'Top 5 Assets by Cost',
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
    height: '300px',
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem' }}>
        <Loading description="Loading assets..." withOverlay={false} />
      </div>
    );
  }

  return (
    <div className="section-card" style={{ width: '100%' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h3 className="section-title">Infrastructure Assets</h3>
        <p className="section-description">Infrastructure assets with cost and carbon tracking</p>
      </div>

      {error && (
        <div style={{ padding: '0.75rem', backgroundColor: '#f1c21b', color: '#000', borderRadius: '4px', marginBottom: '1rem', fontSize: '0.875rem' }}>
          ⚠️ {error}
        </div>
      )}

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="metric-card">
          <div className="metric-label">Total Assets</div>
          <div className="metric-value">{assets.length}</div>
          <p className="metric-change" style={{ color: '#525252' }}>{typeData.length} types</p>
        </div>

        <div className="metric-card">
          <div className="metric-label">Total Cost</div>
          <div className="metric-value">${totalCost.toFixed(2)}</div>
          <p className="metric-change" style={{ color: '#525252' }}>This period</p>
        </div>

        <div className="metric-card">
          <div className="metric-label">Carbon Emissions</div>
          <div className="metric-value">{totalCarbon.toFixed(2)} kg CO₂e</div>
          <p className="metric-change" style={{ color: '#525252' }}>Environmental impact</p>
        </div>

        <div className="metric-card">
          <div className="metric-label">Avg Utilization</div>
          <div className="metric-value">{avgUtilization}%</div>
          <p className="metric-change" style={{ color: '#525252' }}>CPU + Memory</p>
        </div>
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ background: '#f4f4f4', padding: '1rem', borderRadius: '4px' }}>
          <PieChart data={pieChartData} options={pieOptions} />
        </div>

        <div style={{ background: '#f4f4f4', padding: '1rem', borderRadius: '4px' }}>
          <SimpleBarChart data={barChartData} options={barOptions} />
        </div>
      </div>

      {/* Assets List Section */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #e0e0e0' }}>
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#161616' }}>All Assets</h4>
            <p style={{ fontSize: '0.875rem', color: '#525252' }}>View and manage infrastructure resources</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button kind="ghost" size="sm" renderIcon={Filter}>
              Filter
            </Button>
            <Button kind="ghost" size="sm" renderIcon={Download}>
              Export
            </Button>
          </div>
        </div>

        <Tabs>
          <TabList aria-label="Asset type tabs">
            <Tab onClick={() => setSelectedAssetType(null)}>All ({assets.length})</Tab>
            {typeData.map((type) => (
              <Tab key={type.type} onClick={() => setSelectedAssetType(type.type)}>
                {type.type} ({type.count})
              </Tab>
            ))}
          </TabList>
          <TabPanels>
            <TabPanel>
              <div style={{ marginTop: '1rem', maxHeight: '400px', overflowY: 'auto' }}>
                {sortedAssets.map((asset) => (
                  <div
                    key={asset.id}
                    style={{
                      padding: '0.75rem',
                      borderRadius: '4px',
                      border: '1px solid #e0e0e0',
                      marginBottom: '0.5rem',
                      transition: 'background-color 0.2s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f4f4f4')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                          <h4 style={{ fontWeight: '500', fontSize: '0.875rem' }}>{asset.name}</h4>
                          <Tag type="blue" size="sm">
                            {asset.type}
                          </Tag>
                          {asset.preemptible && (
                            <Tag type="outline" size="sm">
                              Preemptible
                            </Tag>
                          )}
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            gap: '1rem',
                            fontSize: '0.75rem',
                            color: '#8d8d8d',
                            marginTop: '0.25rem',
                          }}
                        >
                          <span>{asset.cluster}</span>
                          <span>{asset.region}</span>
                          <span>CPU: {asset.cpuUtilization}%</span>
                          <span>RAM: {asset.ramUtilization}%</span>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: '600', fontSize: '0.875rem' }}>${asset.totalCost.toFixed(2)}</div>
                        <div style={{ fontSize: '0.75rem', color: '#8d8d8d' }}>
                          {asset.carbonEmissions.toFixed(2)} kg CO₂e
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabPanel>
            {typeData.map((type) => (
              <TabPanel key={type.type}>
                <div style={{ marginTop: '1rem', maxHeight: '400px', overflowY: 'auto' }}>
                  {sortedAssets
                    .filter((asset) => asset.type === type.type)
                    .map((asset) => (
                      <div
                        key={asset.id}
                        style={{
                          padding: '0.75rem',
                          borderRadius: '4px',
                          border: '1px solid #e0e0e0',
                          marginBottom: '0.5rem',
                          transition: 'background-color 0.2s',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f4f4f4')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                          <div style={{ flex: 1 }}>
                            <div
                              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}
                            >
                              <h4 style={{ fontWeight: '500', fontSize: '0.875rem' }}>{asset.name}</h4>
                              <Tag type="blue" size="sm">
                                {asset.type}
                              </Tag>
                              {asset.preemptible && (
                                <Tag type="outline" size="sm">
                                  Preemptible
                                </Tag>
                              )}
                            </div>
                            <div
                              style={{
                                display: 'flex',
                                gap: '1rem',
                                fontSize: '0.75rem',
                                color: '#8d8d8d',
                                marginTop: '0.25rem',
                              }}
                            >
                              <span>{asset.cluster}</span>
                              <span>{asset.region}</span>
                              <span>CPU: {asset.cpuUtilization}%</span>
                              <span>RAM: {asset.ramUtilization}%</span>
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: '600', fontSize: '0.875rem' }}>${asset.totalCost.toFixed(2)}</div>
                            <div style={{ fontSize: '0.75rem', color: '#8d8d8d' }}>
                              {asset.carbonEmissions.toFixed(2)} kg CO₂e
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </TabPanel>
            ))}
          </TabPanels>
        </Tabs>
      </div>
    </div>
  );
}