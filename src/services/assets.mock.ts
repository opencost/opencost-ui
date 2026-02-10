// Mock data for Assets API testing when backend is not available
// Only used when REACT_APP_USE_MOCK_DATA=true is explicitly set

export interface AssetProperties {
    category: string;
    provider: string;
    account: string;
    project: string;
    service: string;
    cluster: string;
    name: string;
    providerID: string;
    [key: string]: unknown;
}

export interface NodeAsset {
    type: "Node";
    properties: AssetProperties;
    labels: Record<string, string>;
    start: string;
    end: string;
    window: { start: string; end: string };
    adjustment: number;
    nodeType: string;
    cpuCoreHours: number;
    ramByteHours: number;
    gpuHours: number;
    cpuBreakdown: Record<string, number>;
    ramBreakdown: Record<string, number>;
    cpuCost: number;
    gpuCost: number;
    gpuCount: number;
    ramCost: number;
    discount: number;
    preemptible: number;
    overhead: Record<string, number>;
}

export interface DiskAsset {
    type: "Disk";
    properties: AssetProperties;
    labels: Record<string, string>;
    start: string;
    end: string;
    window: { start: string; end: string };
    adjustment: number;
    cost: number;
    byteHours: number;
    byteHoursUsed: number;
    local: number;
    storageClass: string;
    volumeName: string;
    claimName: string;
    claimNamespace: string;
    breakdown: Record<string, number>;
}

export interface LoadBalancerAsset {
    type: "LoadBalancer";
    properties: AssetProperties;
    labels: Record<string, string>;
    start: string;
    end: string;
    window: { start: string; end: string };
    adjustment: number;
    cost: number;
    private: boolean;
    ip: string;
}

export interface ClusterManagementAsset {
    type: "ClusterManagement";
    properties: AssetProperties;
    labels: Record<string, string>;
    start: string;
    end: string;
    window: { start: string; end: string };
    adjustment: number;
    cost: number;
}

export type Asset = NodeAsset | DiskAsset | LoadBalancerAsset | ClusterManagementAsset;

export interface MockAssetResponse {
    code: number;
    data: {
        Assets: Record<string, Asset>;
        Window: { start: string; end: string };
    };
}

export interface CarbonAsset {
    type: string;
    properties: Partial<AssetProperties>;
    carbonKg: number;
    energyKwh: number;
}

export interface MockCarbonResponse {
    code: number;
    data: {
        Assets: Record<string, CarbonAsset>;
        Window: { start: string; end: string };
    };
}

interface FetchOptions {
    filter?: string;
}

/**
 * Mock asset data for visualization testing
 * @param _window - Time window (not used, but matches API signature)
 * @param _options - Filter options
 * @returns Mock response matching /assets endpoint structure
 */
