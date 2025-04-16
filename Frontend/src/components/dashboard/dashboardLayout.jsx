import React, { useState } from "react";
import DashboardSidebar from "./dashboardSidebar";
import DashboardNavbar from "./dashboardNavbar";
import Footer from "./footer"; // ✅ New Footer Import
import { useAuth } from "../../context/authContext";

const DashboardLayout = ({ children }) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  // Toggle Sidebar
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F1F5F9] transition-all duration-300">
      <div className="flex flex-1">
        {/* Sidebar (Only visible when user is logged in) */}
        {user && <DashboardSidebar isOpen={isOpen} toggleSidebar={toggleSidebar} />}

        {/* Main Layout */}
        <div className={`flex flex-col flex-1 transition-all duration-300 ${user && isOpen ? "ml-64" : "ml-0"}`}>
          <DashboardNavbar isOpen={isOpen} toggleSidebar={toggleSidebar} />
          <main className="flex-1 p-6 bg-[#F1F5F9]">{children}</main>
          <Footer /> {/* ✅ Footer placed here */}
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
