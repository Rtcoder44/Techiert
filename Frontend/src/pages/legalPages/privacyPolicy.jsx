import React from "react";
import DashboardLayout from "../../components/dashboard/dashboardLayout";

const PrivacyPolicy = () => {
  return (
    <DashboardLayout>
      <div className="bg-white text-gray-800 py-12 px-6 md:px-10 lg:px-20 max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold mb-4 text-center text-gray-900">
          Privacy Policy
        </h1>
        <p className="text-sm text-gray-500 text-center mb-10">
          Last updated: April 16, 2025
        </p>

        <div className="space-y-10">
          <section>
            <p>
              At <strong>Techiert.com</strong>, accessible from{" "}
              <a
                href="https://www.techiert.com"
                className="text-blue-600 underline"
              >
                https://www.techiert.com
              </a>
              , we prioritize your privacy. This Privacy Policy outlines what
              information we collect, how we use it, and your rights.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2">1. Information We Collect</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>Personal info like name and email (voluntarily submitted)</li>
              <li>Device info like browser type, IP, OS</li>
              <li>Cookies for analytics and ad personalization</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2">2. How We Use Information</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>To improve website experience</li>
              <li>To analyze traffic and performance</li>
              <li>To deliver personalized content and ads</li>
              <li>To communicate via email, if subscribed</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2">3. Cookies</h2>
            <p>
              We use cookies to store information and preferences. You can disable
              them in your browser settings. Some features may not function
              properly without cookies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2">
              4. Google AdSense & Third-Party Advertising
            </h2>
            <p>
              We use Google AdSense to serve ads. Google may use cookies to show
              personalized ads based on your visit to this or other websites. Learn
              more at{" "}
              <a
                href="https://policies.google.com/technologies/ads"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                Google Ad Policies
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2">5. GDPR Rights (EU Visitors)</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>Access, correct, or delete your data</li>
              <li>Limit or object to data use</li>
              <li>Request data portability</li>
            </ul>
            <p className="mt-2">
              Email us at{" "}
              <a
                href="mailto:techiertofficial@gmail.com"
                className="text-blue-600 underline"
              >
                techiertofficial@gmail.com
              </a>{" "}
              to exercise these rights.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2">6. CCPA Rights (California)</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>Know what personal data is collected</li>
              <li>Request deletion of your data</li>
              <li>Opt-out of the sale of personal data (we do not sell data)</li>
            </ul>
            <p className="mt-2">
              Contact us at{" "}
              <a
                href="mailto:techiertofficial@gmail.com"
                className="text-blue-600 underline"
              >
                techiertofficial@gmail.com
              </a>{" "}
              to make a request.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2">7. Children’s Privacy</h2>
            <p>
              We do not knowingly collect data from children under 13. If you
              believe your child submitted personal data, please contact us and
              we’ll delete it immediately.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2">8. Security Measures</h2>
            <p>
              We use industry-standard security methods to protect your personal
              data from unauthorized access or disclosure.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2">9. Changes to This Policy</h2>
            <p>
              We may update this policy occasionally. When we do, we’ll revise the
              date above. You’re advised to review this page regularly.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2">10. Contact Information</h2>
            <p>
              If you have any questions, please contact us:
              <br />
              📧{" "}
              <a
                href="mailto:techiertofficial@gmail.com"
                className="text-blue-600 underline"
              >
                techiertofficial@gmail.com
              </a>
              <br />
              📍 Village Bardiha, Post Jagdishpur Dharmadani,
              <br />
              District Kushinagar, 274149
            </p>
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PrivacyPolicy;
