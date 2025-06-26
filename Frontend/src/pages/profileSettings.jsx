import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/authContext";
import EditName from "../components/userProfileComponents/editName";
import UpdateProfilePicture from "../components/userProfileComponents/updateProfilePicture";
import ChangePassword from "../components/auth/changePassword";
import DashboardLayout from "../components/dashboard/dashboardLayout";
import { 
  FaEdit, 
  FaTrash, 
  FaPlus, 
  FaMapMarkerAlt, 
  FaCog, 
  FaUser, 
  FaTimes,
  FaCamera,
  FaExclamationCircle,
  FaLock
} from "react-icons/fa";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const AddressForm = ({ onSubmit, onCancel, initialData = null }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    phoneNumber: initialData?.phoneNumber || '',
    addressLine1: initialData?.addressLine1 || '',
    addressLine2: initialData?.addressLine2 || '',
    city: initialData?.city || '',
    state: initialData?.state || '',
    postalCode: initialData?.postalCode || '',
    country: initialData?.country || 'India',
    isDefault: initialData?.isDefault || false
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Full Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Phone Number</label>
          <input
            type="tel"
            value={formData.phoneNumber}
            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Address Line 1</label>
        <input
          type="text"
          value={formData.addressLine1}
          onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Address Line 2 (Optional)</label>
        <input
          type="text"
          value={formData.addressLine2}
          onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">City</label>
          <input
            type="text"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">State</label>
          <input
            type="text"
            value={formData.state}
            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Postal Code</label>
          <input
            type="text"
            value={formData.postalCode}
            onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Country</label>
        <input
          type="text"
          value={formData.country}
          onChange={(e) => setFormData({ ...formData, country: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="isDefault"
          checked={formData.isDefault}
          onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="isDefault" className="ml-2 block text-sm text-gray-700">
          Set as default address
        </label>
      </div>

      <div className="flex justify-end space-x-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {initialData ? 'Update Address' : 'Add Address'}
        </button>
      </div>
    </form>
  );
};

const ProfileSettings = () => {
  const { user, setUser } = useAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addresses, setAddresses] = useState([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressError, setAddressError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, addressesRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/auth/profile`, { withCredentials: true }),
          axios.get(`${API_BASE_URL}/api/addresses`, { withCredentials: true })
        ]);
        
        setUserData(profileRes.data?.user || profileRes.data);
        setAddresses(addressesRes.data?.addresses || []);
        setAddressError(null);
      } catch (err) {
        console.error("Error fetching data:", err);
        setAddressError(err.response?.data?.message || "Failed to load addresses");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAddAddress = async (addressData) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/addresses`,
        addressData,
        { withCredentials: true }
      );
      
      setAddresses(prev => [...prev, response.data.address]);
      setShowAddressForm(false);
      setAddressError(null);
    } catch (err) {
      console.error("Error adding address:", err);
      setAddressError("Failed to add address");
    }
  };

  const handleUpdateAddress = async (addressId, addressData) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/addresses/${addressId}`,
        addressData,
        { withCredentials: true }
      );
      
      setAddresses(prev => 
        prev.map(addr => addr._id === addressId ? response.data.address : addr)
      );
      setEditingAddress(null);
      setAddressError(null);
    } catch (err) {
      console.error("Error updating address:", err);
      setAddressError("Failed to update address");
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm("Are you sure you want to delete this address?")) return;

    try {
      await axios({
        method: 'DELETE',
        url: `${API_BASE_URL}/api/addresses/${addressId}`,
        withCredentials: true,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      setAddresses(prev => prev.filter(addr => addr._id !== addressId));
      setAddressError(null);
    } catch (err) {
      console.error("Error deleting address:", err);
      setAddressError(err.response?.data?.message || "Failed to delete address");
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
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
      <div className="max-w-5xl mx-auto p-6 sm:p-8 space-y-6">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-[#1E293B] to-[#334155] text-white rounded-xl p-6 shadow-lg">
          <h1 className="text-3xl font-bold flex items-center">
            <FaCog className="mr-3" /> Profile Settings
          </h1>
          <p className="mt-2 text-gray-200">Manage your account settings and preferences</p>
        </div>

        {/* Profile Info Card */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-all duration-300">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
            <FaUser className="mr-2 text-blue-600" /> Profile Information
          </h2>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <span className="text-sm text-gray-500">Name</span>
              <p className="text-gray-900 font-medium mt-1">{userData.name}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <span className="text-sm text-gray-500">Email</span>
              <p className="text-gray-900 font-medium mt-1">{userData.email}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <span className="text-sm text-gray-500">Role</span>
              <p className="mt-1">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  {userData.role}
                </span>
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <span className="text-sm text-gray-500">Member Since</span>
              <p className="text-gray-900 font-medium mt-1">
                {new Date(userData.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Profile Picture Section */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-all duration-300">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
            <FaCamera className="mr-2 text-blue-600" /> Profile Picture
          </h2>
          <UpdateProfilePicture
            user={userData}
            setUserData={setUserData}
            setUser={setUser}
          />
        </div>

        {/* Edit Name Section */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-all duration-300">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
            <FaEdit className="mr-2 text-blue-600" /> Edit Name
          </h2>
          <EditName
            user={userData}
            setUserData={setUserData}
            setUser={setUser}
          />
        </div>

        {/* Addresses Section */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-all duration-300">
          <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center">
              <FaMapMarkerAlt className="mr-2 text-blue-600" /> Manage Addresses
            </h2>
            <button
              onClick={() => setShowAddressForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <FaPlus /> Add New Address
            </button>
          </div>

          {addressError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-lg flex items-center">
              <FaExclamationCircle className="mr-2" /> {addressError}
              <button 
                onClick={() => setAddressError(null)}
                className="ml-auto text-red-400 hover:text-red-600"
              >
                <FaTimes />
              </button>
            </div>
          )}

          {showAddressForm && (
            <div className="mb-6 p-6 bg-gray-50 rounded-xl border border-gray-200">
              <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                <FaPlus className="mr-2 text-blue-600" /> Add New Address
              </h3>
              <AddressForm
                onSubmit={handleAddAddress}
                onCancel={() => setShowAddressForm(false)}
              />
            </div>
          )}

          <div className="grid gap-6 sm:grid-cols-2">
            {addresses.map((address) => (
              <div
                key={address._id}
                className="border rounded-xl p-5 relative bg-white hover:shadow-md transition-all duration-200"
              >
                {editingAddress === address._id ? (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <AddressForm
                      initialData={{
                        name: address.fullName,
                        phoneNumber: address.phone,
                        addressLine1: address.addressLine1,
                        addressLine2: address.addressLine2,
                        city: address.city,
                        state: address.state,
                        postalCode: address.postalCode,
                        country: address.country,
                        isDefault: address.isDefault
                      }}
                      onSubmit={(data) => handleUpdateAddress(address._id, data)}
                      onCancel={() => setEditingAddress(null)}
                    />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-800 flex items-center gap-2">
                          {address.fullName}
                          {address.isDefault && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                              Default
                            </span>
                          )}
                        </h3>
                        <p className="text-gray-600 mt-1">{address.phone}</p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setEditingAddress(address._id)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit Address"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDeleteAddress(address._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Address"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                    <div className="text-gray-600 space-y-1">
                      <p>{address.addressLine1}</p>
                      {address.addressLine2 && <p>{address.addressLine2}</p>}
                      <p>{address.city}, {address.state} {address.postalCode}</p>
                      <p>{address.country}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Change Password Section */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-all duration-300">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
            <FaLock className="mr-2 text-blue-600" /> Change Password
          </h2>
          <ChangePassword />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProfileSettings;