export const getMockAssetData = (window: string, _options: FetchOptions = {}): MockAssetResponse => {
    const now = new Date();

    // Parse window to get duration in days
    let days = 7;
    if (window === 'today' || window === '24h') days = 1;
    else if (window === 'yesterday') days = 1;
    else if (window === '48h') days = 2;
    else if (window === 'week' || window === 'lastweek' || window === '7d') days = 7;
    else if (window === '14d') days = 14;
    else if (window === '30d') days = 30;

    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    const multiplier = days / 7; // Base costs are for 7 days

    // Mock Node assets (compute)
    const mockNodes: NodeAsset[] = [
        {
            type: "Node",
            properties: {
                category: "Compute",
                provider: "Oracle",
                account: "oracle-tenancy-prod",
                project: "production",
                service: "Kubernetes",
                cluster: "prod-cluster-phoenix",
                name: "10.0.138.229",
                providerID: "ocid1.instance.oc1.phx.abc123",
            },
            labels: {
                "node.kubernetes.io/instance-type": "VM.Standard.E4.Flex",
                "topology.kubernetes.io/zone": "PHX-AD-1",
            },
            start: startDate.toISOString(),
            end: now.toISOString(),
            window: { start: startDate.toISOString(), end: now.toISOString() },
            adjustment: 0,
            nodeType: "VM.Standard.E4.Flex",
            cpuCoreHours: 672.0 * multiplier,
            ramByteHours: 120259084288.0 * multiplier,
            gpuHours: 0,
            cpuBreakdown: { idle: 0.35, system: 0.10, user: 0.55, other: 0 },
            ramBreakdown: { idle: 0.42, system: 0.08, user: 0.50, other: 0 },
            cpuCost: 21.95,
            gpuCost: 0,
            gpuCount: 0,
            ramCost: 9.13,
            discount: 0,
            preemptible: 0,
            overhead: { cpuOverheadFraction: 0.05, ramOverheadFraction: 0.08, overheadCostFraction: 0.06 },
        },
        {
            type: "Node",
            properties: {
                category: "Compute",
                provider: "Oracle",
                account: "oracle-tenancy-prod",
                project: "production",
                service: "Kubernetes",
                cluster: "prod-cluster-phoenix",
                name: "10.0.149.111",
                providerID: "ocid1.instance.oc1.phx.def456",
            },
            labels: {
                "node.kubernetes.io/instance-type": "VM.Standard.E4.Flex",
                "topology.kubernetes.io/zone": "PHX-AD-2",
            },
            start: startDate.toISOString(),
            end: now.toISOString(),
            window: { start: startDate.toISOString(), end: now.toISOString() },
            adjustment: 0,
            nodeType: "VM.Standard.E4.Flex",
            cpuCoreHours: 1344.0 * multiplier,
            ramByteHours: 240518168576.0 * multiplier,
            gpuHours: 0,
            cpuBreakdown: { idle: 0.25, system: 0.12, user: 0.63, other: 0 },
            ramBreakdown: { idle: 0.30, system: 0.10, user: 0.60, other: 0 },
            cpuCost: 1.85 * multiplier,
            gpuCost: 0,
            gpuCount: 0,
            ramCost: 6.56 * multiplier,
            discount: 0,
            preemptible: 0,
            overhead: { cpuOverheadFraction: 0.04, ramOverheadFraction: 0.06, overheadCostFraction: 0.05 },
        },
        {
            type: "Node",
            properties: {
                category: "Compute",
                provider: "AWS",
                account: "123456789012",
                project: "staging",
                service: "Kubernetes",
                cluster: "staging-cluster-us-east",
                name: "ip-10-1-1-50.ec2.internal",
                providerID: "i-0staging123456789",
            },
            labels: {
                "node.kubernetes.io/instance-type": "t3.large",
                "topology.kubernetes.io/zone": "us-east-1a",
            },
            start: startDate.toISOString(),
            end: now.toISOString(),
            window: { start: startDate.toISOString(), end: now.toISOString() },
            adjustment: 0,
            nodeType: "t3.large",
            cpuCoreHours: 336.0 * multiplier,
            ramByteHours: 60129542144.0 * multiplier,
            gpuHours: 0,
            cpuBreakdown: { idle: 0.55, system: 0.08, user: 0.37, other: 0 },
            ramBreakdown: { idle: 0.60, system: 0.05, user: 0.35, other: 0 },
            cpuCost: 18.50 * multiplier,
            gpuCost: 0,
            gpuCount: 0,
            ramCost: 12.30 * multiplier,
            discount: 0.15,
            preemptible: 0,
            overhead: { cpuOverheadFraction: 0.03, ramOverheadFraction: 0.05, overheadCostFraction: 0.04 },
        },
        {
            type: "Node",
            properties: {
                category: "Compute",
                provider: "GCP",
                account: "my-gcp-project",
                project: "production",
                service: "Kubernetes",
                cluster: "gke-prod-cluster",
                name: "gke-prod-default-pool-abc123",
                providerID: "gce://my-gcp-project/us-central1-a/gke-prod-default-pool-abc123",
            },
            labels: {
                "cloud.google.com/gke-nodepool": "default-pool",
                "topology.kubernetes.io/zone": "us-central1-a",
            },
            start: startDate.toISOString(),
            end: now.toISOString(),
            window: { start: startDate.toISOString(), end: now.toISOString() },
            adjustment: 2.50,
            nodeType: "n1-standard-4",
            cpuCoreHours: 672.0 * multiplier,
            ramByteHours: 107374182400.0 * multiplier,
            gpuHours: 0,
            cpuBreakdown: { idle: 0.20, system: 0.15, user: 0.65, other: 0 },
            ramBreakdown: { idle: 0.25, system: 0.12, user: 0.63, other: 0 },
            cpuCost: 52.80 * multiplier,
            gpuCost: 0,
            gpuCount: 0,
            ramCost: 35.40 * multiplier,
            discount: 0.20,
            preemptible: 0,
            overhead: { cpuOverheadFraction: 0.06, ramOverheadFraction: 0.07, overheadCostFraction: 0.065 },
        },
    ];

    // Mock Disk assets (storage)
    const mockDisks: DiskAsset[] = [
        {
            type: "Disk",
            properties: {
                category: "Storage",
                provider: "Oracle",
                account: "oracle-tenancy-prod",
                project: "production",
                service: "Kubernetes",
                cluster: "prod-cluster-phoenix",
                name: "pvc-postgres-data-0",
                providerID: "ocid1.volume.oc1.phx.abc123",
            },
            labels: {
                "kubernetes.io/created-for/pvc/name": "postgres-data-0",
                "kubernetes.io/created-for/pvc/namespace": "database",
            },
            start: startDate.toISOString(),
            end: now.toISOString(),
            window: { start: startDate.toISOString(), end: now.toISOString() },
            adjustment: 0,
            cost: 24.50 * multiplier,
            byteHours: 1717986918400.0 * multiplier,
            byteHoursUsed: 858993459200.0 * multiplier,
            local: 0,
            storageClass: "oci-bv",
            volumeName: "pvc-0abc123def456789a",
            claimName: "postgres-data-0",
            claimNamespace: "database",
            breakdown: { idle: 0.50, user: 0.50, system: 0, other: 0 },
        },
        {
            type: "Disk",
            properties: {
                category: "Storage",
                provider: "AWS",
                account: "123456789012",
                project: "production",
                service: "Kubernetes",
                cluster: "staging-cluster-us-east",
                name: "pvc-redis-data-0",
                providerID: "vol-0def456ghi789012b",
            },
            labels: {
                "kubernetes.io/created-for/pvc/name": "redis-data-0",
                "kubernetes.io/created-for/pvc/namespace": "cache",
            },
            start: startDate.toISOString(),
            end: now.toISOString(),
            window: { start: startDate.toISOString(), end: now.toISOString() },
            adjustment: 0,
            cost: 8.75 * multiplier,
            byteHours: 429496729600.0 * multiplier,
            byteHoursUsed: 214748364800.0 * multiplier,
            local: 0,
            storageClass: "gp3",
            volumeName: "pvc-0def456ghi789012b",
            claimName: "redis-data-0",
            claimNamespace: "cache",
            breakdown: { idle: 0.45, user: 0.55, system: 0, other: 0 },
        },
        {
            type: "Disk",
            properties: {
                category: "Storage",
                provider: "GCP",
                account: "my-gcp-project",
                project: "production",
                service: "Kubernetes",
                cluster: "gke-prod-cluster",
                name: "pvc-elasticsearch-data-0",
                providerID: "projects/my-gcp-project/zones/us-central1-a/disks/pvc-ela123",
            },
            labels: {
                "kubernetes.io/created-for/pvc/name": "elasticsearch-data-0",
                "kubernetes.io/created-for/pvc/namespace": "logging",
            },
            start: startDate.toISOString(),
            end: now.toISOString(),
            window: { start: startDate.toISOString(), end: now.toISOString() },
            adjustment: 0,
            cost: 45.00 * multiplier,
            byteHours: 4294967296000.0 * multiplier,
            byteHoursUsed: 3221225472000.0 * multiplier,
            local: 0,
            storageClass: "pd-ssd",
            volumeName: "pvc-0ela123sti456789c",
            claimName: "elasticsearch-data-0",
            claimNamespace: "logging",
            breakdown: { idle: 0.25, user: 0.75, system: 0, other: 0 },
        },
    ];

    // Mock LoadBalancer assets
    const mockLoadBalancers: LoadBalancerAsset[] = [
        {
            type: "LoadBalancer",
            properties: {
                category: "Network",
                provider: "Oracle",
                account: "oracle-tenancy-prod",
                project: "production",
                service: "Kubernetes",
                cluster: "prod-cluster-phoenix",
                name: "lb-ingress-nginx",
                providerID: "ocid1.loadbalancer.oc1.phx.abc123",
            },
            labels: {
                "kubernetes.io/service-name": "ingress-nginx/ingress-nginx-controller",
            },
            start: startDate.toISOString(),
            end: now.toISOString(),
            window: { start: startDate.toISOString(), end: now.toISOString() },
            adjustment: 0,
            cost: 18.00 * multiplier,
            private: false,
            ip: "129.159.45.50",
        },
        {
            type: "LoadBalancer",
            properties: {
                category: "Network",
                provider: "AWS",
                account: "123456789012",
                project: "production",
                service: "Kubernetes",
                cluster: "staging-cluster-us-east",
                name: "elb-api-gateway",
                providerID: "arn:aws:elasticloadbalancing:us-east-1:123456789012:loadbalancer/net/e5f6g7h8/60dc7c596c0d9199",
            },
            labels: {
                "kubernetes.io/service-name": "api/api-gateway",
            },
            start: startDate.toISOString(),
            end: now.toISOString(),
            window: { start: startDate.toISOString(), end: now.toISOString() },
            adjustment: 0,
            cost: 22.50 * multiplier,
            private: false,
            ip: "203.0.113.51",
        },
    ];

    // Mock ClusterManagement assets
    const mockClusterManagement: ClusterManagementAsset[] = [
        {
            type: "ClusterManagement",
            properties: {
                category: "Management",
                provider: "Oracle",
                account: "oracle-tenancy-prod",
                project: "production",
                service: "Kubernetes",
                cluster: "prod-cluster-phoenix",
                name: "oke-cluster-management",
                providerID: "ocid1.cluster.oc1.phx.abc123",
            },
            labels: {},
            start: startDate.toISOString(),
            end: now.toISOString(),
            window: { start: startDate.toISOString(), end: now.toISOString() },
            adjustment: 0,
            cost: 0, 
        },
        {
            type: "ClusterManagement",
            properties: {
                category: "Management",
                provider: "AWS",
                account: "123456789012",
                project: "staging",
                service: "Kubernetes",
                cluster: "staging-cluster-us-east",
                name: "eks-cluster-management",
                providerID: "arn:aws:eks:us-east-1:123456789012:cluster/staging-cluster",
            },
            labels: {},
            start: startDate.toISOString(),
            end: now.toISOString(),
            window: { start: startDate.toISOString(), end: now.toISOString() },
            adjustment: 0,
            cost: 73.00 * multiplier,
        },
    ];

    // Combine all assets into a map (matching API response structure)
    const allAssets: Asset[] = [
        ...mockNodes,
        ...mockDisks,
        ...mockLoadBalancers,
        ...mockClusterManagement,
    ];

    // Convert to map with unique keys
    const assetsMap: Record<string, Asset> = {};
    allAssets.forEach((asset) => {
        const key = `${asset.type}/${asset.properties.cluster}/${asset.properties.name}`;
        assetsMap[key] = asset;
    });

    // Return in the expected response format
    return {
        code: 200,
        data: {
            Assets: assetsMap,
            Window: {
                start: startDate.toISOString(),
                end: now.toISOString(),
            },
        },
    };
};

