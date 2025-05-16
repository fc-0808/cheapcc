import React from 'react';

export default function RefundPolicy() {
  return (
    <section className="refund-section py-16 bg-[#f8f9fa]">
      <div className="container">
        <div className="section-heading text-center mb-8">
          <h1 className="text-3xl font-bold text-[#2c2d5a] mb-2">Refund Policy</h1>
          <p className="text-gray-500">Last updated: June 1, 2024</p>
        </div>
        <div className="refund-content max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
          <div className="refund-block mb-8">
            <h2 className="text-xl font-semibold text-[#2c2d5a] mb-3">1. Refund Eligibility</h2>
            <p>At CheapCC, we want you to be completely satisfied with your purchase. We offer a 7-day money-back guarantee on all purchases under the following conditions:</p>
            <ul className="list-disc pl-6">
              <li>The account credentials provided do not work at all and cannot be accessed.</li>
              <li>We are unable to provide replacement credentials within 48 hours of your report.</li>
              <li>The service purchased is substantially different from what was advertised.</li>
            </ul>
          </div>
          <div className="refund-block mb-8">
            <h2 className="text-xl font-semibold text-[#2c2d5a] mb-3">2. How to Request a Refund</h2>
            <p>To request a refund, please follow these steps:</p>
            <ol className="list-decimal pl-6">
              <li>Contact our support team at <a href="mailto:support@cheapcc.online" className="text-[#ff3366] hover:text-[#2c2d5a] underline">support@cheapcc.online</a> within 7 days of your purchase.</li>
              <li>Include your order number and the email address used for the purchase.</li>
              <li>Clearly explain the reason for your refund request.</li>
              <li>Our support team will review your request and respond within 24-48 hours.</li>
            </ol>
          </div>
          <div className="refund-block mb-8">
            <h2 className="text-xl font-semibold text-[#2c2d5a] mb-3">3. Refund Process</h2>
            <p>If your refund request is approved:</p>
            <ul className="list-disc pl-6">
              <li>Refunds will be processed using the same payment method used for the original purchase.</li>
              <li>It may take 5-10 business days for the refund to appear in your account, depending on your payment provider.</li>
              <li>You will receive an email confirmation once the refund has been processed.</li>
            </ul>
          </div>
          <div className="refund-block mb-8">
            <h2 className="text-xl font-semibold text-[#2c2d5a] mb-3">4. Non-Refundable Situations</h2>
            <p>Refunds will not be issued in the following situations:</p>
            <ul className="list-disc pl-6">
              <li>More than 7 days have passed since the purchase date.</li>
              <li>The issue reported is due to user error or misuse of the account.</li>
              <li>You have violated our Terms of Service or Adobe's Terms of Service.</li>
              <li>You have shared your account credentials with others.</li>
              <li>You have exceeded the maximum number of devices allowed (2 devices) for the account.</li>
              <li>Temporary service disruptions that are resolved within 48 hours.</li>
            </ul>
          </div>
          <div className="refund-block mb-8">
            <h2 className="text-xl font-semibold text-[#2c2d5a] mb-3">5. Account Access After Refund</h2>
            <p>Once a refund is processed, your access to the Adobe Creative Cloud account will be terminated immediately. Any further use of the account after receiving a refund is prohibited and may result in legal action.</p>
          </div>
          <div className="refund-block mb-8">
            <h2 className="text-xl font-semibold text-[#2c2d5a] mb-3">6. Partial Refunds</h2>
            <p>In some cases, we may offer partial refunds based on the time elapsed since purchase or the nature of the issue experienced. The decision to offer a partial refund is at the sole discretion of CheapCC.</p>
          </div>
          <div className="refund-block mb-8">
            <h2 className="text-xl font-semibold text-[#2c2d5a] mb-3">7. Changes to This Policy</h2>
            <p>We reserve the right to modify this Refund Policy at any time. Changes will be effective immediately upon posting to our website. Your continued use of our service following any changes indicates your acceptance of the updated policy.</p>
          </div>
          <div className="refund-block">
            <h2 className="text-xl font-semibold text-[#2c2d5a] mb-3">8. Contact Us</h2>
            <p>If you have any questions about our Refund Policy, please contact our support team at <a href="mailto:support@cheapcc.online" className="text-[#ff3366] hover:text-[#2c2d5a] underline">support@cheapcc.online</a>.</p>
          </div>
        </div>
      </div>
    </section>
  );
} 