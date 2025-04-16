import React from "react";
import DashboardLayout from "../../components/dashboard/dashboardLayout";

const TermsOfService = () => {
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto px-4 py-10 text-gray-800">
        <h1 className="text-3xl font-bold mb-6 text-center text-[#1E293B]">
          Terms of Service
        </h1>

        <p className="mb-4 text-sm text-gray-600">
          Last Updated: April 16, 2025
        </p>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2 text-[#1E293B]">1. Introduction</h2>
          <p>
            Welcome to <strong>Techiert.com</strong>. These Terms of Service
            ("Terms") govern your access and use of our website. By accessing or
            using the website, you agree to comply with and be bound by these
            Terms.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2 text-[#1E293B]">2. Use of Website</h2>
          <p>
            You agree to use this website for lawful purposes only. You must not
            use the site in a way that may cause damage, interfere with others’
            use, or violate any laws or regulations.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2 text-[#1E293B]">3. Intellectual Property</h2>
          <p>
            All content, logos, articles, and graphics on Techiert.com are the
            intellectual property of Techiert and are protected by applicable
            copyright laws. You may not copy, reproduce, or distribute any
            content without prior written permission.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2 text-[#1E293B]">4. AdSense and Affiliate Links</h2>
          <p>
            Techiert.com displays advertisements via Google AdSense and may
            contain affiliate links. By using this website, you understand and
            agree that we may earn revenue from these services, and we comply
            fully with Google's policies.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2 text-[#1E293B]">5. User Contributions</h2>
          <p>
            Users may contribute comments, feedback, or other content. You are
            solely responsible for what you share, and it must not be harmful,
            abusive, or infringe upon any rights.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2 text-[#1E293B]">6. Privacy</h2>
          <p>
            Your use of Techiert.com is also governed by our{" "}
            <a href="/privacy-policy" className="text-blue-600 hover:underline">
              Privacy Policy
            </a>
            .
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2 text-[#1E293B]">7. Termination</h2>
          <p>
            We reserve the right to restrict or terminate your access to the
            website at any time if we believe you are in violation of these
            Terms.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2 text-[#1E293B]">8. Changes to Terms</h2>
          <p>
            We may modify these Terms at any time. Changes will be posted here,
            and your continued use of the site after changes are made indicates
            your acceptance.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2 text-[#1E293B]">9. Contact</h2>
          <p>
            If you have any questions or concerns about these Terms, you may
            contact us at:
          </p>
          <ul className="list-disc list-inside mt-2 text-sm">
            <li>
              <strong>Email:</strong> techiertofficial@gmail.com
            </li>
            <li>
              <strong>Address:</strong> Village Bardiha, Post Jagdishpur
              Dharmadani, District Kushinagar, 274149
            </li>
          </ul>
        </section>

        <div className="text-center mt-10 text-xs text-gray-500">
          &copy; {new Date().getFullYear()} Techiert.com. All rights reserved.
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TermsOfService;