/**
 * Mock carbon emission data for assets
 * Matches the /assets/carbon API response structure
 * @param _window - Time window
 * @param _options - Filter options
 * @returns Mock carbon response
 */
export const getMockAssetCarbonData = (window: string, _options: FetchOptions = {}): MockCarbonResponse => {
    const now = new Date();

    // Parse window to get duration in days
    let days = 7;
    if (window === 'today' || window === '24h') days = 1;
    else if (window === 'yesterday') days = 1;
    else if (window === '48h') days = 2;
    else if (window === 'week' || window === 'lastweek' || window === '7d') days = 7;
    else if (window === '14d') days = 14;
    else if (window === '30d') days = 30;

    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    const multiplier = days / 7;

    // Carbon emissions by asset type (in kg CO2)
    const carbonData: Record<string, CarbonAsset> = {
        // Compute (Nodes) - highest emissions
        "Node/prod-cluster-phoenix/10.0.138.229": {
            type: "Node",
            properties: {
                category: "Compute",
                provider: "Oracle",
                cluster: "prod-cluster-phoenix",
                name: "10.0.138.229",
            },
            carbonKg: 3.12 * multiplier,
            energyKwh: 8.45 * multiplier,
        },
        "Node/prod-cluster-phoenix/10.0.149.111": {
            type: "Node",
            properties: {
                category: "Compute",
                provider: "Oracle",
                cluster: "prod-cluster-phoenix",
                name: "10.0.149.111",
            },
            carbonKg: 0.41 * multiplier,
            energyKwh: 1.12 * multiplier,
        },
        "Node/staging-cluster-us-east/ip-10-1-1-50.ec2.internal": {
            type: "Node",
            properties: {
                category: "Compute",
                provider: "AWS",
                cluster: "staging-cluster-us-east",
                name: "ip-10-1-1-50.ec2.internal",
            },
            carbonKg: 2.85 * multiplier,
            energyKwh: 7.23 * multiplier,
        },
        "Node/gke-prod-cluster/gke-prod-default-pool-abc123": {
            type: "Node",
            properties: {
                category: "Compute",
                provider: "GCP",
                cluster: "gke-prod-cluster",
                name: "gke-prod-default-pool-abc123",
            },
            carbonKg: 1.95 * multiplier,
            energyKwh: 5.67 * multiplier,
        },
        // Storage (Disks) - moderate emissions
        "Disk/prod-cluster-phoenix/pvc-postgres-data-0": {
            type: "Disk",
            properties: {
                category: "Storage",
                provider: "Oracle",
                cluster: "prod-cluster-phoenix",
                name: "pvc-postgres-data-0",
            },
            carbonKg: 0.85 * multiplier,
            energyKwh: 2.34 * multiplier,
        },
        "Disk/staging-cluster-us-east/pvc-redis-data-0": {
            type: "Disk",
            properties: {
                category: "Storage",
                provider: "AWS",
                cluster: "staging-cluster-us-east",
                name: "pvc-redis-data-0",
            },
            carbonKg: 0.42 * multiplier,
            energyKwh: 1.15 * multiplier,
        },
        "Disk/gke-prod-cluster/pvc-elasticsearch-data-0": {
            type: "Disk",
            properties: {
                category: "Storage",
                provider: "GCP",
                cluster: "gke-prod-cluster",
                name: "pvc-elasticsearch-data-0",
            },
            carbonKg: 1.23 * multiplier,
            energyKwh: 3.45 * multiplier,
        },
        // Network (LoadBalancers) - lower emissions
        "LoadBalancer/prod-cluster-phoenix/lb-ingress-nginx": {
            type: "LoadBalancer",
            properties: {
                category: "Network",
                provider: "Oracle",
                cluster: "prod-cluster-phoenix",
                name: "lb-ingress-nginx",
            },
            carbonKg: 0.15 * multiplier,
            energyKwh: 0.42 * multiplier,
        },
        "LoadBalancer/staging-cluster-us-east/elb-api-gateway": {
            type: "LoadBalancer",
            properties: {
                category: "Network",
                provider: "AWS",
                cluster: "staging-cluster-us-east",
                name: "elb-api-gateway",
            },
            carbonKg: 0.18 * multiplier,
            energyKwh: 0.51 * multiplier,
        },
        // Management (ClusterManagement) - minimal emissions
        "ClusterManagement/prod-cluster-phoenix/oke-cluster-management": {
            type: "ClusterManagement",
            properties: {
                category: "Management",
                provider: "Oracle",
                cluster: "prod-cluster-phoenix",
                name: "oke-cluster-management",
            },
            carbonKg: 0.05 * multiplier,
            energyKwh: 0.12 * multiplier,
        },
        "ClusterManagement/staging-cluster-us-east/eks-cluster-management": {
            type: "ClusterManagement",
            properties: {
                category: "Management",
                provider: "AWS",
                cluster: "staging-cluster-us-east",
                name: "eks-cluster-management",
            },
            carbonKg: 0.35 * multiplier,
            energyKwh: 0.95 * multiplier,
        },
    };

    return {
        code: 200,
        data: {
            Assets: carbonData,
            Window: {
                start: startDate.toISOString(),
                end: now.toISOString(),
            },
        },
    };
};

