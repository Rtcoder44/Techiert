import { useState, useEffect } from "react";
import { FaTrash, FaEdit, FaBars } from "react-icons/fa";
import axios from "axios";
import DashboardSidebar from "../components/dashboard/dashboardSidebar";
import { useAuth } from "../context/authContext"; // ✅ Import Auth Context

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const manageCategoryPage = () => {
    const [categories, setCategories] = useState([]); 
    const [name, setName] = useState("");
    const [editingCategory, setEditingCategory] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [loading, setLoading] = useState(false);

    const { user } = useAuth(); // ✅ Get logged-in user
    const isAdmin = user?.role === "admin"; // ✅ Check if user is admin

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get(`${API_BASE_URL}/api/categories`, { withCredentials: true });
            console.log("Fetched categories:", data);
            setCategories(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error fetching categories:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isAdmin) return alert("Unauthorized: Only admins can manage categories!");

        try {
            if (editingCategory) {
                await axios.put(`${API_BASE_URL}/api/categories/${editingCategory._id}`, 
                    { name }, { withCredentials: true }
                );
            } else {
                await axios.post(`${API_BASE_URL}/api/categories`, 
                    { name }, { withCredentials: true }
                );
            }
            setName("");
            setEditingCategory(null);
            fetchCategories();
        } catch (error) {
            console.error("Error saving category:", error.response?.data?.error);
        }
    };

    const handleDelete = async (id) => {
        if (!isAdmin) return alert("Unauthorized: Only admins can delete categories!");
        if (!window.confirm("Are you sure you want to delete this category?")) return;

        try {
            await axios.delete(`${API_BASE_URL}/api/categories/${id}`, { withCredentials: true });
            fetchCategories();
        } catch (error) {
            console.error("Error deleting category:", error.response?.data?.error);
        }
    };

    return (
        <div className="flex bg-[#F1F5F9] min-h-screen">
            {/* ✅ Sidebar */}
            <DashboardSidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

            {/* ✅ Sidebar Toggle Button */}
            {!isSidebarOpen && (
                <button
                    className="absolute top-4 left-6 bg-[#1E293B] text-white p-3 rounded-full shadow-md hover:bg-red-700 transition"
                    onClick={() => setIsSidebarOpen(true)}
                >
                    <FaBars className="text-xl" />
                </button>
            )}

            {/* ✅ Main Content */}
            <div className={`flex-1 p-6 transition-all ${isSidebarOpen ? "ml-64" : "ml-0"}`}>
                <h1 className="text-2xl ml-14 font-bold text-[#1E293B]">Manage Categories</h1>

                {/* ✅ Category Form */}
                {isAdmin ? (
                    <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow-md mt-10">
                        <input
                            type="text"
                            className="border p-2 w-full rounded-md text-[#1E293B]"
                            placeholder="Category Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                        <button type="submit" className="bg-[#E7000B] text-white px-4 py-2 mt-2 rounded-md hover:bg-red-700 transition">
                            {editingCategory ? "Update" : "Create"}
                        </button>
                    </form>
                ) : (
                    <p className="text-red-600 mt-4">❌ You are not authorized to manage categories!</p>
                )}

                {/* ✅ Category List */}
                <div className="bg-white p-4 rounded-lg shadow-md mt-4">
                    <h2 className="text-xl font-semibold mb-2 text-[#1E293B]">Categories</h2>

                    {loading ? (
                        <p className="text-center text-gray-500">Loading categories...</p>
                    ) : (
                        <table className="w-full border-collapse text-left">
    <thead>
        <tr className="bg-gray-200 text-[#1E293B] text-center">
            <th className="p-3">Name</th>
            <th className="p-3">Actions</th>
        </tr>
    </thead>
    <tbody>
        {categories.length > 0 ? (
            categories.map((category) => (
                <tr key={category._id} className="border-b text-[#1E293B] text-center">
                    <td className="p-3">{category.name}</td>
                    <td className="p-3 flex items-center justify-center gap-2">
                        {isAdmin && (
                            <>
                                <button
                                    onClick={() => {
                                        setEditingCategory(category);
                                        setName(category.name);
                                    }}
                                    className="text-blue-600 hover:underline"
                                >
                                    <FaEdit />
                                </button>
                                <button
                                    onClick={() => handleDelete(category._id)}
                                    className="text-red-600 hover:underline"
                                >
                                    <FaTrash />
                                </button>
                            </>
                        )}
                    </td>
                </tr>
            ))
        ) : (
            <tr>
                <td colSpan="2" className="p-3 text-center text-gray-500">No categories found</td>
            </tr>
        )}
    </tbody>
</table>

                    )}
                </div>
            </div>
        </div>
    );
};

export default manageCategoryPage;
