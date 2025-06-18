import React from "react";
import DashboardLayout from "../../components/dashboard/dashboardLayout";

const RefundPolicy = () => (
  <DashboardLayout>
    <div className="max-w-4xl mx-auto px-4 py-10 text-gray-800">
      <h1 className="text-3xl font-bold mb-6 text-center text-[#1E293B]">Refund & Return Policy</h1>
      <p className="mb-4 text-sm text-gray-600">Last Updated: {new Date().toLocaleDateString()}</p>
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2 text-[#1E293B]">1. Returns</h2>
        <p>
          If you are not satisfied with your purchase, you may request a return within 7 days of delivery. Products must be unused, in original packaging, and in resalable condition. Some items (e.g., digital goods, perishable items) may not be eligible for return.
        </p>
      </section>
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2 text-[#1E293B]">2. Refunds</h2>
        <p>
          Once your return is received and inspected, we will notify you of the approval or rejection of your refund. If approved, your refund will be processed to your original payment method within 5-10 business days. Refunds are subject to Shopify and payment gateway processing times.
        </p>
      </section>
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2 text-[#1E293B]">3. Exchanges</h2>
        <p>
          If you received a defective or incorrect item, please contact us within 48 hours of delivery. We will arrange for a replacement or exchange as soon as possible.
        </p>
      </section>
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2 text-[#1E293B]">4. Non-Returnable Items</h2>
        <p>
          Certain items are non-returnable, including digital products, gift cards, and perishable goods. Please check the product description before purchasing.
        </p>
      </section>
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2 text-[#1E293B]">5. How to Request a Return</h2>
        <p>
          To initiate a return or refund, please contact us at <a href="mailto:techiertofficial@gmail.com" className="text-blue-600 underline">techiertofficial@gmail.com</a> with your order number and details. We will provide instructions for returning your item.
        </p>
      </section>
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2 text-[#1E293B]">6. Contact</h2>
        <p>
          For any questions about returns, refunds, or exchanges, please contact us at <a href="mailto:techiertofficial@gmail.com" className="text-blue-600 underline">techiertofficial@gmail.com</a>.
        </p>
      </section>
    </div>
  </DashboardLayout>
);

export default RefundPolicy; 