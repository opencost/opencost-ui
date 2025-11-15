import { parseFilters } from "../util";
import client from "./api_client";

// Flag to enable mock data - must be explicitly set via REACT_APP_USE_MOCK_DATA environment variable
const USE_MOCK_DATA = process.env.REACT_APP_USE_MOCK_DATA === "true";

// Mock data for testing drilldown functionality when backend is not available
// Only used when REACT_APP_USE_MOCK_DATA=true is explicitly set
const getMockData = (aggregate, filters) => {
  const mockNamespaces = [
    { name: "default", totalCost: 150.50, cpuCost: 50.0, ramCost: 60.0, pvCost: 40.5, gpuCost: 0, totalEfficiency: 0.85 },
    { name: "kube-system", totalCost: 200.75, cpuCost: 80.0, ramCost: 90.0, pvCost: 30.75, gpuCost: 0, totalEfficiency: 0.90 },
    { name: "production", totalCost: 500.25, cpuCost: 200.0, ramCost: 250.0, pvCost: 50.25, gpuCost: 0, totalEfficiency: 0.75 },
  ];

  const mockControllerKinds = [
    { name: "deployment", totalCost: 100.0, cpuCost: 40.0, ramCost: 50.0, pvCost: 10.0, gpuCost: 0, totalEfficiency: 0.80 },
    { name: "statefulset", totalCost: 50.5, cpuCost: 20.0, ramCost: 25.0, pvCost: 5.5, gpuCost: 0, totalEfficiency: 0.85 },
  ];

  const mockControllers = [
    { name: "nginx-deployment", totalCost: 75.0, cpuCost: 30.0, ramCost: 35.0, pvCost: 10.0, gpuCost: 0, totalEfficiency: 0.82 },
    { name: "api-server", totalCost: 25.0, cpuCost: 10.0, ramCost: 12.0, pvCost: 3.0, gpuCost: 0, totalEfficiency: 0.88 },
  ];

  const mockPods = [
    { name: "nginx-pod-1", totalCost: 25.0, cpuCost: 10.0, ramCost: 12.0, pvCost: 3.0, gpuCost: 0, totalEfficiency: 0.85 },
    { name: "nginx-pod-2", totalCost: 25.0, cpuCost: 10.0, ramCost: 12.0, pvCost: 3.0, gpuCost: 0, totalEfficiency: 0.85 },
    { name: "nginx-pod-3", totalCost: 25.0, cpuCost: 10.0, ramCost: 11.0, pvCost: 4.0, gpuCost: 0, totalEfficiency: 0.80 },
  ];

  const mockContainers = [
    { name: "nginx-container", totalCost: 25.0, cpuCost: 10.0, ramCost: 12.0, pvCost: 3.0, gpuCost: 0, totalEfficiency: 0.85 },
  ];

  // Return appropriate mock data based on aggregation level
  if (aggregate === "namespace") {
    return { data: [mockNamespaces] };
  } else if (aggregate === "controllerKind") {
    return { data: [mockControllerKinds] };
  } else if (aggregate === "controller") {
    return { data: [mockControllers] };
  } else if (aggregate === "pod") {
    return { data: [mockPods] };
  } else if (aggregate === "container") {
    return { data: [mockContainers] };
  }
  return { data: [mockNamespaces] };
};

class AllocationService {
  async fetchAllocation(win, aggregate, options) {
    const { accumulate, filters } = options;
    const params = {
      window: win,
      aggregate: aggregate,
      includeIdle: true,
      step: "1d",
    };
    if (typeof accumulate === "boolean") {
      params.accumulate = accumulate;
    }
    if (filters && filters.length > 0) {
      params.filter = parseFilters(filters);
    }
    
    try {
      const result = await client.get("/allocation/compute", {
        params,
      });
      return result.data;
    } catch (error) {
      // Only use mock data if explicitly enabled via REACT_APP_USE_MOCK_DATA=true
      // This prevents confusion for users who misconfigured their backend
      if (USE_MOCK_DATA && error.message && (error.message.includes("Network Error") || error.message.includes("ECONNREFUSED"))) {
        console.warn("Backend not available, using mock data (REACT_APP_USE_MOCK_DATA is enabled)");
        return getMockData(aggregate, filters);
      }
      throw error;
    }
  }
}

export default new AllocationService();
