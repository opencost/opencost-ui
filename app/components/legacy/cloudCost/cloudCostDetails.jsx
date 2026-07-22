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
          if (match.length > 0) {
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
      if (err.message.indexOf("404") === 0) {
        setErrors([
          {
            primary: "Failed to load report data",
            secondary:
              "Please update OpenCost to the latest version, then open an Issue on GitHub if problems persist.",
          },
        ]);
      } else {
        let secondary = "Please open an Issue on GitHub if problems persist.";
        if (err.message.length > 0) {
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

  const drilldownData = data.sort(
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

  const modalStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const paperStyle = {
    backgroundColor: "var(--cds-layer)",
    color: "var(--cds-text-primary)",
    border: "1px solid var(--cds-border-subtle)",
    borderRadius: "8px",
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    padding: "24px",
    maxWidth: "700px",
    width: "90%",
    maxHeight: "85vh",
    overflowY: "auto",
    outline: "none",
  };

  return (
    <div>
      <Modal
        open={true}
        onClose={onClose}
        title={`Costs over the last ${window}`}
        style={modalStyle}
      >
        <Paper style={paperStyle}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
            borderBottom: "1px solid var(--cds-border-subtle)",
            paddingBottom: "12px"
          }}>
            <h3 style={{
              margin: 0,
              fontSize: "1.25rem",
              fontWeight: 600,
              color: "var(--cds-text-primary)",
              fontFamily: '"IBM Plex Sans", sans-serif'
            }}>
              {`Costs over the last ${window}`}
            </h3>
            <button
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                color: "var(--cds-text-primary)",
                cursor: "pointer",
                fontSize: "1.5rem",
                lineHeight: 1,
                padding: "4px 8px",
                borderRadius: "4px",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "var(--cds-layer-hover)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              &times;
            </button>
          </div>

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
          {data && (
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
                <Bar dataKey={"cost"} fill={"#2196f3"} name={"Item Cost"} />
                <Tooltip
                  formatter={(value) =>
                    `${toCurrency(value ?? 0, currency, 4, true)}`
                  }
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
