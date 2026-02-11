import { mockAssets } from './assets.mock';
import client from './api_client'; // Use your custom axios client

const AssetsService = {
  fetchAssets: async (window = '7d') => {
    // FORCE MOCK DATA
    if (process.env.NODE_ENV === 'development' || process.env.REACT_APP_USE_MOCK_DATA === 'true') {
      return Promise.resolve(mockAssets);
    }

    try {
      // Using the axios client you created
      const response = await client.get('/assets', { params: { window } });
      
      // OpenCost APIs usually return { data: [...] } or { data: { sets: [...] }}
      const resData = response.data?.data || response.data;
      return Array.isArray(resData) ? resData : (resData.records || []);
    } catch (error) {
      console.error("API Error, falling back to mock:", error);
      return mockAssets; 
    }
  },

  downloadCSV: (data) => {
    if (!data || data.length === 0) return;
    const headers = ["Name", "Type", "Cluster", "Total Cost"];
    const rows = data.map(a => `${a.name},${a.type},${a.cluster},${a.totalCost}`);
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'assets.csv';
    a.click();
    window.URL.revokeObjectURL(url); // Clean up memory
  }
};

export default AssetsService;