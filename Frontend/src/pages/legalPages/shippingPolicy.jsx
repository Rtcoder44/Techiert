import React from "react";
import DashboardLayout from "../../components/dashboard/dashboardLayout";

const ShippingPolicy = () => (
  <DashboardLayout>
    <div className="max-w-4xl mx-auto px-4 py-10 text-gray-800">
      <h1 className="text-3xl font-bold mb-6 text-center text-[#1E293B]">Shipping & Delivery Policy</h1>
      <p className="mb-4 text-sm text-gray-600">Last Updated: {new Date().toLocaleDateString()}</p>
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2 text-[#1E293B]">1. Shipping Methods</h2>
        <p>
          We offer standard and express shipping options. Shipping methods and costs are displayed at checkout. Orders are shipped via trusted carriers.
        </p>
      </section>
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2 text-[#1E293B]">2. Delivery Times</h2>
        <p>
          Estimated delivery times are provided at checkout. Most orders are delivered within 3-10 business days. Delays may occur due to carrier issues, holidays, or customs.
        </p>
      </section>
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2 text-[#1E293B]">3. Order Tracking</h2>
        <p>
          Once your order is shipped, you will receive a tracking number by email. You can track your order status online.
        </p>
      </section>
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2 text-[#1E293B]">4. International Shipping</h2>
        <p>
          We ship internationally to select countries. International orders may be subject to customs duties and taxes, which are the responsibility of the recipient.
        </p>
      </section>
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2 text-[#1E293B]">5. Shipping Issues</h2>
        <p>
          If your order is delayed, lost, or damaged in transit, please contact us at <a href="mailto:techiertofficial@gmail.com" className="text-blue-600 underline">techiertofficial@gmail.com</a> and we will assist you.
        </p>
      </section>
    </div>
  </DashboardLayout>
);

export default ShippingPolicy; 