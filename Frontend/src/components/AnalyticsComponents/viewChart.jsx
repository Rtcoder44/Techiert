import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const ViewsChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-4 rounded-2xl shadow-md">
        <h3 className="text-lg font-semibold mb-2">📆 Views (Last 7 Days)</h3>
        <p className="text-center text-gray-500">No data available</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-2xl shadow-md">
      <h3 className="text-lg font-semibold mb-2">📆 Views (Last 7 Days)</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="views" stroke="#E7000B" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ViewsChart;
