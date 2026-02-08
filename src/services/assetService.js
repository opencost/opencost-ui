import mockData from '../data/assets.json';

// Real OpenCost endpoint to target 
const API_ENDPOINT = '/model/assets?window=1d';

export const fetchAssets = async () => {
    try {
        // Attempt to fetch from real API
        const response = await fetch(API_ENDPOINT);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const json = await response.json();
        return { data: json.data || [], isDemoMode: false };
    } catch (error) {
        console.warn("Backend unreachable, switching to Demo Mode:", error);
        // Fallback to mock data
        return new Promise((resolve) => {
            setTimeout(() => resolve({ data: mockData.data, isDemoMode: true }), 800); 
        });
    }
};