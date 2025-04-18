import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/authContext";
import EditName from "../components/userProfileComponents/editName";
import UpdateProfilePicture from "../components/userProfileComponents/updateProfilePicture";
import ChangePassword from "../components/auth/changePassword";
import DashboardLayout from "../components/dashboard/DashboardLayout"; // Adjust path if needed

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const ProfileSettings = () => {
  const { user, setUser } = useAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/auth/profile`, {
          withCredentials: true,
        });
        setUserData(res.data?.user || res.data);
      } catch (err) {
        console.error("❌ Error fetching profile data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center py-10 text-gray-600 text-lg">Loading Profile...</div>
      </DashboardLayout>
    );
  }

  if (!userData) {
    return (
      <DashboardLayout>
        <div className="text-center py-10 text-red-600 text-lg">
          Failed to load profile. Please try again later.
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
  <div className="max-w-5xl mx-auto p-6 sm:p-8">
    <h1 className="text-3xl font-bold mb-8 text-[#1E293B]">Profile Settings</h1>

    {/* Profile Info Card */}
    <div className="bg-white rounded-lg shadow p-6 mb-8 border border-gray-100">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">👤 Profile Information</h2>
      <div className="grid sm:grid-cols-2 gap-4 text-gray-700">
        <div>
          <span className="font-medium">Name:</span> {userData.name}
        </div>
        <div>
          <span className="font-medium">Email:</span> {userData.email}
        </div>
        <div>
          <span className="font-medium">Role:</span> {userData.role}
        </div>
        <div>
          <span className="font-medium">Member Since:</span>{" "}
          {new Date(userData.createdAt).toLocaleDateString()}
        </div>
      </div>
    </div>

    {/* Profile Picture Card */}
    <div className="bg-white rounded-lg shadow p-6 mb-8 border border-gray-100">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">📷 Update Profile Picture</h2>
      <UpdateProfilePicture
        user={userData}
        setUserData={setUserData}
        setUser={setUser}
      />
    </div>

    {/* Edit Name */}
    <div className="bg-white rounded-lg shadow p-6 mb-8 border border-gray-100">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">✏️ Edit Name</h2>
      <EditName
        user={userData}
        setUserData={setUserData}
        setUser={setUser}
      />
    </div>

    {/* Change Password */}
    <div className="bg-white rounded-lg shadow p-6 border border-gray-100">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">🔐 Change Password</h2>
      <ChangePassword />
    </div>
  </div>
</DashboardLayout>
  );
};

export default ProfileSettings;
