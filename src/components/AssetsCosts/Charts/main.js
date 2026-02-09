import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import React, { useEffect, useMemo, useState } from "react";
import PieChartMain from "./pieChart-part1";
import PieChartMain2 from "./pieChart-part2";
import { Button } from "@carbon/react";
import AssetsCostsTable from "./assetsTable";
import { Padding } from "@mui/icons-material";
import AssetsByTypeTabs from "./assetByTypeTabs"
//based on what you want to group
const aggregationOptions = [
  { name: "Cloud", value: "cloud" },
  { name: "Disk", value: "disk" },
  { name: "Loadbalancer", value: "loadbalancer" },
  { name: "Network", value: "network" },
  { name: "Node", value: "node" },
  { name: "Shared", value: "shared" },
  { name: "ClusterManagement", value: "clustermanagement" },
];


//tables built using the carbon-react needs this format of data
function buildTableRows(data) {
  if (!Array.isArray(data)) return [];

  return data.map((item, index) => ({
    id: String(index), // required by Carbon

    date: item.start
      ? item.start.split("T")[0]
      : "-",

    type: item.type || "-",

    category:
      item.properties?.category || "-",

    name:
      item.properties?.name ||
      item.properties?.providerID ||
      "Unknown",

    service:
      item.properties?.service || "-",

    provider:
      item.properties?.provider || "-",

    totalCost: item.totalCost
      ? item.totalCost.toFixed(4)
      : "0.0000",
  }));
}


function ChartsMain({ finalData }) {
  const [selectedDate, setSelectedDate] = React.useState(null);
  const [selectedType, setSelectedType] = React.useState(null);
    if (!Array.isArray(finalData)) {
        console.log("data should be in the format of arrays for charts")
    }
    //1.convert our data into the chart format
    var arr = finalData
     function aggregateByDate(data) {
  const map = {};

  data.forEach(item => {
    const date = item.start?.split("T")[0];
    const cost = item.totalCost || 0;

    if (!date) return;

    if (!map[date]) {
      map[date] = 0;
    }

    map[date] += cost;
  });

  // Convert to array
  return Object.entries(map).map(([date, cost]) => ({
    date,
    cost: Number(cost.toFixed(4)), // clean decimals
  }));
}
    const chartData = aggregateByDate(arr)
    const sortedChartsData = chartData.sort(
  (a, b) => new Date(a.date) - new Date(b.date)
  );
  

  const tableRows = buildTableRows(finalData);
 
   useEffect(() => {
  if (sortedChartsData.length > 0 && !selectedDate) {
    setSelectedDate(sortedChartsData[0].date);
  }
}, [sortedChartsData]);
    
    // console.log("Selected Day:", selectedDate);

  return (
      <>
       <div style={{ width: "100%", height: 350 , background: 'var(--cds-layer-01)',
    padding: '12px',
    borderRadius: '8px',}}>
           <p style={{ textAlign: "center", marginBottom: 8 }}>
     Click  points(dates) on the line chart to view the cost breakdown
  </p>
      <ResponsiveContainer>
         
                <LineChart data={sortedChartsData}
                 onClick={(e) => {
    if (e && e.activeLabel) {
      setSelectedDate(e.activeLabel);
    }
  }}>

          <CartesianGrid strokeDasharray="3 3" />

          <XAxis dataKey="date" />

          <YAxis />

          <Tooltip />

          <Line
            type="monotone"
            dataKey="cost"
            stroke="#1976d2"
            strokeWidth={2}
            dot={{ r: 3 }}
                        
          />

        </LineChart>

      </ResponsiveContainer>

      </div>

       <div
    style={{
      display: "flex",
      gap: "20px",
      marginTop: "20px",
    }}
  >
    {/* Pie 1 */}
    <div style={{ flex: 1 }}>
      <PieChartMain data={finalData} date={selectedDate} onTypeSelect={setSelectedType} />
    </div>

    {/* Pie 2 */}
    <div style={{ flex: 1 }}>
      <PieChartMain2 data={finalData} date={selectedDate}  type={selectedType} />
    </div>
      </div>
      {finalData && finalData.length > 0 && (
       <div style={{   marginTop: 40,
    marginBottom: 45,
    padding: 16,
    backgroundColor: "#f4f4f4", // Carbon gray-10
    borderRadius: 4, }}>
  <AssetsByTypeTabs
    data={finalData}
    aggregationOptions={aggregationOptions}
  />
</div>

)}
       {finalData && finalData.length > 0 && (
        <AssetsCostsTable rows={tableRows} style={{ paddingTop: "20px" }} />
)}
      
      </>
  );
}

export default ChartsMain