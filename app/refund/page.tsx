import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Refund Policy - CheapCC',
  description: 'CheapCC refund policy for Adobe Creative Cloud subscriptions. Learn about our refund terms and conditions for your Adobe CC purchase.',
  keywords: 'cheapcc refund, adobe cc refund policy, creative cloud refund, cheapcc money back',
};

export default function RefundPolicy() {
  return (
    <>
      <section className="min-h-screen bg-[#0f111a] py-20 px-4 relative z-0">
        {/* Background glow effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vh] bg-[radial-gradient(ellipse_at_center,_rgba(255,_51,_102,_0.15),_transparent_70%)] pointer-events-none"></div>
        
        <div className="container mx-auto max-w-4xl relative z-10">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">Refund Policy</h1>
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
                <h2 className="text-xl font-semibold text-white mb-3">1. Refund Eligibility</h2>
            <p>At CheapCC, we want you to be completely satisfied with your purchase. We offer a 7-day money-back guarantee on all purchases under the following conditions:</p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>The account credentials provided do not work at all and cannot be accessed.</li>
              <li>We are unable to provide replacement credentials within 48 hours of your report.</li>
              <li>The service purchased is substantially different from what was advertised.</li>
            </ul>
          </div>
              
              <div>
                <h2 className="text-xl font-semibold text-white mb-3">2. How to Request a Refund</h2>
            <p>To request a refund, please follow these steps:</p>
                <ol className="list-decimal pl-6 mt-2 space-y-1">
                  <li>Contact our support team at <a href="mailto:support@cheapcc.online" className="text-[#ff3366] hover:text-[#ff6b8b] transition">support@cheapcc.online</a> within 7 days of your purchase.</li>
              <li>Include your order number and the email address used for the purchase.</li>
              <li>Clearly explain the reason for your refund request.</li>
              <li>Our support team will review your request and respond within 24-48 hours.</li>
            </ol>
          </div>
              
              <div>
                <h2 className="text-xl font-semibold text-white mb-3">3. Refund Process</h2>
            <p>If your refund request is approved:</p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Refunds will be processed using the same payment method used for the original purchase.</li>
              <li>It may take 5-10 business days for the refund to appear in your account, depending on your payment provider.</li>
              <li>You will receive an email confirmation once the refund has been processed.</li>
            </ul>
          </div>
              
              <div>
                <h2 className="text-xl font-semibold text-white mb-3">4. Non-Refundable Situations</h2>
            <p>Refunds will not be issued in the following situations:</p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>More than 7 days have passed since the purchase date.</li>
              <li>The issue reported is due to user error or misuse of the account.</li>
              <li>You have violated our Terms of Service or Adobe's Terms of Service.</li>
              <li>You have shared your account credentials with others.</li>
              <li>You have exceeded the maximum number of devices allowed (2 devices) for the account.</li>
              <li>Temporary service disruptions that are resolved within 48 hours.</li>
            </ul>
          </div>
              
              <div>
                <h2 className="text-xl font-semibold text-white mb-3">5. Account Access After Refund</h2>
            <p>Once a refund is processed, your access to the Adobe Creative Cloud account will be terminated immediately. Any further use of the account after receiving a refund is prohibited and may result in legal action.</p>
          </div>
              
              <div>
                <h2 className="text-xl font-semibold text-white mb-3">6. Partial Refunds</h2>
            <p>In some cases, we may offer partial refunds based on the time elapsed since purchase or the nature of the issue experienced. The decision to offer a partial refund is at the sole discretion of CheapCC.</p>
          </div>
              
              <div>
                <h2 className="text-xl font-semibold text-white mb-3">7. Changes to This Policy</h2>
            <p>We reserve the right to modify this Refund Policy at any time. Changes will be effective immediately upon posting to our website. Your continued use of our service following any changes indicates your acceptance of the updated policy.</p>
              </div>
              
              <div>
                <h2 className="text-xl font-semibold text-white mb-3">8. Contact Us</h2>
                <p>If you have any questions about our Refund Policy, please contact our support team at <a href="mailto:support@cheapcc.online" className="text-[#ff3366] hover:text-[#ff6b8b] transition">support@cheapcc.online</a>.</p>
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