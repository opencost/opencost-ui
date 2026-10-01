import * as React from "react";
import { Modal, Paper, Typography } from "@mui/material";
import Warnings from "../Warnings";
import CircularProgress from "@mui/material/CircularProgress";

import {
  CartesianGrid,
  Legend,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";
import { toCurrency } from "../../../lib/legacy-util";
import cloudCostDayTotals from "../../../services/cloud-cost-day-totals";
import {
  ThemedModalHeader,
  modalCenterStyle,
  paperBaseStyle,
} from "../themed-modal";

const paperStyle = {
  ...paperBaseStyle,
  maxWidth: "700px",
  maxHeight: "85vh",
};

const CloudCostDetails = ({
  onClose,
  selectedProviderId,
  selectedItem,
  agg,
  filters,
  costMetric,
  window,
  currency,
}) => {
  const [data, setData] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [errors, setErrors] = React.useState([]);
  const [fetch, setFetch] = React.useState(true);

  const nextFilters = [
    ...(filters ?? []),
    { property: "providerID", value: selectedProviderId },
  ];

  async function fetchData() {
    setLoading(true);
    setErrors([]);

    try {
      const resp = await cloudCostDayTotals.fetchCloudCostData(
        window,
        agg,
        costMetric,
        nextFilters,
      );

      if (resp.data) {
        setData(resp.data);
      } else {
        if (resp.message && resp.message.indexOf("boundary error") >= 0) {
          let match = resp.message.match(/(ETL is \d+\.\d+% complete)/);
          let secondary = "Try again after ETL build is complete";
          if (match && match.length > 0) {
            secondary = `${match[1]}. ${secondary}`;
          }
          setErrors([
            {
              primary: "Data unavailable while ETL is building",
              secondary: secondary,
            },
          ]);
        }
        setData([]);
      }
    } catch (err) {
      console.log(err);
      if (err.response?.status === 404 || err.message?.includes("404")) {
        setErrors([
          {
            primary: "Failed to load report data",
            secondary:
              "Please update OpenCost to the latest version, then open an Issue on GitHub if problems persist.",
          },
        ]);
      } else {
        let secondary = "Please open an Issue on GitHub if problems persist.";
        if (err.message?.length > 0) {
          secondary = err.message;
        }
        setErrors([
          {
            primary: "Failed to load report data",
            secondary: secondary,
          },
        ]);
      }
      setData([]);
    }
    setLoading(false);
    setFetch(false);
  }

  React.useEffect(() => {
    if (fetch) {
      fetchData();
    }
  }, [fetch]);

  const drilldownData = [...data].sort(
    (a, b) =>
      new Date(a.date ?? "").getTime() - new Date(b.date ?? "").getTime(),
  );

  const itemData = drilldownData.map((items) => {
    const dataPoint = {
      time: new Date(items.date),
      cost: items.cost,
    };
    return dataPoint;
  });

  return (
    <div>
      <Modal open={true} onClose={onClose} style={modalCenterStyle}>
        <Paper
          style={paperStyle}
          role="dialog"
          aria-modal="true"
          aria-labelledby="cloud-cost-details-title"
        >
          <ThemedModalHeader
            title={`Costs over the last ${window}`}
            titleId="cloud-cost-details-title"
            onClose={onClose}
          />

          <Typography style={{ marginTop: "0.5rem", color: "var(--cds-text-secondary)", fontFamily: '"IBM Plex Sans", sans-serif' }} variant="body2">
            {selectedItem}
          </Typography>

          {loading && (
            <div style={{ display: "flex", justifyContent: "center" }}>
              <div style={{ paddingTop: 100, paddingBottom: 100 }}>
                <CircularProgress />
              </div>
            </div>
          )}
          {!loading && errors.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <Warnings warnings={errors} />
            </div>
          )}
          {data.length > 0 && (
            <div style={{ display: "flex", marginTop: "2.5rem" }}>
              <BarChart
                data={itemData}
                margin={{
                  top: 0,
                  bottom: 10,
                  left: 20,
                  right: 0,
                }}
                responsive
                height={250}
                width="100%"
                id={"cloud-cost-drilldown"}
              >
                <CartesianGrid vertical={false} />
                <Legend verticalAlign={"bottom"} />
                <XAxis dataKey={"time"} />
                <YAxis tickFormatter={(tick) => `${toCurrency(tick)}`} />
                <Bar
                  dataKey={"cost"}
                  fill={"var(--cds-link-primary)"}
                  name={"Item Cost"}
                />
                <Tooltip
                  formatter={(value) =>
                    `${toCurrency(value ?? 0, currency, 4, true)}`
                  }
                  contentStyle={{
                    backgroundColor: "var(--cds-layer)",
                    border: "1px solid var(--cds-border-subtle)",
                    borderRadius: "4px",
                  }}
                  labelStyle={{ color: "var(--cds-text-primary)" }}
                  itemStyle={{ color: "var(--cds-text-primary)" }}
                />
              </BarChart>
            </div>
          )}
        </Paper>
      </Modal>
    </div>
  );
};

export { CloudCostDetails };
