import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy - CheapCC',
  description: 'CheapCC privacy policy and data protection practices. Learn how we handle your personal information when using our Adobe Creative Cloud subscription service.',
  keywords: 'cheapcc privacy, adobe cc privacy policy, creative cloud data protection, cheapcc data practices',
};

export default function PrivacyPolicy() {
  return (
    <>
      <section className="min-h-screen bg-[#0f111a] py-20 px-4 relative z-0">
        {/* Background glow effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vh] bg-[radial-gradient(ellipse_at_center,_rgba(255,_51,_102,_0.15),_transparent_70%)] pointer-events-none"></div>
        
        <div className="container mx-auto max-w-4xl relative z-10">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">Privacy Policy</h1>
            <p className="text-gray-400">Last updated: January 1, 2025</p>
          </div>
          
          <div className="rounded-xl p-6 sm:p-8 mb-10" style={{
            background: "rgba(17, 17, 40, 0.7)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)"
          }}>
            <div className="space-y-8 text-gray-300">
              <div>
                <h2 className="text-xl font-semibold text-white mb-3">1. Introduction</h2>
                <p>At CheapCC, we respect your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, and safeguard your information when you visit our website (cheapcc.online) or use our services.</p>
                <p className="mt-2">Please read this Privacy Policy carefully. If you do not agree with our policies and practices, your choice is not to use our website. By accessing or using our website, you agree to this Privacy Policy.</p>
              </div>
              
              <div>
                <h2 className="text-xl font-semibold text-white mb-3">2. Information We Collect</h2>
            <p>We collect several types of information from and about users of our website, including:</p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li><span className="text-white font-medium">Personal Information:</span> Name, email address, billing information, and payment details when you register for an account or make a purchase.</li>
                  <li><span className="text-white font-medium">Usage Data:</span> Information about how you use our website, such as the pages you visit, time spent on those pages, and other diagnostic data.</li>
                  <li><span className="text-white font-medium">Device Information:</span> Information about your device, including IP address, browser type, operating system, and other technology identifiers.</li>
            </ul>
          </div>
              
              <div>
                <h2 className="text-xl font-semibold text-white mb-3">3. How We Collect Information</h2>
            <p>We collect this information:</p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Directly from you when you provide it to us (e.g., when you register, make a purchase, or contact us).</li>
              <li>Automatically as you navigate through the site (information collected automatically may include usage details, IP addresses, and information collected through cookies).</li>
              <li>From third parties, for example, our payment processors or other service providers.</li>
            </ul>
          </div>
              
              <div>
                <h2 className="text-xl font-semibold text-white mb-3">4. How We Use Your Information</h2>
            <p>We use information that we collect about you or that you provide to us:</p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>To present our website and its contents to you.</li>
              <li>To provide you with information, products, or services that you request from us.</li>
              <li>To fulfill our obligations and enforce our rights arising from any contracts entered into between you and us.</li>
              <li>To notify you about changes to our website or any products or services we offer.</li>
              <li>To improve our website, products, services, and customer communications.</li>
              <li>In any other way we may describe when you provide the information.</li>
              <li>For any other purpose with your consent.</li>
            </ul>
          </div>
              
              <div>
                <h2 className="text-xl font-semibold text-white mb-3">5. Cookies and Tracking Technologies</h2>
            <p>We use cookies and similar tracking technologies to track the activity on our website and store certain information. Cookies are files with a small amount of data that may include an anonymous unique identifier.</p>
                <p className="mt-2">You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our website.</p>
          </div>
              
              <div>
                <h2 className="text-xl font-semibold text-white mb-3">6. Data Security</h2>
            <p>We have implemented appropriate technical and organizational security measures designed to protect the security of any personal information we process. However, despite our safeguards, no electronic transmission over the Internet or information storage technology can be guaranteed to be 100% secure.</p>
          </div>
              
              <div>
                <h2 className="text-xl font-semibold text-white mb-3">7. Third-Party Services</h2>
            <p>Our website may contain links to other websites that are not operated by us. If you click on a third-party link, you will be directed to that third party's site. We strongly advise you to review the Privacy Policy of every site you visit.</p>
                <p className="mt-2">We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party sites or services.</p>
          </div>
              
              <div>
                <h2 className="text-xl font-semibold text-white mb-3">8. Data Retention</h2>
            <p>We will retain your personal information only for as long as is necessary for the purposes set out in this Privacy Policy. We will retain and use your information to the extent necessary to comply with our legal obligations, resolve disputes, and enforce our policies.</p>
          </div>
              
              <div>
                <h2 className="text-xl font-semibold text-white mb-3">9. Your Data Protection Rights</h2>
            <p>Depending on your location, you may have certain rights regarding your personal information, such as:</p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>The right to access the personal information we have about you</li>
              <li>The right to request correction of inaccurate personal information</li>
              <li>The right to request deletion of your personal information</li>
              <li>The right to withdraw consent</li>
              <li>The right to object to processing of your personal information</li>
            </ul>
                <p className="mt-2">To exercise any of these rights, please contact us at <a href="mailto:support@cheapcc.online" className="text-[#ff3366] hover:text-[#ff6b8b] transition">support@cheapcc.online</a>.</p>
          </div>
              
              <div>
                <h2 className="text-xl font-semibold text-white mb-3">10. Children's Privacy</h2>
            <p>Our services are not intended for use by children under the age of 16. We do not knowingly collect personally identifiable information from children under 16. If you are a parent or guardian and you are aware that your child has provided us with personal information, please contact us.</p>
          </div>
              
              <div>
                <h2 className="text-xl font-semibold text-white mb-3">11. Changes to This Privacy Policy</h2>
            <p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.</p>
                <p className="mt-2">You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.</p>
              </div>
              
              <div>
                <h2 className="text-xl font-semibold text-white mb-3">12. Contact Us</h2>
                <p>If you have any questions about this Privacy Policy, please contact us at <a href="mailto:support@cheapcc.online" className="text-[#ff3366] hover:text-[#ff6b8b] transition">support@cheapcc.online</a>.</p>
              </div>
            </div>
          </div>
          
          <div className="text-center mb-10">
            <a href="/" className="inline-block px-6 py-3 rounded-lg bg-gradient-to-r from-fuchsia-500 via-pink-500 to-red-500 text-white font-semibold transition hover:opacity-90">
              Return to Homepage
            </a>
        </div>
      </div>
    </section>
    </>
  );
} 