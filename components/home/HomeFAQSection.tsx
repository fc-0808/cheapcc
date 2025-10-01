"use client";
import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView, AnimatePresence, Variants } from 'framer-motion';
import Script from 'next/script';

const HOME_FAQS = [
  // Basic Service Understanding
  {
    q: "Are these genuine Adobe Creative Cloud subscriptions?",
    a: "Yes, absolutely. You will receive genuine Adobe Creative Cloud accounts with full access to all Creative Cloud applications and services. The subscriptions include regular updates, cloud storage, and all the features you would get from purchasing directly from Adobe, but at a much lower price.",
  },
  {
    q: "How does cheapcc.online offer such low prices?",
    a: "As an alternative to cheapcc.net, we specialize in offering Adobe Creative Cloud subscriptions at significantly reduced prices. We achieve these savings through volume licensing agreements and strategic partnerships that allow us to pass the savings onto you. This is why we can offer up to 75% off compared to Adobe's official pricing while providing the same authentic product.",
  },
  {
    q: "Do I get access to all Adobe Creative Cloud apps?",
    a: "Yes, our Adobe Creative Cloud subscriptions include access to the complete suite of Adobe applications including Photoshop, Illustrator, InDesign, Premiere Pro, After Effects, Lightroom, XD, Acrobat Pro, and many more. You also get 100GB of cloud storage and access to Adobe Fonts and Adobe Stock (with limitations based on your plan).",
  },
  
  // Activation Options
  {
    q: "What does 'Your Email Activation' mean and how does it work?",
    a: "When you choose 'Your Email Activation', your existing Adobe email account will be added to an educational organization that provides access to Adobe Creative Cloud at discounted rates. This means you'll keep using your current Adobe email address, but gain access to educational pricing through our organizational partnership. Your account will be upgraded with full Creative Cloud access while maintaining your existing Adobe ID and any personal settings or files you may have.",
  },
  
  // Purchase Process
  {
    q: "What payment methods do you accept?",
    a: "We currently accept payments through PayPal and credit/debit card with Stripe, which allows you to pay using your PayPal balance, linked bank account, or credit/debit card with Stripe. This ensures your payment information is secure and protected.",
  },
  {
    q: "How quickly will I receive my Adobe account details?",
    a: "In most cases, you will receive your Adobe account information immediately after your payment is confirmed. The details will be sent to the email address you provided during checkout. Occasionally, during periods of high demand, delivery may take up to 24 hours, but this is rare.",
  },
  {
    q: "Is my personal information and payment data secure?",
    a: "Absolutely. We use industry-standard SSL encryption to protect all data transmission. Payment processing is handled through secure, PCI-compliant payment processors (PayPal and Stripe), so we never store your payment information on our servers. Your privacy and security are our top priorities.",
  },
  
  // Usage & Features
  {
    q: "Can I use these accounts on multiple devices?",
    a: "Yes, Adobe Creative Cloud allows you to install and use the applications on up to 2 devices simultaneously with a single subscription. You can activate and deactivate devices as needed through your Adobe account settings, giving you flexibility to use your subscription across your desktop, laptop, or other devices.",
  },
  {
    q: "Are there any restrictions on commercial use?",
    a: "No, these are full Adobe Creative Cloud subscriptions with complete commercial usage rights. You can use all applications for personal projects, client work, commercial designs, and business purposes just as you would with a subscription purchased directly from Adobe. There are no limitations on commercial use.",
  },
  {
    q: "How do updates and new features work?",
    a: "Your Adobe Creative Cloud subscription includes automatic updates and access to new features as they're released by Adobe. The Creative Cloud desktop app will notify you of available updates, and you can install them just like with any regular Adobe subscription. You'll always have access to the latest versions of all applications.",
  },
  
  // Support & Policies
  {
    q: "What is your refund policy?",
    a: "We offer a 3-day money-back guarantee if you are unable to access the Adobe Creative Cloud services with the credentials provided. If you encounter any issues, please contact our support team at support@cheapcc.online with your order details, and we'll assist you promptly.",
  },
  {
    q: "What happens if my Adobe account stops working?",
    a: "In the rare event that your Adobe account experiences issues, we provide full support to resolve the problem quickly. We offer replacement accounts when necessary and have a dedicated support team available to assist you. Most issues are resolved within 24 hours, and we stand behind our service with our money-back guarantee.",
  },
  {
    q: "What if I need help with Adobe software itself?",
    a: "While we provide support for account access and delivery issues, technical support for using Adobe software is provided directly by Adobe through their official support channels, tutorials, and community forums. Your subscription includes access to Adobe's extensive learning resources and help documentation.",
  },
  
  // Account Management
  {
    q: "Can I upgrade or downgrade my subscription plan?",
    a: "Since these are discounted Adobe Creative Cloud accounts, plan changes need to be handled through our support team. Contact us at support@cheapcc.online with your current order details and desired plan change. We'll work with you to find the best solution, which may involve purchasing a new subscription at our discounted rates.",
  },
  {
    q: "Can I cancel my subscription anytime?",
    a: "Our subscriptions are sold for specific time periods (1 month, 6 months, or 1 year) and are one-time purchases rather than recurring subscriptions. There are no automatic renewals or cancellation fees. When your subscription period ends, you can choose to purchase a new subscription if you wish to continue using Adobe Creative Cloud.",
  },
  
  // Business Options
  {
    q: "Do you offer bulk discounts for teams or businesses?",
    a: "Yes, we offer additional discounts for bulk purchases of 5 or more subscriptions. Contact our sales team at support@cheapcc.online with your requirements, and we'll provide you with a custom quote. Bulk purchases are perfect for creative agencies, design teams, educational institutions, and businesses.",
  },
  
  // Advanced Features & Compatibility
  {
    q: "Are all Adobe Creative Cloud features included?",
    a: "Absolutely! You get access to all Adobe Creative Cloud features including Adobe Fonts, Adobe Stock (with plan limitations), Creative Cloud Libraries, cloud sync, collaboration tools, and all premium features. This includes advanced features like Content-Aware Fill in Photoshop, Auto Reframe in Premiere Pro, and all AI-powered tools like Adobe Firefly integration.",
  },
  {
    q: "Can I use Adobe plugins and extensions?",
    a: "Yes, your subscription includes full support for all Adobe plugins, extensions, and third-party integrations. You can install plugins from the Adobe Exchange marketplace, use popular extensions like BRAW Studio for Premiere Pro, or integrate with services like Frame.io. All marketplace content and extensions work exactly as they would with an official Adobe subscription.",
  },
  {
    q: "What about Adobe Stock and Adobe Fonts access?",
    a: "Your Creative Cloud subscription includes access to Adobe Fonts (previously Typekit) with thousands of fonts for web and desktop use. Adobe Stock access varies by plan - you'll receive the same stock credits and licensing as the equivalent official Adobe plan. All fonts and stock assets can be used commercially in your projects.",
  },
  
  // Technical Support & Reliability
  {
    q: "How reliable are these accounts compared to official Adobe subscriptions?",
    a: "Our accounts are genuine Adobe Creative Cloud subscriptions with the same reliability and uptime as official Adobe accounts. They're backed by Adobe's infrastructure and receive the same priority support from Adobe's servers. We maintain a 99.9% uptime rate and provide immediate replacement if any technical issues occur.",
  },
  {
    q: "What happens during Adobe's major updates or new releases?",
    a: "You'll receive all major Adobe updates and new software releases automatically, just like official subscribers. When Adobe releases new applications (like Adobe Fresco or Adobe Aero) or major version updates, they're immediately available in your Creative Cloud desktop app. There are no delays or restrictions on accessing new features.",
  },
];

