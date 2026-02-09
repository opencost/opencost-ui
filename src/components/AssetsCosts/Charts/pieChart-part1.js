import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = [
  "#1976d2",
  "#2e7d32",
  "#ed6c02",
  "#9c27b0",
  "#d32f2f",
  "#0288d1",
];

function PieChartMain({ data, date , onTypeSelect}) {
  if (!date || !data || data.length === 0) {
    return <div>Select a day to see breakdown</div>;
  }

  // Filter only selected day
  const dayData = data.filter(
    item => item.start?.startsWith(date)
  );

  // Group by asset type
  const map = {};

  dayData.forEach(item => {
    const type = item.type || "Other";
    const cost = item.totalCost || 0;

    if (!map[type]) {
      map[type] = 0;
    }

    map[type] += cost;
  });

  // Convert to chart format
  const pieData = Object.entries(map).map(
    ([name, value]) => ({
      name,
      value: Number(value.toFixed(3)),
    })
  );

  if (pieData.length === 0) {
    return <div>No data for {date}</div>;
  }

  return (
    <div style={{ width: "100%", height: 300 }}>

      <h4 style={{ textAlign: "center" }}>
        Cost Breakdown — {date}
      </h4>

      <ResponsiveContainer width="100%" height="100%">

        <PieChart>

          <Pie
            data={pieData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={90}
            label
            onClick={(entry) => {
           if (entry?.name) {
            onTypeSelect(entry.name); // 🔥 send type
            }
  }}          
          >

            {pieData.map((_, index) => (
              <Cell
                key={index}
                fill={COLORS[index % COLORS.length]}
              />
            ))}

          </Pie>

          <Tooltip />
          <Legend />

        </PieChart>

      </ResponsiveContainer>

    </div>
  );
}

export default PieChartMain;
