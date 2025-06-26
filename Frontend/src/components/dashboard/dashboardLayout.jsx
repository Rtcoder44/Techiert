import React, { useState } from "react";
import DashboardSidebar from "./dashboardSidebar";
import DashboardNavbar from "./dashboardNavbar";
import Footer from "./footer";
import { useAuth } from "../../context/authContext";

const DashboardLayout = ({ children }) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  // Toggle Sidebar
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Sidebar */}
      <DashboardSidebar isOpen={isOpen} toggleSidebar={toggleSidebar} />

      {/* Main Content */}
      <div
        className="flex flex-col min-h-screen"
      >
        {/* Navbar */}
        <DashboardNavbar isOpen={isOpen} toggleSidebar={toggleSidebar} />

        {/* Main Content Area */}
        <main className="flex-1 px-4 py-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
};

export default DashboardLayout;
