const FilterComponent = ({ filter, onFilterChange }) => (
  <div className="mb-4">
    <input
      type="text"
      value={filter}
      onChange={onFilterChange}
      placeholder="Filter by category"
      className="px-4 py-2 border border-gray-300 rounded-md placeholder-[#1E293B] text-[#1E293B]"
    />
  </div>
);

export default FilterComponent;
