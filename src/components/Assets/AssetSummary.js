import React from 'react';
import { Tile, Grid, Column } from '@carbon/react';
import { 
  Cube,             // For "Total Assets"
  CurrencyDollar,   // For "Total Cost"
  ChartClusterBar,  // For "Asset Types"
  WarningFilled     // For "Insight"
} from '@carbon/icons-react';

const AssetSummary = ({ assets }) => {
  // 1. Calculations
  const totalAssets = assets.length;

  // Find the single most expensive item
  const topSpender = assets.reduce((prev, current) => {
    const prevCost = prev.totalCost || prev.cost || 0;
    const currCost = current.totalCost || current.cost || 0;
    return (prevCost > currCost) ? prev : current;
  }, { totalCost: 0, name: 'None' });
  
  const totalCost = assets.reduce((sum, item) => {
    const cost = item.totalCost || item.cost || (item.cpuCost + item.ramCost) || 0;
    return sum + cost;
  }, 0);

  const uniqueTypes = new Set(assets.map(a => a.type)).size;
  
  // Formatter
  const fmtMoney = (val) => new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD',
    minimumFractionDigits: 2 
  }).format(val);

  // 2. Reusable "Standard Card" Component
  const SummaryCard = ({ title, value, Icon, subtext }) => (
    <Tile style={{ 
      height: '100%', 
      minHeight: '160px', 
      backgroundColor: '#ffffff',
      borderTop: '4px solid #0f62fe', 
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <h6 style={{ color: '#525252', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {title}
        </h6>
        <Icon size={24} style={{ fill: '#0f62fe', opacity: 0.8 }} />
      </div>
      <div>
        <h2 style={{ fontSize: '2.5rem', fontWeight: '300', lineHeight: '1', marginBottom: '0.25rem' }}>
          {value}
        </h2>
        {subtext && <p style={{ fontSize: '0.75rem', color: '#6f6f6f' }}>{subtext}</p>}
      </div>
    </Tile>
  );

  return (
    <Grid narrow className="asset-summary-grid" style={{ padding: 0, marginBottom: '2rem' }}>
      
      {/* Standard Cards */}
      <Column lg={4} md={4} sm={4}>
        <SummaryCard title="Total Assets" value={totalAssets} Icon={Cube} subtext="Active resources found" />
      </Column>

      <Column lg={4} md={4} sm={4}>
        <SummaryCard title="Total Cost" value={fmtMoney(totalCost)} Icon={CurrencyDollar} subtext="Cumulative cost for window" />
      </Column>

      <Column lg={4} md={4} sm={4}>
        <SummaryCard title="Asset Types" value={uniqueTypes} Icon={ChartClusterBar} subtext="Categories (Nodes, Disks, etc.)" />
      </Column>

      {/* 3. The "Insight" Card (Red Highlighting) */}
      <Column lg={4} md={4} sm={4}>
        <Tile style={{ 
          height: '100%', 
          minHeight: '160px', 
          backgroundColor: '#fff0f0', // Red Tint
          borderTop: '4px solid #da1e28', // Carbon Red
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'space-between'
        }}>
          {/* UPDATED HEADER SECTION */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <h6 style={{ color: '#da1e28', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                 Top Spending Asset
              </h6>
              {/* THE NEW "REVIEW REQUIRED" LABEL */}
              <span style={{ 
                  fontSize: '0.625rem', 
                  backgroundColor: '#da1e28', 
                  color: 'white', 
                  padding: '2px 6px', 
                  borderRadius: '2px', 
                  marginTop: '4px',
                  alignSelf: 'flex-start',
                  fontWeight: 'bold',
                  letterSpacing: '0.5px'
              }}>
                REVIEW REQUIRED
              </span>
            </div>
            <WarningFilled size={24} style={{ fill: '#da1e28' }} />
          </div>

          <div>
            <h4 style={{ 
               fontSize: '1.25rem', 
               fontWeight: '600', 
               marginBottom: '0.25rem', 
               whiteSpace: 'nowrap', 
               overflow: 'hidden', 
               textOverflow: 'ellipsis' 
            }} title={topSpender.name || topSpender.properties?.name}>
              {topSpender.name || topSpender.properties?.name || "N/A"}
            </h4>
            <p style={{ fontSize: '1.5rem', fontWeight: '300', color: '#161616' }}>
               {fmtMoney(topSpender.totalCost || topSpender.cost || 0)}
            </p>
          </div>
        </Tile>
      </Column>

    </Grid>
  );
};

export default AssetSummary;