/**
 * Mock Cost Over Time data (Stacked Area Chart)
 * Produces 4 groups: Node, Disk, LoadBalancer, ClusterManagement
 */
export const getMockCostOverTimeData = (window: string): { data: any[] } => {
    const now = new Date();
    let days = 7;
    if (window === 'today' || window === '24h') days = 1;
    else if (window === 'yesterday') days = 1;
    else if (window === '48h') days = 2;
    else if (window === '14d') days = 14;
    else if (window === '30d') days = 30;
    if (days < 7) days = 7;

    const data: any[] = [];
    const groups: { name: string; base: number }[] = [
        { name: 'Node', base: 8.5 },
        { name: 'ClusterManagement', base: 2.8 },
        { name: 'LoadBalancer', base: 1.5 },
        { name: 'Disk', base: 0.9 },
    ];

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const year = now.getFullYear();
    const startDate = new Date(year, 0, 1); // Jan 1st

    for (let i = 0; i < days; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        const dateLabel = `${monthNames[date.getMonth()]} ${date.getDate()}`;

        groups.forEach(({ name, base }) => {
            const dayFactor = 0.75 + Math.random() * 0.5;
            const weekdayBonus = (date.getDay() > 0 && date.getDay() < 6) ? 1.1 : 0.85;
            const value = parseFloat((base * dayFactor * weekdayBonus).toFixed(2));
            data.push({ group: name, date: dateLabel, value });
        });
    }

    return { data };
};

