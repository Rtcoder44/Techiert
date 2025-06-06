import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { resetCart, initializeCart } from "../redux/slices/cartSlice";

const AuthContext = createContext();
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL


export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  // ✅ Fetch authenticated user from API
  const fetchUser = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/auth/me`, {
        withCredentials: true, // ✅ Ensures cookies are sent
      });
      setUser(response.data.data);
    } catch (error) {
      setUser(null);
      dispatch(initializeCart());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser(); // ✅ Always fetch user on app load
  }, []);

  // ✅ Updated Login Function
  const login = async (credentials) => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${API_BASE_URL}/api/auth/login`,
        credentials,
        { withCredentials: true }
      );

      setUser(response.data.user); // ✅ Update user immediately
    } catch (error) {
      console.error("❌ Login failed:", error.response?.data?.error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Updated Logout Function
  const logout = async () => {
    try {
      setLoading(true);
      await axios.post(`${API_BASE_URL}/api/auth/logout`, {}, { withCredentials: true });
      setUser(null); // ✅ Remove user on logout
      dispatch(resetCart()); // Reset cart state
      dispatch(initializeCart()); // Initialize guest cart
    } catch (error) {
      console.error("❌ Logout failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
