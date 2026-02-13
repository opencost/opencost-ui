import { mockAssets } from './assets.mock';
import client from './api_client';

const AssetsService = {
  fetchAssets: async (window = '7d') => {
    const isDeployPreview =
      typeof process !== "undefined" &&
      process.env.CONTEXT === "deploy-preview";

    const isLocalDevelopment =
      typeof process !== "undefined" &&
      process.env.NODE_ENV === "development";

    // Use mock for:
    // - Local development
    // - Netlify PR Deploy Preview
    if (isLocalDevelopment || isDeployPreview) {
      return Promise.resolve(mockAssets);
    }

    try {
      const response = await client.get('/assets', { params: { window } });

      /**
       *  OpenCost Transformation
       * Handles both:
       * - Array response
       * - Object map response (OpenCost style)
       */
      const rawData = response.data?.data || response.data;

      let normalizedData = [];

      if (Array.isArray(rawData)) {
        normalizedData = rawData;
      } else if (typeof rawData === 'object' && rawData !== null) {
        normalizedData = Object.values(rawData);
      }

      //  Safety fallback if API returns empty
      if (!normalizedData || normalizedData.length === 0) {
        console.warn("API returned empty dataset. Falling back to mock.");
        return mockAssets;
      }

      return normalizedData;

    } catch (error) {
      console.error("API Error, falling back to mock:", error);
      return mockAssets;
    }
  },

  /**
   * Prevents CSV injection & handles commas safely
   */
  downloadCSV: (data) => {
    if (!data || data.length === 0) return;

    const headers = ["Name", "Category", "Type", "Cluster", "Total Cost"];

    const rows = data.map(a => [
      `"${(a.name || '').replace(/"/g, '""')}"`,
      `"${(a.category || '').replace(/"/g, '""')}"`,
      `"${(a.type || '').replace(/"/g, '""')}"`,
      `"${(a.cluster || '').replace(/"/g, '""')}"`,
      a.totalCost || 0
    ].join(","));

    const csvContent = [headers.join(","), ...rows].join("\n");

    const blob = new Blob([csvContent], {
      type: 'text/csv;charset=utf-8;'
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `infrastructure_assets_${new Date().toISOString().split('T')[0]}.csv`
    );

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }
};

export default AssetsService;
