import React from 'react';
import { Loading } from '@carbon/react';

interface LoadingStateProps {
    description?: string;
    minHeight?: string;
    borderRadius?: string;
    background?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({
    description = "Loading assets..."
}) => (
    <div className="loading-container">
        <Loading description={description} withOverlay={false} />
    </div>
);

export default LoadingState;
