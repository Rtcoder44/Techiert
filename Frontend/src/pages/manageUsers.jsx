import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../components/dashboard/dashboardLayout";

const USERS_PER_PAGE = 10;

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [selectedRole, setSelectedRole] = useState({});
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { user } = useAuth();

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const protectedEmail = import.meta.env.VITE_PROTECTED_EMAIL;

  const fetchUsers = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/auth/users?page=${currentPage}&limit=${USERS_PER_PAGE}&search=${search}&role=${roleFilter}`,
        { withCredentials: true }
      );
      setUsers(res.data.users || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error("Error fetching users:", err);
      toast.error("Failed to fetch users.");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search, currentPage, roleFilter]);

  const handleRoleChange = async (id, newRole) => {
    setUsers((prev) =>
      prev.map((u) => (u._id === id ? { ...u, role: newRole } : u))
    );
    try {
      await axios.put(
        `${API_BASE_URL}/api/auth/users/${id}`,
        { role: newRole },
        { withCredentials: true }
      );
      toast.success("User role updated.");
    } catch (err) {
      toast.error("Failed to update role.");
      console.error(err);
    }
  };

  const handleDelete = async (id, email) => {
    if (email === protectedEmail) {
      toast.error("This user is protected and cannot be deleted.");
      return;
    }
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/auth/users/${id}`, {
        withCredentials: true,
      });
      toast.success("User deleted.");
      fetchUsers();
    } catch (err) {
      toast.error("Failed to delete user.");
      console.error(err);
    }
  };

  const exportToCSV = () => {
    const headers = ["Name", "Email", "Role"];
    const rows = users.map((u) => [u.name, u.email, u.role]);
    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "users.csv";
    link.click();
  };

  return (
    <DashboardLayout>
      <div className="p-6 text-slate-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold">👥 Manage Users</h2>
          <button
            onClick={exportToCSV}
            className="bg-green-600 hover:bg-green-700 text-white text-xs px-4 py-2 rounded transition"
          >
            Export to CSV
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <input
            type="text"
            placeholder="Search by name or email"
            className="p-2 rounded bg-slate-900 border border-slate-600 text-white w-full sm:w-[50%]"
            value={search}
            onChange={(e) => {
              setCurrentPage(1);
              setSearch(e.target.value);
            }}
          />

          <select
            className="p-2 rounded bg-slate-900 border border-slate-600 text-white"
            value={roleFilter}
            onChange={(e) => {
              setCurrentPage(1);
              setRoleFilter(e.target.value);
            }}
          >
            <option value="">All Roles</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div className="overflow-x-auto bg-slate-800 shadow-lg rounded-xl">
          <table className="w-full min-w-[700px] text-sm text-left">
            <thead className="bg-slate-700 text-slate-300 uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-4">Avatar</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map((u) => {
                  const disableRole =
                    u._id === user._id ||
                    (u.email === protectedEmail && user.email !== protectedEmail);
                  const disableDelete =
                    u._id === user._id || u.email === protectedEmail;

                  return (
                    <tr key={u._id} className="border-t border-slate-700 hover:bg-slate-700 transition">
                      <td className="px-6 py-4">
                        <img
                          src={u.avatar?.url || u.avatar || "/default-avatar.png"}
                          alt="avatar"
                          className="w-10 h-10 rounded-full object-cover border"
                          loading="lazy"
                        />
                      </td>
                      <td className="px-6 py-4">{u.name}</td>
                      <td className="px-6 py-4 text-slate-300">{u.email}</td>
                      <td className="px-6 py-4">
                        <select
                          value={selectedRole[u._id] || u.role}
                          onChange={(e) => {
                            const newRole = e.target.value;
                            setSelectedRole((prev) => ({
                              ...prev,
                              [u._id]: newRole,
                            }));
                            handleRoleChange(u._id, newRole);
                          }}
                          disabled={disableRole}
                          title={disableRole ? "You cannot change this role" : ""}
                          className="bg-slate-900 border border-slate-600 text-slate-100 rounded px-3 py-1 focus:outline-none focus:ring focus:ring-red-500"
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        {!disableDelete ? (
                          <button
                            onClick={() => handleDelete(u._id, u.email)}
                            className="bg-[#E7000B] hover:bg-red-700 text-white text-xs px-4 py-2 rounded transition"
                          >
                            Delete
                          </button>
                        ) : (
                          <span
                            className="italic text-slate-400 cursor-not-allowed"
                            title="You cannot delete this user"
                          >
                            {u._id === user._id ? "Self" : "Protected"}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <SkeletonRows />
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-4 flex justify-center gap-2">
          {Array.from({ length: totalPages }).map((_, idx) => (
            <button
              key={idx}
              className={`px-3 py-1 rounded ${
                currentPage === idx + 1 ? "bg-red-600" : "bg-slate-700"
              } text-white text-xs`}
              onClick={() => setCurrentPage(idx + 1)}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

const SkeletonRows = () => {
  return Array(5)
    .fill(0)
    .map((_, i) => (
      <tr key={i} className="border-t border-slate-700 animate-pulse">
        <td className="px-6 py-4">
          <div className="w-10 h-10 bg-slate-600 rounded-full" />
        </td>
        <td className="px-6 py-4">
          <div className="h-4 bg-slate-600 rounded w-24" />
        </td>
        <td className="px-6 py-4">
          <div className="h-4 bg-slate-600 rounded w-40" />
        </td>
        <td className="px-6 py-4">
          <div className="h-8 bg-slate-600 rounded w-24" />
        </td>
        <td className="px-6 py-4">
          <div className="h-8 bg-slate-600 rounded w-16" />
        </td>
      </tr>
    ));
};

export default ManageUsers;
