import React, { useEffect } from "react";

const techCategories = [
  "Artificial Intelligence",
  "Web Development",
  "Cybersecurity",
  "Blockchain",
  "Cloud Computing",
  "Data Science",
  "Machine Learning",
  "Internet of Things",
  "Quantum Computing",
];

const CategoriesSelector = ({ selectedCategories, setSelectedCategories }) => {
  useEffect(() => {
    const savedCategories = JSON.parse(localStorage.getItem("draftCategories")) || [];
    if (savedCategories.length > 0) {
      setSelectedCategories(savedCategories);
    }
  }, []); // Runs only once when the component mounts

  useEffect(() => {
    if (selectedCategories?.length > 0) {
      localStorage.setItem("draftCategories", JSON.stringify(selectedCategories));
    }
  }, [selectedCategories]); // Updates storage whenever categories change

  const handleCategoryChange = (category) => {
    setSelectedCategories((prevCategories) =>
      prevCategories.includes(category)
        ? prevCategories.filter((cat) => cat !== category)
        : [...prevCategories, category]
    );
  };

  return (
    <div>
      <h3 className="font-semibold mb-2">Select Categories:</h3>
      <div className="space-y-2">
        {techCategories.map((category) => (
          <label key={category} className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={selectedCategories.includes(category)}
              onChange={() => handleCategoryChange(category)}
              className="w-5 h-5 text-blue-500"
            />
            <span>{category}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default CategoriesSelector;
