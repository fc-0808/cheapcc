"use client";
import React, { useState } from "react";

const FAQ_CATEGORIES = [
  { key: "all", label: "All Questions" },
  { key: "account", label: "Account" },
  { key: "payment", label: "Payment" },
  { key: "services", label: "Services" },
  { key: "support", label: "Support" },
];

const FAQS = [
  // Account
  {
    q: "How do I create an account?",
    a: "Creating an account is simple. Click on the 'Register' button in the top right corner of our homepage. Fill in your details, verify your email address, and you're ready to go!",
    category: "account",
  },
  {
    q: "What should I do if I forget my password?",
    a: "If you forget your password, click on the 'Forgot Password' link on the login page. Enter your email address, and we'll send you instructions to reset your password.",
    category: "account",
  },
  {
    q: "Are these genuine Adobe Creative Cloud subscriptions?",
    a: "Yes, absolutely. You will receive genuine Adobe Creative Cloud accounts with full access to all Creative Cloud applications and services. The subscriptions include regular updates, cloud storage, and all the features you would get from purchasing directly from Adobe, but at a much lower price.",
    category: "account",
  },
  // Payment
  {
    q: "What payment methods do you accept?",
    a: "We currently accept payments through PayPal, which allows you to pay using your PayPal balance, linked bank account, or credit/debit card. This ensures your payment information is secure and protected.",
    category: "payment",
  },
  {
    q: "Are there any recurring charges?",
    a: "No, all our services are one-time purchases for the duration you select. There are no automatic subscription renewals or hidden charges. You only pay for what you purchase.",
    category: "payment",
  },
  {
    q: "What is your refund policy?",
    a: "We offer a 7-day money-back guarantee if you are unable to access the Adobe Creative Cloud services with the credentials provided. If you encounter any issues, please contact our support team at support@cheapcc.online with your order details, and we'll assist you promptly.",
    category: "payment",
  },
  // Services
  {
    q: "How does cheapcc.online offer such low prices?",
    a: "As an alternative to cheapcc.net, we specialize in offering Adobe Creative Cloud subscriptions at significantly reduced prices. We achieve these savings through volume licensing agreements and strategic partnerships that allow us to pass the savings onto you. This is why we can offer up to 86% off compared to Adobe's official pricing while providing the same authentic product.",
    category: "services",
  },
  {
    q: "How quickly will I receive my Adobe account details?",
    a: "In most cases, you will receive your Adobe account information immediately after your payment is confirmed. The details will be sent to the email address you provided during checkout. Occasionally, during periods of high demand, delivery may take up to 24 hours, but this is rare.",
    category: "services",
  },
  {
    q: "Which Adobe apps are included in the subscription?",
    a: "Our subscriptions include the complete Adobe Creative Cloud suite with all apps, including Photoshop, Illustrator, InDesign, Premiere Pro, After Effects, Lightroom, Dreamweaver, and many more. You'll have access to the same apps and services as with an official Adobe Creative Cloud All Apps subscription.",
    category: "services",
  },
  // Support
  {
    q: "How can I contact customer support?",
    a: "You can reach our customer support team by emailing cheapcconline@gmail.com. We typically respond within 24 hours. Please include your order number if you have a question about a specific purchase.",
    category: "support",
  },
  {
    q: "What if I have trouble accessing my Adobe account?",
    a: "If you encounter any issues accessing your Adobe account, please contact our support team immediately. We'll work quickly to resolve the issue or provide alternative credentials. Most access issues can be resolved within 24 hours.",
    category: "support",
  },
  {
    q: "How do I check the status of my order?",
    a: "You can check the status of your order by logging into your dashboard on our website. All your orders and their current status will be displayed there. If you haven't received access to your dashboard, please contact support with your order confirmation email.",
    category: "support",
  },
];

export default function FAQPage() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");

  const filteredFaqs = FAQS.filter(faq =>
    (activeCategory === "all" || faq.category === activeCategory) &&
    (faq.q.toLowerCase().includes(search.toLowerCase()) || faq.a.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <main className="faq-page bg-white min-h-screen">
      {/* Hero Section */}
      <section className="faq-hero py-16 bg-gradient-to-b from-[#f3f4f6] to-white">
        <div className="container faq-hero-container text-center">
          <h1 className="text-4xl font-extrabold text-[#2c2d5a] mb-2">Frequently Asked Questions</h1>
          <p className="text-lg text-gray-500">Find answers to the most common questions about our services and products</p>
        </div>
      </section>

      {/* FAQ Content Section */}
      <section className="faq-content py-10">
        <div className="container">
          {/* Search Bar */}
          <div className="faq-search flex items-center max-w-xl mx-auto mb-8 relative">
            <input
              type="text"
              className="w-full border border-gray-200 rounded-lg py-3 px-4 pr-10 text-base focus:outline-none focus:ring-2 focus:ring-[#ff3366]"
              placeholder="Search questions..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <i className="fas fa-search absolute right-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Category Tabs */}
          <div className="faq-categories flex flex-wrap justify-center gap-2 mb-8">
            {FAQ_CATEGORIES.map(cat => (
              <button
                key={cat.key}
                className={`faq-tab px-4 py-2 rounded-full font-semibold border transition ${activeCategory === cat.key ? 'bg-[#ff3366] text-white border-[#ff3366]' : 'bg-white text-[#2c2d5a] border-gray-200 hover:bg-[#f3f4f6]'}`}
                onClick={() => setActiveCategory(cat.key)}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* FAQ List */}
          <div className="faq-list max-w-2xl mx-auto">
            {filteredFaqs.length === 0 && (
              <div className="text-center text-gray-400 py-8">No questions found.</div>
            )}
            {filteredFaqs.map((item, idx) => (
              <div
                key={item.q}
                className={`faq-item mb-4 border border-gray-100 rounded-lg shadow-sm bg-white ${openIdx === idx ? 'active' : ''}`}
              >
                <div
                  className="faq-question flex justify-between items-center cursor-pointer px-6 py-4"
                  onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                  tabIndex={0}
                  role="button"
                  aria-expanded={openIdx === idx}
                  onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && setOpenIdx(openIdx === idx ? null : idx)}
                >
                  <h3 className="font-semibold text-lg text-[#2c2d5a]">{item.q}</h3>
                  <span className="faq-icon ml-4 text-[#ff3366] text-xl transition-transform" style={{ transform: openIdx === idx ? 'rotate(180deg)' : 'none' }}>
                    <i className="fas fa-chevron-down" />
                  </span>
                </div>
                <div
                  className="faq-answer px-6 pb-4 text-gray-700 text-base transition-all"
                  style={{ maxHeight: openIdx === idx ? 300 : 0, opacity: openIdx === idx ? 1 : 0, overflow: openIdx === idx ? 'visible' : 'hidden' }}
                >
                  <p>{item.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Still Have Questions Section */}
      <section className="still-have-questions py-16 bg-[#f8f9fa]">
        <div className="container text-center">
          <h2 className="text-2xl font-bold text-[#2c2d5a] mb-2">Still Have Questions?</h2>
          <p className="text-gray-500 mb-6">Our support team is here to help you with any questions or concerns.</p>
          <a href="mailto:cheapcconline@gmail.com" className="btn btn-primary inline-block px-6 py-3 rounded-full bg-[#ff3366] text-white font-semibold shadow hover:bg-[#ff6b8b] transition mb-4">Contact Support</a>
          <div className="home-link-container mt-2">
            <a href="/" className="home-link text-[#2c2d5a] hover:underline inline-flex items-center gap-2 font-medium">
              Back to Homepage <i className="fas fa-home" />
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
 