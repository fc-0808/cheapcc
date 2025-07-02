import React from 'react';
import { Metadata } from 'next';
import Header from '@/components/Header';

export const metadata: Metadata = {
  title: 'Terms of Service - Adobe Creative Cloud Subscription Agreement',
  description: 'Terms and conditions for using CheapCC\'s Adobe Creative Cloud subscription services. Read our full terms of service agreement for using our discount Adobe CC subscriptions.',
  keywords: 'adobe creative cloud terms, cheapcc terms of service, adobe cc subscription terms, creative cloud agreement',
};

export default function TermsOfService() {
  return (
    <>
      <Header />
      <section className="min-h-screen bg-[#0f111a] py-20 px-4 relative z-0">
        {/* Background glow effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vh] bg-[radial-gradient(ellipse_at_center,_rgba(255,_51,_102,_0.15),_transparent_70%)] pointer-events-none"></div>
        
        <div className="container mx-auto max-w-4xl relative z-10">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">Terms of Service</h1>
            <p className="text-gray-400">Last updated: June 1, 2024</p>
        </div>
          
          <div className="rounded-xl p-6 sm:p-8 mb-10" style={{
            background: "rgba(17, 17, 40, 0.7)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)"
          }}>
            <div className="space-y-8 text-gray-300">
              <div>
                <h2 className="text-xl font-semibold text-white mb-3">1. Acceptance of Terms</h2>
            <p>By accessing and using CheapCC.online (the "Service"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of the terms, you may not access the Service.</p>
          </div>
              
              <div>
                <h2 className="text-xl font-semibold text-white mb-3">2. Description of Service</h2>
            <p>CheapCC provides users with access to Adobe Creative Cloud accounts at reduced prices. The Service includes the provision of account credentials that allow access to Adobe Creative Cloud applications and services.</p>
          </div>
              
              <div>
                <h2 className="text-xl font-semibold text-white mb-3">3. Account Registration</h2>
            <p>To use certain features of the Service, you must register for an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete.</p>
                <p className="mt-2">You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password. You agree not to disclose your password to any third party.</p>
          </div>
              
              <div>
                <h2 className="text-xl font-semibold text-white mb-3">4. Payment Terms</h2>
            <p>All payments are processed through secure third-party payment processors. By making a purchase through our Service, you agree to be bound by the terms of our payment processors.</p>
                <p className="mt-2">All prices are shown in US Dollars unless otherwise stated. We reserve the right to change our prices at any time without notice.</p>
                <p className="mt-2">Subscription payments are non-refundable except as described in our <a href="/refund" className="text-[#ff3366] hover:text-[#ff6b8b] transition">Refund Policy</a>.</p>
          </div>
              
              <div>
                <h2 className="text-xl font-semibold text-white mb-3">5. Account Usage</h2>
            <p>Upon purchase, you will receive account credentials for Adobe Creative Cloud. These credentials are for your personal use only and are limited to a maximum of two devices simultaneously, as per Adobe's standard terms.</p>
                <p className="mt-2">You agree not to:</p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Share, resell, or transfer your account credentials to any third party</li>
              <li>Use the account for any illegal purpose or in violation of any local, state, national, or international law</li>
              <li>Attempt to gain unauthorized access to any portion of the Service or any other systems or networks</li>
              <li>Exceed the scope of the license granted by Adobe through your account credentials</li>
            </ul>
          </div>
              
              <div>
                <h2 className="text-xl font-semibold text-white mb-3">6. Account Support and Replacement</h2>
            <p>We provide full support for the duration of your subscription. If you encounter issues with your account, we will make reasonable efforts to resolve them within 24-48 hours.</p>
                <p className="mt-2">In cases where an account cannot be restored to working condition, we will provide a replacement account for the remainder of your subscription period.</p>
          </div>
              
              <div>
                <h2 className="text-xl font-semibold text-white mb-3">7. Limitation of Liability</h2>
            <p>The Service is provided "as is" without warranties of any kind, either express or implied. In no event shall CheapCC be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.</p>
          </div>
              
              <div>
                <h2 className="text-xl font-semibold text-white mb-3">8. Indemnification</h2>
            <p>You agree to defend, indemnify and hold harmless CheapCC and its licensee and licensors, and their employees, contractors, agents, officers and directors, from and against any and all claims, damages, obligations, losses, liabilities, costs or debt, and expenses, resulting from or arising out of your use and access of the Service.</p>
          </div>
              
              <div>
                <h2 className="text-xl font-semibold text-white mb-3">9. Termination</h2>
            <p>We may terminate or suspend your account and access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason, including but not limited to a breach of the Terms.</p>
                <p className="mt-2">Upon termination, your right to use the Service will immediately cease. If you wish to terminate your account, you may simply discontinue using the Service.</p>
          </div>
              
              <div>
                <h2 className="text-xl font-semibold text-white mb-3">10. Governing Law</h2>
            <p>These Terms shall be governed and construed in accordance with the laws of the United States, without regard to its conflict of law provisions.</p>
          </div>
              
              <div>
                <h2 className="text-xl font-semibold text-white mb-3">11. Changes to Terms</h2>
            <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.</p>
              </div>
              
              <div>
                <h2 className="text-xl font-semibold text-white mb-3">12. Contact Us</h2>
                <p>If you have any questions about these Terms, please contact us at <a href="mailto:support@cheapcc.online" className="text-[#ff3366] hover:text-[#ff6b8b] transition">support@cheapcc.online</a>.</p>
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