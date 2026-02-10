import React from 'react';
import { Grid, Column } from '@carbon/react';
import KPICard, { KPICardSkeleton } from './KPICard';
import type { KPICardRowProps } from '../../types/assets';

const KPICardRow: React.FC<KPICardRowProps> = ({
    kpis = [],
    columnsPerCard = 4,
    loading = false,
}) => {


    // Render skeleton loading state
    if (loading) {
        return (
            <div className="margin-bottom-0">
                <Grid fullWidth narrow>
                    {[1, 2, 3, 4].map((index) => (
                        <Column
                            key={`skeleton-${index}`}
                            lg={columnsPerCard}
                            md={4}
                            sm={4}
                            className="margin-bottom-05"
                        >
                            <KPICardSkeleton />
                        </Column>
                    ))}
                </Grid>
            </div>
        );
    }

    const getColumnProps = (index: number, total: number) => {
        if (total === 4) {
            return index < 3
                ? { lg: 3, md: 4, sm: 4 }
                : { lg: 7, md: 4, sm: 4 };
        }
        return { lg: columnsPerCard, md: 4, sm: 4 };
    };

    return (
        <div className="margin-bottom-0">
            <Grid fullWidth narrow>
                {kpis.map((kpi, index) => (
                    <Column
                        key={kpi.id || index}
                        {...getColumnProps(index, kpis.length)}
                        className="kpi-col margin-bottom-05"
                    >
                        <KPICard
                            title={kpi.title}
                            value={kpi.value}
                            subtitle={kpi.subtitle}
                            valueColor={kpi.valueColor}
                            highlightColor={kpi.highlightColor}
                            icon={kpi.icon}
                            isOutlier={kpi.isOutlier}
                            secondaryValue={kpi.secondaryValue}
                            secondaryValueColor={kpi.secondaryValueColor}
                        />
                    </Column>
                ))}
            </Grid>
        </div>
    );
};

export default React.memo(KPICardRow);
