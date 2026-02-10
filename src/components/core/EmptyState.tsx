import React from 'react';
import { Tile, Button } from '@carbon/react';
import { CloudMonitoring, Renew } from '@carbon/react/icons';

interface EmptyStateProps {
    onRefresh?: () => void;
    title?: string;
    message?: string;
    icon?: React.ReactNode;
    actionLabel?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
    onRefresh,
    title = "No Assets Found",
    message = "No asset data is available for the selected time window and filters.",
    actionLabel = "Reload Data"
}) => (
    <Tile className="empty-container">
        <CloudMonitoring size={48} className="empty-icon" />
        <h4 className="empty-title">{title}</h4>
        <p className="empty-message">{message}</p>
        {onRefresh && (
            <Button kind="primary" onClick={onRefresh} renderIcon={Renew}>
                {actionLabel}
            </Button>
        )}
    </Tile>
);

export default EmptyState;
