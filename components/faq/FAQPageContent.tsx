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
  {
    q: "What does 'Your Email Activation' mean and how does it work?",
    a: "When you choose 'Your Email Activation', your existing Adobe email account will be added to an educational organization that provides access to Adobe Creative Cloud at discounted rates. This means you'll keep using your current Adobe email address, but gain access to educational pricing through our organizational partnership. Your account will be upgraded with full Creative Cloud access while maintaining your existing Adobe ID and any personal settings or files you may have.",
    category: "account",
  },
  {
    q: "Can I use these accounts on multiple devices?",
    a: "Yes, Adobe Creative Cloud allows you to install and use the applications on up to 2 devices simultaneously with a single subscription. You can activate and deactivate devices as needed through your Adobe account settings, giving you flexibility to use your subscription across your desktop, laptop, or other devices.",
    category: "account",
  },
  {
    q: "Can I upgrade or downgrade my subscription plan?",
    a: "Since these are discounted Adobe Creative Cloud accounts, plan changes need to be handled through our support team. Contact us at support@cheapcc.online with your current order details and desired plan change. We'll work with you to find the best solution, which may involve purchasing a new subscription at our discounted rates.",
    category: "account",
  },
  {
    q: "Can I cancel my subscription anytime?",
    a: "Our subscriptions are sold for specific time periods (1 month, 6 months, or 1 year) and are one-time purchases rather than recurring subscriptions. There are no automatic renewals or cancellation fees. When your subscription period ends, you can choose to purchase a new subscription if you wish to continue using Adobe Creative Cloud.",
    category: "account",
  },
  
  // Payment
  {
    q: "What payment methods do you accept?",
    a: "We currently accept payments through PayPal and credit/debit card with Stripe, which allows you to pay using your PayPal balance, linked bank account, or credit/debit card with Stripe. This ensures your payment information is secure and protected.",
    category: "payment",
  },
  {
    q: "Are there any recurring charges?",
    a: "No, all our services are one-time purchases for the duration you select. There are no automatic subscription renewals or hidden charges. You only pay for what you purchase.",
    category: "payment",
  },
  {
    q: "What is your refund policy?",
    a: "We offer a 3-day money-back guarantee if you are unable to access the Adobe Creative Cloud services with the credentials provided. If you encounter any issues, please contact our support team at support@cheapcc.online with your order details, and we'll assist you promptly.",
    category: "payment",
  },
  {
    q: "Is my personal information and payment data secure?",
    a: "Absolutely. We use industry-standard SSL encryption to protect all data transmission. Payment processing is handled through secure, PCI-compliant payment processors (PayPal and Stripe), so we never store your payment information on our servers. Your privacy and security are our top priorities.",
    category: "payment",
  },
  {
    q: "Do you offer bulk discounts for teams or businesses?",
    a: "Yes, we offer additional discounts for bulk purchases of 5 or more subscriptions. Contact our sales team at support@cheapcc.online with your requirements, and we'll provide you with a custom quote. Bulk purchases are perfect for creative agencies, design teams, educational institutions, and businesses.",
    category: "payment",
  },
  
  // Services
  {
    q: "How does cheapcc.online offer such low prices?",
    a: "As an alternative to cheapcc.net, we specialize in offering Adobe Creative Cloud subscriptions at significantly reduced prices. We achieve these savings through volume licensing agreements and strategic partnerships that allow us to pass the savings onto you. This is why we can offer up to 75% off compared to Adobe's official pricing while providing the same authentic product.",
    category: "services",
  },
  {
    q: "How quickly will I receive my Adobe account details?",
    a: "In most cases, you will receive your Adobe account information immediately after your payment is confirmed. The details will be sent to the email address you provided during checkout. Occasionally, during periods of high demand, delivery may take up to 24 hours, but this is rare.",
    category: "services",
  },
  {
    q: "Do I get access to all Adobe Creative Cloud apps?",
    a: "Yes, our Adobe Creative Cloud subscriptions include access to the complete suite of Adobe applications including Photoshop, Illustrator, InDesign, Premiere Pro, After Effects, Lightroom, XD, Acrobat Pro, and many more. You also get 100GB of cloud storage and access to Adobe Fonts and Adobe Stock (with limitations based on your plan).",
    category: "services",
  },
  {
    q: "Which Adobe apps are included in the subscription?",
    a: "Our subscriptions include the complete Adobe Creative Cloud suite with all apps, including Photoshop, Illustrator, InDesign, Premiere Pro, After Effects, Lightroom, Dreamweaver, and many more. You'll have access to the same apps and services as with an official Adobe Creative Cloud All Apps subscription.",
    category: "services",
  },
  {
    q: "Are there any restrictions on commercial use?",
    a: "No, these are full Adobe Creative Cloud subscriptions with complete commercial usage rights. You can use all applications for personal projects, client work, commercial designs, and business purposes just as you would with a subscription purchased directly from Adobe. There are no limitations on commercial use.",
    category: "services",
  },
  {
    q: "How do updates and new features work?",
    a: "Your Adobe Creative Cloud subscription includes automatic updates and access to new features as they're released by Adobe. The Creative Cloud desktop app will notify you of available updates, and you can install them just like with any regular Adobe subscription. You'll always have access to the latest versions of all applications.",
    category: "services",
  },
  
  // Support
  {
    q: "How can I contact customer support?",
    a: "You can reach our customer support team by emailing support@cheapcc.online. We typically respond within 24 hours. Please include your order number if you have a question about a specific purchase.",
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
  {
    q: "What happens if my Adobe account stops working?",
    a: "In the rare event that your Adobe account experiences issues, we provide full support to resolve the problem quickly. We offer replacement accounts when necessary and have a dedicated support team available to assist you. Most issues are resolved within 24 hours, and we stand behind our service with our money-back guarantee.",
    category: "support",
  },
  {
    q: "What if I need help with Adobe software itself?",
    a: "While we provide support for account access and delivery issues, technical support for using Adobe software is provided directly by Adobe through their official support channels, tutorials, and community forums. Your subscription includes access to Adobe's extensive learning resources and help documentation.",
    category: "support",
  },
];

