'use client';

import { Tile } from '@carbon/react';
import { ArrowDown, ArrowUp, Currency, ChartLine, ChartLineSmooth } from '@carbon/icons-react';

export default function CostSummaryCards() {
  return (
    <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(4, 1fr)' }}>
      <div className="metric-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <div className="metric-label">Total Cost</div>
          <Currency size={16} style={{ color: '#525252' }} />
        </div>
        <div className="metric-value">$3,566.34</div>
        <p className="metric-change" style={{ color: '#198038', display: 'flex', alignItems: 'center' }}>
          <ArrowDown size={16} style={{ marginRight: '0.25rem' }} />
          12% from last period
        </p>
      </div>

      <div className="metric-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <div className="metric-label">Cloud Costs</div>
          <ChartLine size={16} style={{ color: '#525252' }} />
        </div>
        <div className="metric-value">$3,552.48</div>
        <p className="metric-change" style={{ color: '#198038', display: 'flex', alignItems: 'center' }}>
          <ArrowDown size={16} style={{ marginRight: '0.25rem' }} />
          8% from last period
        </p>
      </div>

      <div className="metric-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <div className="metric-label">External Costs</div>
          <ChartLineSmooth size={16} style={{ color: '#525252' }} />
        </div>
        <div className="metric-value">$13.86</div>
        <p className="metric-change" style={{ color: '#da1e28', display: 'flex', alignItems: 'center' }}>
          <ArrowUp size={16} style={{ marginRight: '0.25rem' }} />
          15% from last period
        </p>
      </div>

      <div className="metric-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <div className="metric-label">Efficiency Score</div>
          <ChartLineSmooth size={16} style={{ color: '#525252' }} />
        </div>
        <div className="metric-value">24.2%</div>
        <p className="metric-change" style={{ color: '#198038', display: 'flex', alignItems: 'center' }}>
          <ArrowUp size={16} style={{ marginRight: '0.25rem' }} />
          3.2% improvement
        </p>
      </div>
    </div>
  );
}
