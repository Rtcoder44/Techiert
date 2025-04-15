// src/components/analytics/SummaryCard.jsx
const SummaryCard = ({ label, value, color = "border-blue-500" }) => {
    return (
      <div className={`bg-white border-l-4 ${color} shadow rounded-2xl p-4 w-full sm:w-1/2 lg:w-1/4`}>
        <h2 className="text-sm text-gray-500">{label}</h2>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
    );
  };
  
  export default SummaryCard;
  