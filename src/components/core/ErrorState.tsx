import React from 'react';
import { Tile, Button } from '@carbon/react';
import { Warning, Renew } from '@carbon/react/icons';

interface ErrorStateProps {
    error: string;
    onRetry?: () => void;
    title?: string;
    actionLabel?: string;
}

const ErrorState: React.FC<ErrorStateProps> = ({
    error,
    onRetry,
    title = "Failed to Load Assets",
    actionLabel = "Try Again"
}) => (
    <Tile className="error-container">
        <Warning size={48} className="error-icon" />
        <h4 className="error-title">{title}</h4>
        <p className="error-message">
            {error || 'An unexpected error occurred while fetching asset data.'}
        </p>
        {onRetry && (
            <Button kind="danger" onClick={onRetry} renderIcon={Renew}>
                {actionLabel}
            </Button>
        )}
    </Tile>
);

export default ErrorState;
