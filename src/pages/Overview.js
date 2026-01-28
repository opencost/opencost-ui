import React, { useEffect, useMemo, useState } from "react";
import {
  Grid,
  Column,
  Tile,
  Tag,
  InlineLoading,
  InlineNotification,
} from "@carbon/react";
import { ArrowUpRight, ArrowDownRight } from "@carbon/icons-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LabelList,
  Cell,
  AreaChart,
  Area,
  CartesianGrid,
} from "recharts";
import CarbonShellLayout from "../components/carbon/CarbonShellLayout";
import AllocationService from "../services/allocation";
import {
  cumulativeToTotals,
  rangeToCumulative,
  toCurrency,
} from "../util";

const Overview = () => {
  const [allocationRange, setAllocationRange] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const currency = "USD";

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const resp = await AllocationService.fetchAllocation("7d", "namespace", {
          accumulate: false,
          filters: [],
          includeIdle: true,
        });
        const range = Array.isArray(resp?.data)
          ? resp.data
          : Array.isArray(resp)
            ? resp
            : [];

        if (range.length > 0) {
          setAllocationRange(range);
        } else {
          setAllocationRange([]);
        }
      } catch (err) {
        setError(
          err && err.message
            ? err.message
            : "Failed to load allocation overview data.",
        );
        setAllocationRange([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const { totals, topNamespaces, idleRow } = useMemo(() => {
    if (!allocationRange || allocationRange.length === 0) {
      return {
        totals: null,
        topNamespaces: [],
        idleRow: null,
      };
    }
    const cumulative = rangeToCumulative(allocationRange, "namespace");
    const cumulativeArray = Object.values(cumulative);
    const totalData = cumulativeToTotals(cumulative);

    const rows = cumulativeArray
      .filter((row) => row && typeof row.totalCost === "number")
      .sort((a, b) => b.totalCost - a.totalCost);

    const idle = rows.find((row) => row.name && row.name.indexOf("__idle__") >= 0) || null;
    const filteredRows = rows.filter(
      (row) =>
        !row.name ||
        (row.name.indexOf("__idle__") < 0 &&
          row.name.indexOf("__unallocated__") < 0),
    );

    const top = filteredRows.slice(0, 5);

    return {
      totals: totalData,
      topNamespaces: top,
      idleRow: idle,
    };
  }, [allocationRange]);

  const totalCost = totals ? totals.totalCost : 0;
  const idleCost = idleRow ? idleRow.totalCost : 0;
  const activeCost = totalCost - idleCost;
  const idleRatio = totalCost > 0 ? idleCost / totalCost : 0;

  const chartData = useMemo(() => {
    if (!topNamespaces || topNamespaces.length === 0) {
      return [];
    }
    return [...topNamespaces]
      .sort((a, b) => b.totalCost - a.totalCost)
      .map((row) => ({
        name: row.name,
        totalCost: row.totalCost,
        percent: totalCost > 0 ? row.totalCost / totalCost : 0,
      }));
  }, [topNamespaces, totalCost]);

  const dailyTrend = useMemo(() => {
    if (!allocationRange || allocationRange.length === 0) {
      return [];
    }

    return allocationRange
      .map((dayAllocations) => {
        const allocationsArray = Array.isArray(dayAllocations)
          ? dayAllocations
          : Object.values(dayAllocations || {});

        if (!allocationsArray || allocationsArray.length === 0) {
          return null;
        }

        const firstAllocation = allocationsArray[0];

        const dateLabel =
          firstAllocation?.window?.start ||
          firstAllocation?.start ||
          "";

        let dayTotal = 0;
        let dayIdle = 0;

        allocationsArray.forEach((allocation) => {
          const cost = allocation?.totalCost || 0;
          dayTotal += cost;
          if (
            allocation?.name &&
            allocation.name.indexOf("__idle__") >= 0
          ) {
            dayIdle += cost;
          }
        });

        const dayActive = dayTotal - dayIdle;

        return {
          date: dateLabel,
          total: dayTotal,
          active: dayActive,
          idle: dayIdle,
        };
      })
      .filter((entry) => entry !== null);
  }, [allocationRange]);

  return (
    <CarbonShellLayout>
      <main style={{ padding: "2rem 0" }}>
        <Grid fullWidth condensed>
          <Column sm={4} md={8} lg={16}>
            <h2 style={{ margin: "0 0 1rem 0" }}>Cost overview</h2>
            <p style={{ margin: 0, color: "var(--cds-text-secondary, #6f6f6f)" }}>
              Last 7 days by namespace with a focus on idle waste and top cost
              drivers.
            </p>
          </Column>

          <Column sm={4} md={8} lg={4}>
            <Tile>
              <p className="cds--label">Total spend (7 days)</p>
              <h3 style={{ marginTop: "0.25rem" }}>
                {toCurrency(totalCost || 0, currency)}
              </h3>
              <Tag type="green" size="sm" renderIcon={ArrowUpRight}>
                Allocation
              </Tag>
            </Tile>
          </Column>

          <Column sm={4} md={8} lg={4}>
            <Tile>
              <p className="cds--label">Active vs idle</p>
              <h3 style={{ marginTop: "0.25rem" }}>
                {toCurrency(activeCost > 0 ? activeCost : 0, currency)}
              </h3>
              <Tag type="gray" size="sm">
                Idle {Math.round(idleRatio * 100)}%
              </Tag>
            </Tile>
          </Column>

          <Column sm={4} md={8} lg={4}>
            <Tile>
              <p className="cds--label">Top namespace</p>
              {topNamespaces.length > 0 ? (
                <>
                  <h3 style={{ marginTop: "0.25rem" }}>{topNamespaces[0].name}</h3>
                  <Tag type="purple" size="sm" renderIcon={ArrowUpRight}>
                    {toCurrency(topNamespaces[0].totalCost, currency)}
                  </Tag>
                </>
              ) : (
                <p style={{ marginTop: "0.25rem" }}>No data</p>
              )}
            </Tile>
          </Column>

          <Column sm={4} md={8} lg={4}>
            <Tile>
              <p className="cds--label">Potential waste</p>
              <h3 style={{ marginTop: "0.25rem" }}>
                {toCurrency(idleCost || 0, currency)}
              </h3>
              <Tag
                type={idleRatio > 0.3 ? "red" : "yellow"}
                size="sm"
                renderIcon={ArrowDownRight}
              >
                Idle cost
              </Tag>
            </Tile>
          </Column>

          <Column sm={4} md={8} lg={16} style={{ marginTop: "1.5rem" }}>
            {loading && (
              <InlineLoading
                description="Loading allocation overview..."
                status="active"
              />
            )}
            {!loading && error && (
              <InlineNotification
                kind="error"
                title="Failed to load overview"
                subtitle={error}
                lowContrast
              />
            )}
          </Column>

          {!loading && !error && chartData.length > 0 && (
            <Column sm={4} md={8} lg={16} style={{ marginTop: "1.5rem" }}>
              <Tile>
                <h3 style={{ marginTop: 0, marginBottom: "0.75rem" }}>
                  Top cost drivers (namespaces)
                </h3>
                <div style={{ width: "100%", height: 260 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData}
                      layout="vertical"
                      margin={{ top: 8, right: 32, left: 0, bottom: 8 }}
                    >
                      <XAxis
                        type="number"
                        tickFormatter={(value) => toCurrency(value, currency)}
                      />
                      <YAxis
                        type="category"
                        dataKey="name"
                        width={160}
                      />
                      <Tooltip
                        formatter={(value) => toCurrency(value, currency)}
                        labelFormatter={(name) => `Namespace: ${name}`}
                      />
                      <Bar
                        dataKey="totalCost"
                        radius={[0, 999, 999, 0]}
                        isAnimationActive={false}
                      >
                        {chartData.map((row, index) => (
                          <Cell
                            // eslint-disable-next-line react/no-array-index-key
                            key={`${row.name}-${index}`}
                            fill={index === 0 ? "#0f62fe" : "#8a3ffc"}
                          />
                        ))}
                        <LabelList
                          dataKey="totalCost"
                          position="right"
                          formatter={(value, _name, props) => {
                            const percent =
                              typeof props?.payload?.percent === "number"
                                ? Math.round(props.payload.percent * 100)
                                : 0;
                            return `${toCurrency(
                              typeof value === "number" ? value : 0,
                              currency,
                            )} (${percent}%)`;
                          }}
                          style={{ fontSize: 12 }}
                        />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Tile>
            </Column>
          )}

          {!loading && !error && dailyTrend.length > 0 && (
            <Column sm={4} md={8} lg={16} style={{ marginTop: "1.5rem" }}>
              <Tile>
                <h3 style={{ marginTop: 0, marginBottom: "0.75rem" }}>
                  Spend over time (last 7 days)
                </h3>
                <div style={{ width: "100%", height: 260 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={dailyTrend}
                      margin={{ top: 8, right: 24, left: 0, bottom: 8 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis
                        tickFormatter={(value) => toCurrency(value, currency)}
                      />
                      <Tooltip
                        formatter={(value) => toCurrency(value, currency)}
                        labelFormatter={(label) => `Date: ${label}`}
                      />
                      <Area
                        type="monotone"
                        dataKey="active"
                        stackId="1"
                        stroke="#0f62fe"
                        fill="#0f62fe"
                        name="Active"
                      />
                      <Area
                        type="monotone"
                        dataKey="idle"
                        stackId="1"
                        stroke="#8d8d8d"
                        fill="#c6c6c6"
                        name="Idle"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Tile>
            </Column>
          )}
        </Grid>
      </main>
    </CarbonShellLayout>
  );
};

export default Overview;

