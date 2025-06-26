import LightweightChart from './LightweightChart';

const BlogsBarChart = ({ data }) => {
  // Transform data to match our lightweight chart format
  const chartData = data?.map(item => ({
    label: item.month,
    value: item.blogs
  })) || [];

  return (
    <LightweightChart
      data={chartData}
      type="bar"
      title="🗓️ Blogs Created per Month"
      color="#E7000B"
    />
  );
};

export default BlogsBarChart;
