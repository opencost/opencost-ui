import React from "react";
import { Tile } from "@carbon/react";
import { ChartColumn } from "@carbon/icons-react";
import "./EmptyState.css";

const EmptyState = () => {
    return (
        <Tile className="empty-state">
            <ChartColumn size={64} className="empty-state-icon" />
            <h3>No Assets Found</h3>
            <p>There are currently no infrastructure assets to display.</p>
            <p className="empty-state-hint">
                Assets will appear here once your OpenCost backend starts tracking infrastructure costs.
            </p>
        </Tile>
    );
};

export default EmptyState;
