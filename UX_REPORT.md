# LFX Mentorship Coding Challenge - OpenCost UI Assets Page

## Project Overview
This project implements the core "Assets" page for OpenCost UI using the Carbon Design System. It allows users to visualize and filter infrastructure asset costs.

## UX Decision Rationale

### 1. Carbon Design System Integration
I chose to fully embrace the Carbon Design System (Theme `g100`) to provide a consistent, premium, and dark-mode-native experience. 
- **Grid Layout**: Used Carbon's responsive Grid system to ensure the layout adapts from desktop to mobile.
- **Data Visualization**: Integrated proper Carbon Charts (`DonutChart`) to provide immediate "Hotspot" visibility, rather than just a raw table.
- **Controls**: Used standard Carbon `Select`, `Search`, and `Checkbox` components for familiarity.

### 2. "Outside the Box" Features
- **Cost Hotspots Visualization**: Added a "Top 5 Cost Breakdown" Donut Chart at the top of the page. This answers the user's primary question ("Where is my money going?") at a glance without needing to sort the table.
- **Idle Cost Toggle**: Added an explicit toggle to "Include Idle Costs". This is often a hidden cost driver, and making it a first-class control invites users to explore efficiency.
- **Client-Side Search**: Implemented a real-time filter to quickly find assets by name, type, or cluster, enhancing the "Find inefficiencies" workflow.

### 3. Data Presentation
- **Aggregated View**: The table defaults to aggregated views but defaults to "Type" to give a high-level overview.
- **Fallback Handling**: Implemented robust fallback logic. If the API key (e.g., Namespace name) is missing in the properties, the system captures the aggregation key ensure no "Unnamed" rows appear.

## Challenges Encountered

### 1. API Structure Complexity
The Assets API returns nested objects where keys are dynamic (e.g., namespace names) rather than fixed fields. 
*Solution*: I implemented a transformation layer in the frontend (`Object.entries`) to capture these dynamic keys and map them to a displayable `name` property before rendering.

### 2. Carbon Charts Integration
 integrating `@carbon/charts-react` into an existing React setup required ensuring `d3` and styles were properly loaded.
*Solution*: Added global chart styles in `App.js` and ensured compatible dependencies were installed.

### 3. Mock vs Real Data Consistency
Developing without a live backend required careful mocking.
*Solution*: I created a `mockAssetsData` structure that mirrors the real API, and adjusted the Service layer to unwrap Axios responses so the UI logic works identically for both Mock and Real data.

## API Integration Strategy

### Understanding the Assets API
The OpenCost Assets API (`/model/assets`) retrieves backing cost data broken down by individual assets in the cluster. According to OpenCost documentation: *"The Assets API is not yet exposed in the UI"* - which is exactly what this implementation provides.

**Key Parameters:**
- `window` (required): Duration of time to query (e.g., `7d`, `today`, `lastweek`, `30m`)
- `aggregate`: Group assets by type, name, etc.
- `accumulate`: Return cumulative totals vs time-series data
- `filter`: Filter results by specific criteria

### Connection Architecture
```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   UI (React)    │────▶│  api_client.js  │────▶│  OpenCost API   │
│  localhost:1234 │     │  (Axios)        │     │  localhost:9090 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                │
                                ▼ (fallback)
                        ┌─────────────────┐
                        │  Mock Data      │
                        │  assets.mock.js │
                        └─────────────────┘
```

### Development vs Production
- **Development Mode**: Uses mock data that mirrors the real API response structure, enabling full UI development without requiring a Kubernetes cluster
- **Production Mode**: Connects to the real OpenCost backend at `localhost:9090` (or configured `BASE_URL`)
- **Graceful Fallback**: If the API is unavailable, the UI automatically falls back to mock data with a user-visible error notification

### To Connect to Real Data
```bash
# Option 1: Port-forward from existing cluster
kubectl port-forward --namespace opencost service/opencost 9090

# Option 2: Local development with Tilt (requires kind cluster)
tilt up
```

## New Skills Learned
- **Carbon Design System**: Deepened understanding of Carbon's Grid, Tile, and DataTable component architecture.
- **OpenCost API**: Learned how OpenCost structures its Assets API (time-series buckets vs cumulative totals).
- **Frontend Architecture**: Patterns for abstracting API layers to support seamless switching between Mock and Real data.

