import React from "react";
import DashboardLayout from "../components/dashboard/dashboardLayout";

const Dashboard = () => {
  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold text-gray-800">Welcome to the Dashboard</h1>
      <p className="mt-2 text-gray-600">Manage your blog posts, users, and settings here.</p>
    </DashboardLayout>
  );
};

export default Dashboard;
