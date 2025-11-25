import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from "recharts";
import { primary, greyscale, browns } from "../../constants/colors";
import { toCurrency } from "../../util";
import { aggToKeyMapExternalCosts } from "./tokens";

const RangeChart = ({ data, currency, height, aggregateBy }) => {
  const accents = [...primary, ...greyscale, ...browns];

  const getItemCost = (item) => {
    return item.cost;
  };

  function toBar({ end, graph, start }) {
    const points = graph.map((item) => ({
      ...item,
      window: { end, start },
    }));

    const dateFormatter = Intl.DateTimeFormat(navigator.language, {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      timeZone: "UTC",
    });

    const timeFormatter = Intl.DateTimeFormat(navigator.language, {
      hour: "numeric",
      minute: "numeric",
      timeZone: "UTC",
    });

    const s = new Date(start);
    const e = new Date(end);
    const interval = (e.valueOf() - s.valueOf()) / 1000 / 60 / 60;

    const bar = {
      end: new Date(end),
      key: interval >= 24 ? dateFormatter.format(s) : timeFormatter.format(s),
      items: {},
      start: new Date(start),
    };

    points.forEach((item) => {
      const windowStart = new Date(item.window.start);
      const windowEnd = new Date(item.window.end);
      const windowHours =
        (windowEnd.valueOf() - windowStart.valueOf()) / 1000 / 60 / 60;

      if (windowHours >= 24) {
        bar.key = dateFormatter.format(bar.start);
      } else {
        bar.key = timeFormatter.format(bar.start);
      }

      bar.items[item[aggToKeyMapExternalCosts[aggregateBy]] || "Unallocated"] =
        getItemCost(item);
    });

    return bar;
  }

  const getDataForDay = (dayData) => {
    const { end, start } = dayData.window;
    const copy = [...dayData.customCosts];

    const sortedItems = copy.slice().sort((a, b) => {
      return a.cost > b.cost ? -1 : 1;
    });
    const top8 = sortedItems.slice(0, 8);

    return { end, start, graph: top8 };
  };

  const getDataForGraph = (dataPoints) => {
    const orderedDataPoints = dataPoints.map(getDataForDay);
    const bars = orderedDataPoints.map(toBar);

    const keyToFill = {};
    // we want to keep track of the order of fill assignment
    const assignmentOrder = [];
    let p = 0;

    orderedDataPoints.forEach(({ graph, start, end }) => {
      graph.forEach((item) => {
        const key =
          item[aggToKeyMapExternalCosts[aggregateBy]] || "Unallocated";
        if (keyToFill[key] === undefined) {
          assignmentOrder.push(key);
          keyToFill[key] = accents[p];
          p = (p + 1) % accents.length;
        }
      });
    });

    const labels = assignmentOrder.map((dataKey) => ({
      dataKey,
      fill: keyToFill[dataKey],
    }));

    return { bars, labels, keyToFill };
  };

  const {
    bars: barData,
    labels: barLabels,
    keyToFill,
  } = getDataForGraph(data.timeseries);

  const CustomTooltip = (params) => {
    const { active, payload } = params;

    if (!payload || payload.length == 0) {
      return null;
    }
    // come back and address issue with non-unique key names
    const total = payload.reduce((sum, item) => sum + item.value, 0.0);
    if (active) {
      return (
        <div
          style={{
            borderRadius: 2,
            background: "rgba(255, 255, 255, 0.95)",
            padding: 12,
          }}
        >
          <p
            style={{
              fontSize: "1rem",
              margin: 0,
              marginBottom: 4,
              padding: 0,
              color: "#000000",
            }}
          >{`Total: ${toCurrency(total, currency)}`}</p>

          {payload
            .slice()
            .map((item, i) => (
              <div
                key={i}
                style={{
                  display: "grid",
                  gridTemplateColumns: "20px 1fr",
                  gap: ".5em",
                  margin: ".25em",
                }}
              >
                <div>
                  <div
                    style={{
                      backgroundColor: keyToFill[item.payload.items[i][0]],
                      width: 18,
                      height: 18,
                    }}
                  />
                </div>
                <div>
                  <p
                    style={{
                      fontSize: "1rem",
                      margin: 0,
                      marginBottom: 4,
                      padding: 0,
                    }}
                  >{`${
                    item.payload.items[i][0]
                  }: ${toCurrency(item.value, currency)}`}</p>
                </div>
              </div>
            ))
            .reverse()}
        </div>
      );
    }

    return null;
  };

  const orderedBars = barData.map((bar) => {
    return {
      ...bar,
      items: Object.entries(bar.items).sort((a, b) => (a[1] > b[1] ? -1 : 1)),
    };
  });

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={orderedBars}
        margin={{ top: 30, right: 35, left: 30, bottom: 45 }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="key" />
        <YAxis tickFormatter={(val) => toCurrency(val, currency, 2, true)} />
        <Tooltip content={<CustomTooltip />} wrapperStyle={{ zIndex: 1000 }} />

        {new Array(10).fill(0).map((item, idx) => (
          <Bar
            key={idx}
            dataKey={(entry) => (entry.items[idx] ? entry.items[idx][1] : null)}
            stackId="x"
          >
            {orderedBars.map((bar, barIdx) =>
              bar.items[idx] ? (
                <Cell key={barIdx} fill={keyToFill[bar.items[idx][0]]} />
              ) : (
                <Cell key={barIdx} />
              ),
            )}
          </Bar>
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
};

export default RangeChart;
