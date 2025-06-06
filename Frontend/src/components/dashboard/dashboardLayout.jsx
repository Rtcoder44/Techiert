import React, { useState } from "react";
import DashboardSidebar from "./dashboardSidebar";
import DashboardNavbar from "./dashboardNavbar";
import Footer from "./footer";
import { useAuth } from "../../context/authContext";
import { motion, AnimatePresence } from "framer-motion";

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
      <motion.div
        className="flex flex-col min-h-screen"
        animate={{ 
          marginLeft: isOpen ? "256px" : "0" 
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {/* Navbar */}
        <DashboardNavbar isOpen={isOpen} toggleSidebar={toggleSidebar} />

        {/* Main Content Area */}
        <main className="flex-1 px-4 py-8">
          <div className="max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>

        {/* Footer */}
        <Footer />
      </motion.div>
    </div>
  );
};

export default DashboardLayout;
