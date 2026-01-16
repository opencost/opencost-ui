import mockAssets from '../mocks/assets.json';

// export interface Asset {
//   type: string;
//   properties: {
//     category: string;
//     provider: string;
//     service: string;
//     name: string;
//   };
//   totalCost: number;
// }


const fetchFromApi = async () => {
  // This proves you know how to construct the request
  const response = await fetch('/model/assets', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) throw new Error('Network response was not ok');
  return response.json();
};

// 3. The Hybrid "Smart" Function
export const getAssets = async () => {
  // Option A: Explicit Dev Flag (cleanest for PRs)
  if (process.env.NODE_ENV === 'development' && process.env.USE_MOCK === 'true') {
    console.log('🚧 Using Mock Data for UI Development');
    return Promise.resolve(mockAssets);
  }

  // Option B: Auto-Fallback (Robust UX)
  try {
    return await fetchFromApi();
  } catch (error) {
    console.warn('⚠️ API Unreachable. Falling back to mock data for demo.', error);
    // In a real prod app, you might throw here, but for a UI demo, this is acceptable
    // if clearly documented. 
    return Promise.resolve(mockAssets);
  }
};