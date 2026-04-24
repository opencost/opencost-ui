export type AllocationAggregate =
  | "namespace"
  | "controllerKind"
  | "controller"
  | "pod"
  | "container";

export interface AllocationMockItem {
  name: string;
  totalCost: number;
  cpuCost: number;
  ramCost: number;
  pvCost: number;
  gpuCost: number;
  totalEfficiency: number;
}

export interface AllocationMockResponse {
  data: AllocationMockItem[][];
}

export function getMockData(
  aggregate: string,
  _filters?: { property: string; value: string }[],
): AllocationMockResponse {
  const mockNamespaces: AllocationMockItem[] = [
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

  const mockControllerKinds: AllocationMockItem[] = [
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

  const mockControllers: AllocationMockItem[] = [
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

  const mockPods: AllocationMockItem[] = [
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

  const mockContainers: AllocationMockItem[] = [
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

  const aggregateKey = aggregate.split(",")[0]?.trim() || "namespace";

  switch (aggregateKey) {
    case "namespace":
      return { data: [mockNamespaces] };
    case "controllerKind":
      return { data: [mockControllerKinds] };
    case "controller":
      return { data: [mockControllers] };
    case "pod":
      return { data: [mockPods] };
    case "container":
      return { data: [mockContainers] };
    default:
      return { data: [mockNamespaces] };
  }
}
