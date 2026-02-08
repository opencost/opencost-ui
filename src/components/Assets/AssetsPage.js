import React, { useEffect, useState, useMemo } from 'react';
import { Grid, Column, Dropdown, Loading, Tile, Button } from '@carbon/react';
import { Renew } from '@carbon/icons-react'; // <--- Import Icon
import { getAssets } from '../../services/assets'; 

// Import Components
import AssetSummary from './AssetSummary';
import { AssetTypeChart, AssetProviderChart } from './AssetCharts'; 
import AssetsTable from './AssetsTable';

const timeOptions = [
  { name: "Today", value: "today" },
  { name: "Yesterday", value: "yesterday" },
  { name: "Last 24h", value: "24h" },
  { name: "Last 48h", value: "48h" },
  { name: "Week-to-date", value: "week" },
  { name: "Last week", value: "lastweek" },
  { name: "Last 7 days", value: "7d" },
  { name: "Last 14 days", value: "14d" },
  { name: "Last 30 days", value: "30d" }
];

const getCategory = (type) => {
  const t = (type || '').toLowerCase();
  if (t.includes('node')) return 'Compute';
  if (t.includes('disk') || t.includes('pvc') || t.includes('volume')) return 'Storage';
  if (t.includes('loadbalancer') || t.includes('network')) return 'Network';
  return 'Other';
};

const AssetsPage = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Set default to "Last 7 days"
  const [selectedWindow, setSelectedWindow] = useState(timeOptions[6]); 
  const [selectedType, setSelectedType] = useState('All Types');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');

  // 1. DATA FETCHING LOGIC (Reusable)
  const fetchData = () => {
    setLoading(true);
    getAssets(selectedWindow.value)
      .then(data => { setAssets(data); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  };

  // Initial Fetch & Fetch on Time Change
  useEffect(() => {
    fetchData();
  }, [selectedWindow]);

  // 2. REFRESH HANDLER
  const handleRefresh = () => {
    fetchData();
  };

  const assetTypes = useMemo(() => {
    const types = new Set(assets.map(a => a.type || 'Unknown'));
    return ['All Types', ...Array.from(types)];
  }, [assets]);

  const assetCategories = useMemo(() => {
    const cats = new Set(assets.map(a => getCategory(a.type)));
    return ['All Categories', ...Array.from(cats)];
  }, [assets]);

  const filteredAssets = assets.filter(item => {
    const typeMatch = selectedType === 'All Types' || item.type === selectedType;
    const catMatch = selectedCategory === 'All Categories' || getCategory(item.type) === selectedCategory;
    return typeMatch && catMatch;
  });

  return (
    <Grid className="assets-page" fullWidth style={{ padding: '2rem', maxWidth: '100%' }}>
      
      <Column lg={16} md={8} sm={4} style={{ marginBottom: '2rem' }}>
         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h1 style={{ fontWeight: '300', fontSize: '2.5rem', color: '#161616' }}>
                Assets
            </h1>
         </div>

         <Grid narrow>
           {/* Time Filter */}
           <Column lg={4} md={4} sm={4}>
             <Dropdown
                id="time-window"
                titleText="Time Range"
                label="Time Range"
                items={timeOptions}
                itemToString={(item) => (item ? item.name : '')}
                selectedItem={selectedWindow}
                onChange={({ selectedItem }) => setSelectedWindow(selectedItem)}
             />
           </Column>

           {/* Type Filter */}
           <Column lg={4} md={4} sm={4}>
             <Dropdown
                id="asset-type"
                titleText="Asset Type"
                label="Asset Type"
                items={assetTypes}
                selectedItem={selectedType}
                onChange={({ selectedItem }) => setSelectedType(selectedItem)}
             />
           </Column>

           {/* Category Filter */}
           <Column lg={4} md={4} sm={4}>
             <Dropdown
                id="category"
                titleText="Category"
                label="Category"
                items={assetCategories}
                selectedItem={selectedCategory}
                onChange={({ selectedItem }) => setSelectedCategory(selectedItem)}
             />
           </Column>

           {/* REFRESH BUTTON (New 4th Column) */}
           <Column lg={4} md={4} sm={4} style={{ display: 'flex', alignItems: 'flex-end' }}>
             <Button 
                kind="tertiary" 
                renderIcon={Renew} 
                onClick={handleRefresh}
                style={{ width: '100%' }}
             >
                Refresh Data
             </Button>
           </Column>
         </Grid>
      </Column>

      {loading ? (
        <Column lg={16} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', width: '100%' }}>
          <Loading withOverlay={false} description="Loading assets..." />
        </Column>
      ) : (
        <>
          <Column lg={16} md={8} sm={4}>
            <AssetSummary assets={filteredAssets} />
          </Column>

          <Column lg={16} md={8} sm={4} style={{ marginBottom: '2rem' }}>
             <Grid narrow>
               <Column lg={8} md={4} sm={4}>
                  <Tile style={{ padding: '1rem', height: '100%' }}>
                    <h4 style={{ marginBottom: '1rem', fontWeight: '400' }}>Cost by Asset Type</h4>
                    <AssetTypeChart items={filteredAssets} height="300px" />
                  </Tile>
               </Column>
               
               <Column lg={8} md={4} sm={4}>
                  <Tile style={{ padding: '1rem', height: '100%' }}>
                    <h4 style={{ marginBottom: '1rem', fontWeight: '400' }}>Cost by Provider</h4>
                    <AssetProviderChart items={filteredAssets} height="300px" />
                  </Tile>
               </Column>
             </Grid>
          </Column>

          <Column lg={16} md={8} sm={4}>
            <AssetsTable assets={filteredAssets} />
          </Column>
        </>
      )}
    </Grid>
  );
};

export default AssetsPage;