/**
 * Mock Cost by Service data (Stacked Bar Chart)
 */
export const getMockCostByServiceData = (window: string, breakdown: string = 'service'): { data: any[] } => {
    const now = new Date();
    let days = 28;
    if (window === 'today' || window === '24h') days = 1;
    else if (window === '48h') days = 2;
    else if (window === '7d') days = 7;
    else if (window === '14d') days = 14;
    if (days < 7) days = 7;

    const data: any[] = [];

    const serviceGroups: { name: string; base: number }[] = [
        { name: 'Node', base: 7.0 },
        { name: 'ClusterManagement', base: 4.0 },
        { name: 'LoadBalancer', base: 3.0 },
        { name: 'Disk', base: 2.5 },
    ];

    const clusterGroups: { name: string; base: number }[] = [
        { name: 'prod-cluster-us-east', base: 10.0 },
        { name: 'staging-cluster-eu', base: 5.5 },
        { name: 'dev-cluster-west', base: 3.0 },
        { name: 'prod-cluster-phoenix', base: 4.5 },
    ];

    const groups = breakdown === 'cluster' ? clusterGroups : serviceGroups;
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const year = now.getFullYear();
    const startDate = new Date(year, 0, 1); // Jan 1st

    for (let i = 0; i < days; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        const dateLabel = `${monthNames[date.getMonth()]} ${date.getDate()}`;

        groups.forEach(({ name, base }) => {
            const dayFactor = 0.7 + Math.random() * 0.6;
            const weekdayBonus = (date.getDay() > 0 && date.getDay() < 6) ? 1.15 : 0.8;
            const value = parseFloat((base * dayFactor * weekdayBonus).toFixed(2));
            data.push({ group: name, date: dateLabel, value });
        });
    }

    return { data };
};

