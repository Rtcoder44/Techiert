import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const BlogsBarChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-4 rounded-2xl shadow-md">
        <h3 className="text-lg font-semibold mb-2">🗓️ Blogs Created per Month</h3>
        <p className="text-center text-gray-500">No data available</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-2xl shadow-md">
      <h3 className="text-lg font-semibold mb-2">🗓️ Blogs Created per Month</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="blogs" fill="#E7000B" /> {/* Changed to a vibrant red color */}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BlogsBarChart;
