import { BarChart } from '@mui/x-charts/BarChart';
import { useTheme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';
import { toCurrency } from '../../../util';

const AssetsChart = ({ assetData = [], currency = 'USD', height = 300, n = 10 }) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  if (!assetData || assetData.length === 0) {
    return null;
  }

  // Sort by totalCost and take top n
  const sortedData = [...assetData]
    .sort((a, b) => (b.totalCost || 0) - (a.totalCost || 0))
    .slice(0, n);

  const chartData = sortedData.map((item) => ({
    name: item.name || 'Unknown',
    cpuCost: item.cpuCost || 0,
    ramCost: item.ramCost || 0,
    gpuCost: item.gpuCost || 0,
  }));

  const series = [
    { dataKey: 'cpuCost', label: 'CPU', color: theme.palette.primary.main },
    { dataKey: 'ramCost', label: 'RAM', color: theme.palette.secondary.main },
    { dataKey: 'gpuCost', label: 'GPU', color: theme.palette.success.main },
  ];

  const valueFormatter = (value) => toCurrency(value, currency, true);

  return (
    <BarChart
      dataset={chartData}
      series={series}
      height={height}
      margin={{
        top: 20,
        right: 30,
        left: 20,
        bottom: isSmallScreen ? 80 : 60,
      }}
      grid={{ horizontal: true }}
      xAxis={[
        {
          dataKey: 'name',
          scaleType: 'band',
          tickLabelStyle: {
            angle: isSmallScreen ? -45 : 0,
            textAnchor: isSmallScreen ? 'end' : 'middle',
            fontSize: 12,
          },
        },
      ]}
      yAxis={[
        {
          tickLabelStyle: { fontSize: 12 },
          valueFormatter,
        },
      ]}
      slotProps={{
        legend: {
          hidden: false,
          position: { vertical: 'top', horizontal: 'right' },
        },
        tooltip: {
          trigger: 'item',
          formatter: (item) => ({
            ...item,
            label: `${item.seriesId}: ${toCurrency(item.value, currency)}`,
          }),
        },
      }}
    />
  );
};

export default AssetsChart;