export default function HomeFAQSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });
  const titleRef = useRef<HTMLHeadingElement>(null);
  const titleInView = useInView(titleRef, { once: false, margin: "-100px 0px" });
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [particles, setParticles] = useState<Array<{x: number, y: number, size: number, color: string}>>([]);

  // Generate particles for background effect
  useEffect(() => {
    const newParticles = Array.from({ length: 20 }).map(() => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 1 + Math.random() * 3,
      color: `rgba(${Math.floor(200 + Math.random() * 55)}, ${Math.floor(40 + Math.random() * 40)}, ${Math.floor(80 + Math.random() * 40)}, ${0.1 + Math.random() * 0.3})`
    }));
    setParticles(newParticles);
  }, []);

  // Animation variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.3 }
    }
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 100, damping: 15 }
    }
  };

  const faqVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({ 
      opacity: 1, 
      y: 0,
      transition: { 
        delay: 0.1 * i,
        duration: 0.6,
        ease: [0.215, 0.61, 0.355, 1]
      }
    })
  };

  // Generate FAQ Schema
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": HOME_FAQS.map(faq => ({
      "@type": "Question",
      "name": faq.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.a
      }
    }))
  };

  return (
    <>
      {/* FAQ Schema */}
      <Script
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      
      <section className="relative py-20 pb-28 md:py-32 md:pb-40 overflow-hidden" id="faq" ref={sectionRef}>
      {/* Floating particles */}
      {particles.map((particle, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
          }}
          animate={{
            y: [0, -20, 0],
            x: [0, Math.random() * 20 - 10, 0],
            opacity: [0.1, 0.8, 0.1]
          }}
          transition={{
            duration: 5 + Math.random() * 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 5
          }}
        />
      ))}

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          className="text-center mb-12 sm:mb-16"
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={containerVariants}
        >
          <motion.h2 
            ref={titleRef}
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6"
            variants={itemVariants}
            style={{ 
              textShadow: '0 0 20px rgba(255, 51, 102, 0.3)',
              transform: titleInView ? "perspective(1000px) rotateX(0deg)" : "perspective(1000px) rotateX(10deg)",
              willChange: 'transform'
            }}
          >
            <motion.span 
              className="inline-block"
              animate={{ 
                y: [0, -5, 0],
                x: [0, 2, 0]
              }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            >
              Frequently
            </motion.span>
            <motion.span 
              className="bg-gradient-to-r from-fuchsia-500 via-pink-500 to-red-500 bg-clip-text text-transparent inline-block"
              animate={{ 
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
              }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
              style={{ 
                backgroundSize: "200% 100%",
                willChange: 'background-position'
              }}
            >
              &nbsp;Asked Questions
            </motion.span>
          </motion.h2>
          <motion.p 
            variants={itemVariants}
            className="text-white/80 mx-auto mb-8 text-base sm:text-lg font-light tracking-wide max-w-2xl"
          >
            Quick answers to common questions about our Adobe Creative Cloud subscriptions
          </motion.p>
        </motion.div>

        <motion.div 
          className="max-w-3xl mx-auto"
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={containerVariants}
        >
          {HOME_FAQS.map((item, idx) => (
            <motion.div
              key={idx}
              custom={idx}
              variants={faqVariants}
              className={`mb-6 relative z-10 backdrop-blur-sm border transform transition-all duration-500 ${
                openFaq === idx 
                  ? 'border-pink-500/30 shadow-[0_0_25px_rgba(219,39,119,0.15)]' 
                  : 'border-white/10 hover:border-white/20'
              } rounded-xl overflow-hidden`}
            >
              <motion.div
                className={`p-5 sm:p-6 flex justify-between items-center cursor-pointer ${
                  openFaq === idx ? 'bg-white/10' : 'bg-white/5'
                }`}
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                tabIndex={0}
                role="button"
                aria-expanded={openFaq === idx}
                onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && setOpenFaq(openFaq === idx ? null : idx)}
                whileHover={{ 
                  backgroundColor: openFaq === idx ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.1)'
                }}
                transition={{ duration: 0.2 }}
              >
                <h3 className="text-lg sm:text-xl font-medium text-white pr-10">{item.q}</h3>
                <motion.div 
                  className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white"
                  animate={{ rotate: openFaq === idx ? 45 : 0 }}
                  transition={{ duration: 0.4, ease: [0.215, 0.61, 0.355, 1] }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                </motion.div>
              </motion.div>

              <AnimatePresence>
                {openFaq === idx && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.4, ease: [0.215, 0.61, 0.355, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-0 border-t border-white/10">
                      <motion.p 
                        className="text-gray-300 pt-4"
                        initial={{ y: -10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                      >
                        {item.a}
                      </motion.p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>

        <motion.div 
          className="text-center mt-10 sm:mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <motion.a 
            href="/faq" 
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm sm:text-base font-medium hover:bg-white/15 transition-all duration-300"
            whileHover={{ 
              scale: 1.05, 
              boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.2)",
              borderColor: "rgba(255, 255, 255, 0.3)"
            }}
            whileTap={{ scale: 0.98 }}
          >
            <span>View All FAQs</span> 
            <motion.span
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, repeatType: "loop", ease: "easeInOut" }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </motion.span>
          </motion.a>
        </motion.div>
      </div>
    </section>
    </>
  );
}