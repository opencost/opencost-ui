import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = [
  "#1565c0",
  "#2e7d32",
  "#f57c00",
  "#7b1fa2",
  "#c62828",
];

function PieChartMain2({ data, date, type }) {

  if (!date || !type || !data) {
    return <div>Click on asset from cost breakdown</div>;
  }

  // Filter by day + type
  const filtered = data.filter(item =>
    item.start?.startsWith(date) &&
    item.type === type
  );

  // Group by asset name
  const map = {};

  filtered.forEach(item => {
    const name =
      item.properties?.name ||
      item.properties?.providerID ||
      "Unknown";

    const cost = item.totalCost || 0;

    if (!map[name]) {
      map[name] = 0;
    }

    map[name] += cost;
  });

  const pieData = Object.entries(map).map(
    ([name, value]) => ({
      name,
      value: Number(value.toFixed(3)),
    })
  );

  if (pieData.length === 0) {
    return <div>No assets for {type}</div>;
  }

  return (
    <div style={{ width: "100%", height: 300 }}>

      <h4 style={{ textAlign: "center" }}>
        {type} Details — {date}
      </h4>

      <ResponsiveContainer>

        <PieChart>

          <Pie
            data={pieData}
            dataKey="value"
            nameKey="name"
            outerRadius={90}
            label
          >

            {pieData.map((_, i) => (
              <Cell
                key={i}
                fill={COLORS[i % COLORS.length]}
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

export default PieChartMain2;