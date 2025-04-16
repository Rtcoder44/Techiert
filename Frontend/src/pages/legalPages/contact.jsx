import React, { useState } from "react";
import axios from "axios";
import DashboardLayout from "../../components/dashboard/dashboardLayout";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage("");
    setErrorMessage("");

    const { name, email, message } = formData;

    // Basic validation
    if (!name || !email || !message) {
      setLoading(false);
      setErrorMessage("All fields are required.");
      return;
    }

    if (!validateEmail(email)) {
      setLoading(false);
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/contact`, {
        name,
        email,
        message,
      });

      setLoading(false);
      setSuccessMessage(response.data.message || "Your message has been sent successfully!");
      setFormData({ name: "", email: "", message: "" });
    } catch (error) {
      setLoading(false);
      const errMsg =
        error?.response?.data?.error || "Something went wrong. Please try again later.";
      setErrorMessage(errMsg);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto px-4 py-10 text-gray-800">
        <h1 className="text-3xl font-bold text-center text-[#1E293B] mb-6">Contact Us</h1>

        <p className="text-center text-gray-600 mb-10">
          Have questions, suggestions, or feedback? We'd love to hear from you!
        </p>

        <form className="bg-white shadow-md rounded-lg p-6 space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-1 font-medium text-gray-700">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your Name"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block mb-1 font-medium text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Your Email"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block mb-1 font-medium text-gray-700">Message</label>
            <textarea
              rows="5"
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Write your message..."
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            ></textarea>
          </div>

          <div className="text-center">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-full transition duration-300"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Message"}
            </button>
          </div>
        </form>

        {successMessage && (
          <div className="mt-4 text-green-600 text-center">{successMessage}</div>
        )}

        {errorMessage && (
          <div className="mt-4 text-red-600 text-center">{errorMessage}</div>
        )}

        <div className="mt-12 text-sm text-center text-gray-600">
          Or contact us directly:
          <ul className="mt-2 space-y-1">
            <li>
              <strong>Email:</strong> techiertofficial@gmail.com
            </li>
            <li>
              <strong>Address:</strong> Village Bardiha, Post Jagdishpur Dharmadani, District Kushinagar, 274149
            </li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Contact;
