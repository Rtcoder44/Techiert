import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import DashboardSidebar from "../components/dashboard/dashboardSidebar";
import ProductFilters from "../components/manageProduct/productFilters";
import ProductEditModal from "../components/manageProduct/productEditModal";
import { FaBars } from "react-icons/fa";
import { useAuth } from "../context/authContext";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const debounce = (func, delay) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
};

const ManageProduct = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [productsData, setProductsData] = useState({
    products: [],
    totalProducts: 0,
    currentPage: 1,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [filters, setFilters] = useState({
    search: "",
    category: "",
    sort: "latest",
    stock: "all",
    page: 1,
    limit: 10,
  });

  // Fetch products with debounced call
  const fetchProducts = useCallback(
    debounce(async (filters) => {
      setLoading(true);
      try {
        const { data } = await axios.get(`${API_BASE_URL}/api/products`, {
          params: filters,
          withCredentials: true,
        });

        if (data && Array.isArray(data.products)) {
          setProductsData({
            products: data.products,
            totalProducts: data.totalProducts || 0,
            currentPage: data.currentPage || 1,
            totalPages: data.totalPages || 1,
          });
          setError(null);
        } else {
          setProductsData({
            products: [],
            totalProducts: 0,
            currentPage: 1,
            totalPages: 1,
          });
          setError("No products found.");
        }
      } catch {
        setError("Failed to load products. Please try again.");
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    fetchProducts(filters);
  }, [filters, fetchProducts]);

  const handlePreviousPage = () => {
    if (filters.page > 1) {
      setFilters((prev) => ({ ...prev, page: prev.page - 1 }));
    }
  };

  const handleNextPage = () => {
    if (filters.page < productsData.totalPages) {
      setFilters((prev) => ({ ...prev, page: prev.page + 1 }));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      await axios.delete(`${API_BASE_URL}/api/products/${id}`, {
        withCredentials: true,
      });
      // Refetch products after delete
      fetchProducts(filters);
    } catch {
      alert("Failed to delete product.");
    }
  };

  const handleUpdate = async (product) => {
    try {
      // fetch full product details before opening modal
      const { data } = await axios.get(`${API_BASE_URL}/api/products/${product._id}`);
      const full = data?.product || product;
      setSelectedProduct(full);
    } catch (e) {
      // fallback to existing product if fetch fails
      setSelectedProduct(product);
    }
  };

  const handleCloseModal = () => {
    setSelectedProduct(null);
  };

  const handleProductUpdate = () => {
    fetchProducts(filters);
    setSelectedProduct(null);
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#F1F5F9]">
        <p className="text-xl">Loading...</p>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="flex justify-center items-center h-screen bg-[#F1F5F9]">
        <p className="text-xl text-red-600 font-semibold">🚫 Access Denied: Admins only.</p>
      </div>
    );
  }

  return (
    <div className="flex">
      <DashboardSidebar
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {selectedProduct && (
        <ProductEditModal
          product={selectedProduct}
          onClose={handleCloseModal}
          onUpdate={handleProductUpdate}
        />
      )}

      {!isSidebarOpen && (
        <button
          className="absolute top-5 left-6 bg-[#1E293B] text-white p-3 rounded-full shadow-md hover:bg-red-700 transition"
          onClick={() => setIsSidebarOpen(true)}
        >
          <FaBars className="text-xl" />
        </button>
      )}

      <div
        className={`flex-1 p-6 bg-[#F1F5F9] min-h-screen transition-all duration-300 ${
          isSidebarOpen ? "ml-64" : "ml-0"
        }`}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-[#1E293B]">Manage Products</h1>
            <button
              onClick={() => navigate("/dashboard/add-product")}
              className="px-6 py-2 bg-[#E7000B] text-white rounded-lg hover:bg-red-700 transition"
            >
              Add New Product
            </button>
          </div>

          <ProductFilters filters={filters} setFilters={setFilters} />

          {error ? (
            <div className="text-center py-8">
              <p className="text-red-600">{error}</p>
              <button
                onClick={() => fetchProducts(filters)}
                className="mt-4 px-4 py-2 bg-[#1E293B] text-white rounded hover:bg-gray-800"
              >
                Try Again
              </button>
            </div>
          ) : loading ? (
            <div className="text-center py-8">
              <p>Loading products...</p>
            </div>
          ) : productsData.products.length === 0 ? (
            <p className="text-center py-8">No products available</p>
          ) : (
            <table className="w-full border-collapse bg-white shadow-md rounded-md overflow-hidden">
              <thead className="bg-gray-200">
                <tr>
                  <th className="border px-4 py-2 text-left">Image</th>
                  <th className="border px-4 py-2 text-left">Title</th>
                  <th className="border px-4 py-2 text-left">Category</th>
                  <th className="border px-4 py-2 text-left">Price</th>
                  <th className="border px-4 py-2 text-left">Stock</th>
                  <th className="border px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {productsData.products.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50">
                    <td className="border px-4 py-2">
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={product.images[0].url}
                          alt={product.title}
                          className="h-12 w-12 object-cover rounded"
                        />
                      ) : (
                        <div className="h-12 w-12 bg-gray-300 rounded flex items-center justify-center text-gray-600">
                          N/A
                        </div>
                      )}
                    </td>
                    <td className="border px-4 py-2">{product.title}</td>
                    <td className="border px-4 py-2">{product.category?.name || "N/A"}</td>
                    <td className="border px-4 py-2">${product.price.toFixed(2)}</td>
                    <td className="border px-4 py-2">{product.stock}</td>
                    <td className="border px-4 py-2 space-x-2">
                      <button
                        onClick={() => handleUpdate(product)}
                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                      >
                        Update
                      </button>
                      <button
                        onClick={() => handleDelete(product._id)}
                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Pagination */}
          <div className="flex justify-center gap-4 mt-6">
            <button
              disabled={filters.page <= 1}
              onClick={handlePreviousPage}
              className={`px-4 py-2 rounded ${
                filters.page <= 1
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              Previous
            </button>
            <span className="flex items-center">
              Page {filters.page} of {productsData.totalPages}
            </span>
            <button
              disabled={filters.page >= productsData.totalPages}
              onClick={handleNextPage}
              className={`px-4 py-2 rounded ${
                filters.page >= productsData.totalPages
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageProduct;
