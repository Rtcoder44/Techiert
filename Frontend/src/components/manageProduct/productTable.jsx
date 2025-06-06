import React, { useState, memo, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../../context/authContext";
import ProductEditModal from "./productEditModal";
import { FaEdit, FaTrash } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { showNotification, showAuthError, showErrorMessage } from '../../utils/notification';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Memoized table row component for better performance
const ProductRow = memo(({ product, onDelete, onEdit, isDeleting, user }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  return (
    <motion.tr
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="border bg-white hover:bg-gray-50 transition-all duration-300"
    >
      <td className="border p-4">
        {product.images && product.images.length > 0 ? (
          <div className="relative group">
            <img
              src={product.images[0].thumbnail || product.images[0].url}
              alt={product.title}
              className="w-20 h-20 object-cover rounded-lg shadow-sm transform transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
            {product.images.length > 1 && (
              <span className="absolute bottom-1 right-1 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded-full">
                +{product.images.length - 1}
              </span>
            )}
          </div>
        ) : (
          <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
            <span className="text-gray-400">No Image</span>
          </div>
        )}
      </td>
      <td className="border p-4">
        <div className="space-y-1">
          <h3 className="font-medium text-gray-900 truncate max-w-[200px]">{product.title}</h3>
          <p className="text-sm text-gray-500 truncate max-w-[200px]">{product.description}</p>
        </div>
      </td>
      <td className="border p-4">
        <span className="font-medium text-gray-900">{formatPrice(product.price)}</span>
      </td>
      <td className="border p-4">
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
          product.stock > 10 ? 'bg-green-100 text-green-800' :
          product.stock > 0 ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {product.stock}
        </span>
      </td>
      <td className="border p-4">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
          {product.category}
        </span>
      </td>
      <td className="border p-4">
        <div className="flex justify-center gap-3">
          <button
            onClick={() => onEdit(product)}
            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full transition-colors duration-200"
            disabled={isDeleting}
            title="Edit Product"
          >
            <FaEdit size={18} />
          </button>
          {user?.role === "admin" && (
            <button
              onClick={() => onDelete(product._id)}
              className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full transition-colors duration-200"
              disabled={isDeleting}
              title="Delete Product"
            >
              {isDeleting ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-[18px] h-[18px] border-2 border-red-600 border-t-transparent rounded-full"
                />
              ) : (
                <FaTrash size={18} />
              )}
            </button>
          )}
        </div>
      </td>
    </motion.tr>
  );
});

const ProductTable = ({ products, setProducts, onRefresh }) => {
  const { user } = useAuth();
  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingProducts, setDeletingProducts] = useState(new Set());

  const productList = Array.isArray(products.products) ? products.products : [];

  const handleDelete = useCallback(async (id) => {
    if (!user || user.role !== "admin") {
      showAuthError("Only an admin can delete products!");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      setDeletingProducts(prev => new Set([...prev, id]));
      await axios.delete(`${API_BASE_URL}/api/products/${id}`, {
        withCredentials: true,
      });

      setProducts((prevProducts) => ({
        ...prevProducts,
        products: prevProducts.products.filter((product) => product._id !== id),
        totalProducts: prevProducts.totalProducts - 1
      }));

      if (onRefresh) onRefresh();
    } catch (error) {
      console.error("Error deleting product:", error);
      showErrorMessage(error);
    } finally {
      setDeletingProducts(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  }, [user, setProducts, onRefresh]);

  const handleEdit = useCallback((product) => {
    setEditingProduct(product);
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        {productList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <img
              src="/empty-products.svg"
              alt="No products"
              className="w-48 h-48 mb-4 opacity-50"
            />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No Products Found</h3>
            <p className="text-gray-500">Start by adding your first product</p>
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="border-b p-4 font-semibold text-gray-600">Image</th>
                <th className="border-b p-4 font-semibold text-gray-600">Details</th>
                <th className="border-b p-4 font-semibold text-gray-600">Price</th>
                <th className="border-b p-4 font-semibold text-gray-600">Stock</th>
                <th className="border-b p-4 font-semibold text-gray-600">Category</th>
                <th className="border-b p-4 font-semibold text-gray-600 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {productList.map((product) => (
                  <ProductRow
                    key={product._id}
                    product={product}
                    onDelete={handleDelete}
                    onEdit={handleEdit}
                    isDeleting={deletingProducts.has(product._id)}
                    user={user}
                  />
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        )}
      </div>

      {editingProduct && (
        <ProductEditModal
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onUpdate={() => {
            setEditingProduct(null);
            if (onRefresh) onRefresh();
          }}
        />
      )}
    </div>
  );
};

export default memo(ProductTable); 