export interface AssetDetailsMockData {
    trendData: { group: string; date: string; value: number }[];
    breakdownData: { group: string; value: number }[];
    compute: {
        cpuCores: string;
        cpuCost: number;
        ramGib: string;
        ramCost: number;
        storageCost: number;
        networkCost: number;
    };
    usage: {
        cpuEfficiency: string;
        ramEfficiency: string;
        idleCost: number;
        sharedCost: number;
    };
}

export const getMockAssetDetailsData = (asset: any): AssetDetailsMockData => {
    // Trend Data
    const year = new Date().getFullYear();
    const startDate = new Date(year, 0, 1); // Jan 1st
    const trendData = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    for (let i = 0; i < 7; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        const dateLabel = `${monthNames[date.getMonth()]} ${date.getDate()}`;

        const avgDaily = (asset.totalCost || 10) / 7;
        const value = avgDaily * (0.8 + Math.random() * 0.4);
        trendData.push({ group: 'cost', date: dateLabel, value });
    }

    // Breakdown Data
    const cpuVal = asset.cpuCost || (asset.totalCost || 0) * 0.45;
    const ramVal = asset.ramCost || (asset.totalCost || 0) * 0.35;
    const storageVal = (asset.totalCost || 0) * 0.15;
    const networkVal = (asset.totalCost || 0) * 0.05;

    const breakdownData = [
        { group: 'CPU', value: cpuVal },
        { group: 'RAM', value: ramVal },
        { group: 'Storage', value: storageVal },
        { group: 'Network', value: networkVal }
    ];

    // Compute Properties
    const compute = {
        cpuCores: (0.5 + Math.random() * 2).toFixed(1),
        cpuCost: cpuVal,
        ramGib: (2 + Math.random() * 8).toFixed(1),
        ramCost: ramVal,
        storageCost: storageVal,
        networkCost: networkVal
    };

    // Usage Metrics
    const usage = {
        cpuEfficiency: (60 + Math.random() * 30).toFixed(0),
        ramEfficiency: (50 + Math.random() * 40).toFixed(0),
        idleCost: (asset.totalCost || 0) * 0.2,
        sharedCost: (asset.totalCost || 0) * 0.05
    };

    return { trendData, breakdownData, compute, usage };
};

