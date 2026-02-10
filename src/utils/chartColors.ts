/**
 * Chart Color Utilities
 * Provides consistent color assignment for charts using CSS custom properties
 * defined in global.scss. This ensures all colors are centralized and can be
 * easily themed or modified.
 */

// ============================================
// Provider Colors
// ============================================

/**
 * Get the CSS variable for a cloud provider color
 * @param provider - Cloud provider name (aws, gcp, azure, oracle, alibaba)
 * @returns CSS variable reference string
 */
export const getProviderColor = (provider?: string): string => {
    switch (provider?.toLowerCase()) {
        case 'aws':
            return 'var(--chart-provider-aws)';
        case 'gcp':
        case 'google':
            return 'var(--chart-provider-gcp)';
        case 'azure':
        case 'microsoft':
            return 'var(--chart-provider-azure)';
        case 'oracle':
            return 'var(--chart-provider-oracle)';
        case 'alibaba':
        case 'aliyun':
            return 'var(--chart-provider-alibaba)';
        default:
            return 'var(--chart-provider-unknown)';
    }
};

/**
 * Get a static color map for all known providers
 * Used for Carbon Charts color scale configuration
 */
export const getProviderColorScale = (): Record<string, string> => {
    return {
        'AWS': 'var(--chart-provider-aws)',
        'aws': 'var(--chart-provider-aws)',
        'GCP': 'var(--chart-provider-gcp)',
        'gcp': 'var(--chart-provider-gcp)',
        'Google': 'var(--chart-provider-gcp)',
        'Azure': 'var(--chart-provider-azure)',
        'azure': 'var(--chart-provider-azure)',
        'Microsoft': 'var(--chart-provider-azure)',
        'Oracle': 'var(--chart-provider-oracle)',
        'oracle': 'var(--chart-provider-oracle)',
        'Alibaba': 'var(--chart-provider-alibaba)',
        'alibaba': 'var(--chart-provider-alibaba)',
        'N/A': 'var(--chart-provider-unknown)',
        'Unknown': 'var(--chart-provider-unknown)',
    };
};

// ============================================
// Category Colors
// ============================================

/**
 * Get the CSS variable for an asset category color
 * @param category - Asset category (compute, management, storage, network)
 * @returns CSS variable reference string
 */
export const getCategoryColor = (category?: string): string => {
    switch (category?.toLowerCase()) {
        case 'compute':
        case 'node':
        case 'nodes':
            return 'var(--chart-category-compute)';
        case 'management':
        case 'clustermanagement':
        case 'cluster management':
            return 'var(--chart-category-management)';
        case 'storage':
        case 'disk':
        case 'disks':
            return 'var(--chart-category-storage)';
        case 'network':
        case 'loadbalancer':
        case 'load balancer':
            return 'var(--chart-category-network)';
        default:
            return 'var(--chart-provider-unknown)';
    }
};

/**
 * Get a static color map for cost categories
 * Used for Carbon Charts color scale configuration
 */
export const getCategoryColorScale = (): Record<string, string> => {
    return {
        'Compute (Nodes)': 'var(--chart-category-compute)',
        'Compute': 'var(--chart-category-compute)',
        'Node': 'var(--chart-category-compute)',
        'Nodes': 'var(--chart-category-compute)',
        'Management (Cluster Management)': 'var(--chart-category-management)',
        'Management': 'var(--chart-category-management)',
        'ClusterManagement': 'var(--chart-category-management)',
        'Storage (Disks)': 'var(--chart-category-storage)',
        'Storage': 'var(--chart-category-storage)',
        'Disk': 'var(--chart-category-storage)',
        'Disks': 'var(--chart-category-storage)',
        'Network (Load Balancers + Network)': 'var(--chart-category-network)',
        'Network': 'var(--chart-category-network)',
        'LoadBalancer': 'var(--chart-category-network)',
        'Load Balancer': 'var(--chart-category-network)',
    };
};

// ============================================
// Carbon Emission Colors
// ============================================

/**
 * Get the CSS variable for carbon emission category color
 * @param category - Asset category
 * @returns CSS variable reference string
 */
export const getCarbonColor = (category?: string): string => {
    switch (category?.toLowerCase()) {
        case 'compute':
        case 'node':
        case 'nodes':
            return 'var(--chart-carbon-compute)';
        case 'management':
        case 'clustermanagement':
        case 'cluster management':
            return 'var(--chart-carbon-management)';
        case 'storage':
        case 'disk':
        case 'disks':
            return 'var(--chart-carbon-storage)';
        case 'network':
        case 'loadbalancer':
        case 'load balancer':
            return 'var(--chart-carbon-network)';
        default:
            return 'var(--chart-provider-unknown)';
    }
};

/**
 * Get a static color map for carbon emission categories
 * Used for Carbon Charts color scale configuration
 */
export const getCarbonColorScale = (): Record<string, string> => {
    return {
        'Compute (Nodes)': 'var(--chart-carbon-compute)',
        'Compute': 'var(--chart-carbon-compute)',
        'Node': 'var(--chart-carbon-compute)',
        'Nodes': 'var(--chart-carbon-compute)',
        'Management (Cluster Management)': 'var(--chart-carbon-management)',
        'Management': 'var(--chart-carbon-management)',
        'ClusterManagement': 'var(--chart-carbon-management)',
        'Storage (Disks)': 'var(--chart-carbon-storage)',
        'Storage': 'var(--chart-carbon-storage)',
        'Disk': 'var(--chart-carbon-storage)',
        'Disks': 'var(--chart-carbon-storage)',
        'Network (Load Balancers + Network)': 'var(--chart-carbon-network)',
        'Network': 'var(--chart-carbon-network)',
        'LoadBalancer': 'var(--chart-carbon-network)',
        'Load Balancer': 'var(--chart-carbon-network)',
    };
};

// ============================================
// Utility Types
// ============================================

export type ProviderType = 'aws' | 'gcp' | 'azure' | 'oracle' | 'alibaba' | 'unknown';
export type CategoryType = 'compute' | 'management' | 'storage' | 'network' | 'unknown';
