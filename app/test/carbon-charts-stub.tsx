/**
 * Stand-ins for @carbon/charts-react: jsdom has no layout engine, so the real
 * charts cannot render. Each stub records the props it was last given so tests
 * can assert on the data and options a widget passes, including formatters.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- tests reach into arbitrary chart option shapes
type ChartProps = { data: unknown[]; options: Record<string, any> };

export const lastProps: Record<string, ChartProps> = {};

function stub(name: string) {
  return function Chart(props: ChartProps) {
    lastProps[name] = props;
    return <div data-testid={name} data-points={props.data.length} />;
  };
}

export const StackedBarChart = stub("StackedBarChart");
export const SimpleBarChart = stub("SimpleBarChart");
export const GroupedBarChart = stub("GroupedBarChart");
export const LineChart = stub("LineChart");
export const StackedAreaChart = stub("StackedAreaChart");
