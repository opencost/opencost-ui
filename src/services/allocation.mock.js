// Mock data for testing drilldown functionality when backend is not available
// Only used when REACT_APP_USE_MOCK_DATA=true is explicitly set

export const getMockData = (aggregate, filters) => {
  const mockNamespaces = [
    {
      name: "default",
      totalCost: 150.5,
      cpuCost: 50.0,
      ramCost: 60.0,
      pvCost: 40.5,
      gpuCost: 0,
      totalEfficiency: 0.85,
    },
    {
      name: "kube-system",
      totalCost: 200.75,
      cpuCost: 80.0,
      ramCost: 90.0,
      pvCost: 30.75,
      gpuCost: 0,
      totalEfficiency: 0.9,
    },
    {
      name: "production",
      totalCost: 500.25,
      cpuCost: 200.0,
      ramCost: 250.0,
      pvCost: 50.25,
      gpuCost: 0,
      totalEfficiency: 0.75,
    },
  ];

  const mockControllerKinds = [
    {
      name: "deployment",
      totalCost: 100.0,
      cpuCost: 40.0,
      ramCost: 50.0,
      pvCost: 10.0,
      gpuCost: 0,
      totalEfficiency: 0.8,
    },
    {
      name: "statefulset",
      totalCost: 50.5,
      cpuCost: 20.0,
      ramCost: 25.0,
      pvCost: 5.5,
      gpuCost: 0,
      totalEfficiency: 0.85,
    },
  ];

  const mockControllers = [
    {
      name: "nginx-deployment",
      totalCost: 75.0,
      cpuCost: 30.0,
      ramCost: 35.0,
      pvCost: 10.0,
      gpuCost: 0,
      totalEfficiency: 0.82,
    },
    {
      name: "api-server",
      totalCost: 25.0,
      cpuCost: 10.0,
      ramCost: 12.0,
      pvCost: 3.0,
      gpuCost: 0,
      totalEfficiency: 0.88,
    },
  ];

  const mockPods = [
    {
      name: "nginx-pod-1",
      totalCost: 25.0,
      cpuCost: 10.0,
      ramCost: 12.0,
      pvCost: 3.0,
      gpuCost: 0,
      totalEfficiency: 0.85,
    },
    {
      name: "nginx-pod-2",
      totalCost: 25.0,
      cpuCost: 10.0,
      ramCost: 12.0,
      pvCost: 3.0,
      gpuCost: 0,
      totalEfficiency: 0.85,
    },
    {
      name: "nginx-pod-3",
      totalCost: 25.0,
      cpuCost: 10.0,
      ramCost: 11.0,
      pvCost: 4.0,
      gpuCost: 0,
      totalEfficiency: 0.8,
    },
  ];

  const mockContainers = [
    {
      name: "nginx-container",
      totalCost: 25.0,
      cpuCost: 10.0,
      ramCost: 12.0,
      pvCost: 3.0,
      gpuCost: 0,
      totalEfficiency: 0.85,
    },
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
