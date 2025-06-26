import LightweightChart from './LightweightChart';

const ViewsChart = ({ data }) => {
  // Transform data to match our lightweight chart format
  const chartData = data?.map(item => ({
    label: item.date,
    value: item.views
  })) || [];

  return (
    <LightweightChart
      data={chartData}
      type="line"
      title="📆 Views (Last 7 Days)"
      color="#E7000B"
    />
  );
};

export default ViewsChart;
