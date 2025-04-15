// src/components/analytics/HighlightCard.jsx
const HighlightCard = ({ title, subtext, label }) => {
    return (
      <div className="bg-white shadow rounded-2xl p-5 w-full md:w-1/2 border-l-4 border-yellow-500">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">{label}</h2>
        <p className="text-gray-700 font-medium">{title || "N/A"}</p>
        {subtext && <p className="text-sm text-gray-500 mt-1">{subtext}</p>}
      </div>
    );
  };
  
  export default HighlightCard;
  