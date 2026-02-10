import React from 'react';
import { Tile, SkeletonText } from '@carbon/react';
import type { KPICardProps } from '../../types/assets';

/**
 * KPICard - Reusable KPI tile component for dashboard metrics
 * Displays a key performance indicator with optional secondary value and icon
 * 
 * Features:
 * - Loading state with Carbon skeleton
 * - Outlier styling with left border accent
 * - Secondary value display for comparative metrics
 * - Hover effects for interactivity
 */
const KPICard: React.FC<KPICardProps> = ({
    title,
    value,
    subtitle,
    valueColor = 'var(--color-gray-100)',
    highlightColor,
    icon,
    isOutlier = false,
    secondaryValue,
    secondaryValueColor,
    className = '',
}) => {
    return (
        <Tile
            className={`kpi-card-container ${isOutlier ? 'outlier' : ''} ${className}`}
        >
            <div className="kpi-title">{title}</div>
            <div className="kpi-value" style={{ color: valueColor }}>
                {icon && <span className="kpi-icon-container">{icon}</span>}
                <span>{value}</span>
                {secondaryValue && (
                    <>
                        <span className="kpi-arrow">→</span>
                        <span
                            className="kpi-secondary-value"
                            style={{ color: secondaryValueColor || 'var(--state-error)' }}
                        >
                            {secondaryValue}
                        </span>
                    </>
                )}
            </div>
            {subtitle && <div className="kpi-subtitle">{subtitle}</div>}
        </Tile>
    );
};

/**
 * KPICardSkeleton - Loading skeleton for KPI card
 */
export const KPICardSkeleton: React.FC = () => {
    return (
        <Tile className="kpi-card-container">
            <div className="margin-bottom-spacing-04">
                <SkeletonText heading={false} width="60%" />
            </div>
            <div className="margin-bottom-spacing-03">
                <SkeletonText heading={true} width="40%" />
            </div>
            <div>
                <SkeletonText heading={false} width="80%" />
            </div>
        </Tile>
    );
};

export default React.memo(KPICard);
