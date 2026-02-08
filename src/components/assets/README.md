# Assets Components

This directory contains all components related to the Assets page implementation.

## Components

### AssetsControls.js
Control panel for selecting time window and aggregation method.

**Props:**
- `window` (string): Current time window selection
- `setWindow` (function): Callback to update window
- `aggregateBy` (string): Current aggregation method
- `setAggregateBy` (function): Callback to update aggregation

**Usage:**
```jsx
<AssetsControls
  window={window}
  setWindow={setWindow}
  aggregateBy={aggregateBy}
  setAggregateBy={setAggregateBy}
/>
```

### AssetsChart.js
Bar chart visualization of asset costs using Recharts.

**Props:**
- `assetsData` (array): Array of asset data from API
- `currency` (string): Currency code for formatting (default: "USD")

**Features:**
- Shows top 10 assets by cost
- Responsive design
- Tooltip with formatted currency values
- Automatic data aggregation by asset type

**Usage:**
```jsx
<AssetsChart 
  assetsData={assetsData} 
  currency="USD" 
/>
```

### AssetsTable.js
Data table with pagination using Carbon Design System.

**Props:**
- `assetsData` (array): Array of asset data from API
- `currency` (string): Currency code for formatting (default: "USD")
- `aggregateBy` (string): Current aggregation method

**Features:**
- Sortable columns
- Pagination (10, 25, 50, 100 rows per page)
- Currency formatting
- Responsive design
- Empty state handling

**Usage:**
```jsx
<AssetsTable
  assetsData={assetsData}
  currency="USD"
  aggregateBy="type"
/>
```

### tokens.js
Configuration constants for the Assets page.

**Exports:**
- `windowOptions`: Array of time window options
- `aggregationOptions`: Array of aggregation method options
- `assetTypeMap`: Mapping of asset types to categories

## Data Flow

```
Assets Page (Assets.js)
    ↓
AssetsService.fetchAssets()
    ↓
OpenCost API (/assets)
    ↓
Assets Page State (assetsData)
    ↓
├── AssetsChart (visualization)
└── AssetsTable (detailed view)
```

## Styling

Components use a combination of:
- Carbon Design System components and styles
- Material-UI Paper for containers
- Inline styles for layout
- Recharts default styling for charts

## Carbon Design System Components Used

- `Dropdown`: Aggregation selection
- `DataTable`: Asset listing
- `Table`, `TableHead`, `TableRow`, `TableHeader`, `TableBody`, `TableCell`: Table structure
- `Pagination`: Table navigation
- `Loading`: Loading states

## Example Asset Data Structure

```javascript
{
  "Node": {
    "type": "Node",
    "properties": {
      "category": "Compute",
      "provider": "GCP",
      "service": "Kubernetes",
      "cluster": "cluster-one"
    },
    "window": {
      "start": "2023-07-18T00:00:00Z",
      "end": "2023-07-25T00:00:00Z"
    },
    "start": "2023-07-18T00:00:00Z",
    "end": "2023-07-24T17:10:00Z",
    "minutes": 9670.0,
    "totalCost": 29.86,
    "cpuCost": 20.12,
    "ramCost": 9.74
  }
}
```

## Testing

To test these components:

1. **Unit Testing** (future):
   ```bash
   npm test -- AssetsControls.test.js
   ```

2. **Integration Testing**:
   - Start dev server: `npm run serve`
   - Navigate to `/assets`
   - Verify controls update URL parameters
   - Check chart renders with data
   - Test table pagination

3. **Manual Testing**:
   - Test different time windows
   - Test different aggregation methods
   - Verify currency formatting
   - Check responsive behavior
   - Test error states

## Future Enhancements

- [ ] Add filtering capabilities
- [ ] Implement drilldown functionality
- [ ] Add export to CSV
- [ ] Support custom date ranges
- [ ] Add cost comparison views
- [ ] Integrate carbon cost data
- [ ] Add unit tests
- [ ] Add loading skeletons
- [ ] Implement virtualization for large datasets
- [ ] Add keyboard shortcuts
