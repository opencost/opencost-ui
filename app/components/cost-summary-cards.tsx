import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Currency, ChartLine, ChartLineSmooth, Activity } from "@carbon/icons-react";
import AllocationService from "~/services/allocation";
import CloudCostService from "~/services/cloud-cost";
import ExternalCostsService from "~/services/external-costs";
import { toCurrency } from "~/lib/legacy-util";

interface SummaryData {
  totalCost: number;
  cloudCost: number;
  externalCost: number;
  efficiency: number;
}

function MetricCard({
  label,
  value,
  icon: Icon,
  loading,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ size: number; style?: React.CSSProperties }>;
  loading: boolean;
}) {
  return (
    <div className="metric-card">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
        <div className="metric-label">{label}</div>
        <Icon size={16} style={{ color: "#525252" }} />
      </div>
      {loading ? (
        <div className="metric-value" style={{ color: "#8d8d8d" }}>—</div>
      ) : (
        <div className="metric-value">{value}</div>
      )}
    </div>
  );
}

export default function CostSummaryCards({ window = "7d" }: { window?: string }) {
  const [data, setData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const [allocResp, cloudResp, externalResp] = await Promise.allSettled([
          AllocationService.fetchAllocation(window, "cluster", { accumulate: true }),
          CloudCostService.fetchCloudCostData(window, "provider", "AmortizedNetCost", []),
          ExternalCostsService.fetchExternalTableCosts(window, "domain", [], "blended", "cost", "desc"),
        ]);

        if (cancelled) return;

        let totalCost = 0;
        let totalEfficiency = 0;
        if (allocResp.status === "fulfilled" && allocResp.value?.data) {
          for (const set of allocResp.value.data) {
            for (const alloc of Object.values(set) as any[]) {
              totalCost += alloc.totalCost ?? 0;
              totalEfficiency = alloc.totalEfficiency ?? totalEfficiency;
            }
          }
        }

        let cloudCost = 0;
        if (cloudResp.status === "fulfilled" && cloudResp.value?.tableTotal) {
          cloudCost = cloudResp.value.tableTotal.cost ?? 0;
        }

        let externalCost = 0;
        if (externalResp.status === "fulfilled" && Array.isArray(externalResp.value)) {
          externalCost = (externalResp.value as any[]).reduce((sum, row) => sum + (row.cost ?? 0), 0);
        }

        setData({ totalCost, cloudCost, externalCost, efficiency: totalEfficiency * 100 });
      } catch {
        // silently fall back to empty
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [window]);

  return (
    <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(4, 1fr)" }}>
      <MetricCard
        label="Total Cluster Cost"
        value={data ? toCurrency(data.totalCost, "USD", 2) : "—"}
        icon={Currency}
        loading={loading}
      />
      <MetricCard
        label="Cloud Costs"
        value={data ? toCurrency(data.cloudCost, "USD", 2) : "—"}
        icon={ChartLine}
        loading={loading}
      />
      <MetricCard
        label="External Costs"
        value={data ? toCurrency(data.externalCost, "USD", 2) : "—"}
        icon={ChartLineSmooth}
        loading={loading}
      />
      <MetricCard
        label="Efficiency"
        value={data ? `${data.efficiency.toFixed(1)}%` : "—"}
        icon={Activity}
        loading={loading}
      />
    </div>
  );
}