export default function FAQPageContent() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");

  const filteredFaqs = FAQS.filter(faq =>
    (activeCategory === "all" || faq.category === activeCategory) &&
    (faq.q.toLowerCase().includes(search.toLowerCase()) || faq.a.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <main className="min-h-screen bg-[#0f111a]">
      {/* Hero Section */}
      <section className="py-20 relative overflow-hidden">
        {/* Background glow effect */}
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vh] bg-[radial-gradient(ellipse_at_center,_rgba(255,_51,_102,_0.15),_transparent_70%)] pointer-events-none"
          style={{ opacity: 0.5 }}
        />
        
        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="inline-block mb-14">
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6" style={{ textShadow: '0 0 20px rgba(255, 51, 102, 0.3)' }}>
            <span className="inline-block">Frequently </span>
            <span className="bg-gradient-to-r from-fuchsia-500 via-pink-500 to-red-500 bg-clip-text text-transparent inline-block"
              style={{ backgroundSize: "200% 100%" }}>
              &nbsp;Asked Questions
            </span>
          </h1>
          
          <p className="text-white/80 mx-auto mb-8 text-base sm:text-lg font-light tracking-wide max-w-2xl">
            Find answers to the most common questions about our Adobe Creative Cloud subscriptions
          </p>
        </div>
      </section>

      {/* FAQ Content Section */}
      <section className="py-10 relative">
        <div className="container mx-auto px-4 relative z-10">
          {/* Search Bar */}
          <div className="max-w-xl mx-auto mb-8 relative">
            <div className="relative group">
              <div className="absolute -inset-0.5 rounded-lg blur opacity-50 bg-gradient-to-r from-fuchsia-600 to-pink-600 group-hover:opacity-75 transition duration-300"></div>
              <div className="relative flex items-center">
                <input
                  type="text"
                  className="w-full border-none rounded-lg py-3 px-4 pl-10 text-base focus:outline-none text-white bg-white/5 backdrop-blur-sm"
                  placeholder="Search questions..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
                <i className="fas fa-search absolute left-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {FAQ_CATEGORIES.map(cat => (
              <button
                key={cat.key}
                className={`px-4 py-2 rounded-full font-semibold transition backdrop-blur-sm ${
                  activeCategory === cat.key 
                    ? 'bg-gradient-to-r from-fuchsia-500 via-pink-500 to-red-500 text-white shadow-[0_4px_15px_rgba(219,39,119,0.4)]' 
                    : 'bg-white/5 text-white/80 border border-white/10 hover:bg-white/10'
                }`}
                onClick={() => setActiveCategory(cat.key)}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* FAQ List */}
          <div className="max-w-3xl mx-auto">
            {filteredFaqs.length === 0 && (
              <div className="text-center text-gray-400 py-8">
                <i className="fas fa-search text-2xl mb-2"></i>
                <p>No questions found matching your search.</p>
              </div>
            )}
            {filteredFaqs.map((item, idx) => (
              <div
                key={item.q}
                className={`mb-6 relative backdrop-blur-sm border transition-all duration-300 ${
                  openIdx === idx 
                    ? 'border-pink-500/30 shadow-[0_0_25px_rgba(219,39,119,0.15)]' 
                    : 'border-white/10 hover:border-white/20'
                } rounded-xl overflow-hidden`}
              >
                <div
                  className={`p-5 sm:p-6 flex justify-between items-center cursor-pointer ${
                    openIdx === idx ? 'bg-white/10' : 'bg-white/5'
                  }`}
                  onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                  tabIndex={0}
                  role="button"
                  aria-expanded={openIdx === idx}
                  aria-controls={`faq-answer-${idx}`}
                  onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && setOpenIdx(openIdx === idx ? null : idx)}
                  style={{ minHeight: '60px' }} /* Ensure minimum touch target height */
                >
                  <h3 className="text-lg sm:text-xl font-medium text-white pr-10">{item.q}</h3>
                  <div 
                    className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white transition-transform duration-300"
                    style={{ transform: openIdx === idx ? 'rotate(45deg)' : 'rotate(0deg)' }}
                    aria-hidden="true"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                  </div>
                </div>
                
                <div
                  id={`faq-answer-${idx}`}
                  role="region"
                  aria-labelledby={`faq-question-${idx}`}
                  className="overflow-hidden transition-all duration-300"
                  style={{ 
                    maxHeight: openIdx === idx ? '1000px' : '0px',
                    opacity: openIdx === idx ? 1 : 0,
                    visibility: openIdx === idx ? 'visible' : 'hidden',
                  }}
                >
                  <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-0 border-t border-white/10">
                    <p className="text-gray-300 pt-4 text-base leading-relaxed">
                      {item.a}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 relative overflow-hidden">
        {/* Background glow effect */}
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[40vh] bg-[radial-gradient(ellipse_at_center,_rgba(124,_58,_237,_0.15),_transparent_70%)] pointer-events-none"
          style={{ opacity: 0.5 }}
        />
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">Still Have Questions?</h2>
          <p className="text-white/70 mb-8 max-w-2xl mx-auto">
            Our support team is here to help you with any questions or concerns about Adobe Creative Cloud.
          </p>
          <a 
            href="mailto:support@cheapcc.online" 
            className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full bg-gradient-to-r from-fuchsia-500 via-pink-500 to-rose-600 text-white font-semibold text-base shadow-lg shadow-red-500/30 border border-white/20 transition hover:shadow-xl hover:shadow-red-500/40"
          >
            <i className="fas fa-envelope mr-2"></i>
            Contact Support
          </a>
          <div className="mt-6">
            <a 
              href="/" 
              className="inline-flex items-center gap-2 text-white/80 hover:text-white transition"
            >
              <i className="fas fa-home"></i>
              Return to Homepage
            </a>
          </div>
        </div>
      </section>
    </main>
  );
} 