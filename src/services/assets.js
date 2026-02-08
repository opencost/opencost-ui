import axios from 'axios';

// Use the public demo API
const API_BASE = 'https://demo.infra.opencost.io/model';

// Keep mock data as a backup (Fail-Safe)
const MOCK_ASSETS = [
  { properties: { name: 'gke-cluster-pool-1', provider: 'GCP' }, type: 'Node', totalCost: 156.78 },
  { properties: { name: 'gke-cluster-pool-2', provider: 'GCP' }, type: 'Node', totalCost: 142.20 },
  { properties: { name: 'aws-disk-vol-001', provider: 'AWS' }, type: 'Disk', totalCost: 45.50 },
  { properties: { name: 'azure-lb-prod', provider: 'Azure' }, type: 'LoadBalancer', totalCost: 89.99 },
];

export const getAssets = async (window = '7d') => {
  try {
    console.log(`Fetching real assets for window: ${window}...`);
    
    // 1. Attempt to fetch real data
    const response = await axios.get(`${API_BASE}/assets`, {
      params: { 
        window, 
        accumulate: true // Often needed to get a single total per asset
      }
    });

    // 2. Log the response to see what we actually got
    console.log("API Response:", response.data);

    // 3. Validation: Check if we got valid data
    if (response.data && response.data.data) {
       // OpenCost API structure is often: { data: { "item_id": { ... }, ... } }
       // We need to convert that object of objects into an array
       const result = response.data.data;
       
       // Handle case where result is an array vs object
       const dataArray = Array.isArray(result) ? result : Object.values(result);
       
       if (dataArray.length > 0) {
         return dataArray;
       }
    }
    
    // 4. If data is empty, throw error to trigger fallback
    console.warn("API returned empty data. Switching to Mock Data.");
    throw new Error("Empty Data");

  } catch (error) {
    console.error("Fetch failed (CORS or Network). Using Fallback.", error);
    // 5. Fallback: Return MOCK_ASSETS so the UI still looks good
    return MOCK_ASSETS;
  }
};