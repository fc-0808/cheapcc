"use client";

import { useEffect, useState, useRef } from "react";
import Script from "next/script";
import { PRODUCT, PRICING_OPTIONS } from "@/utils/products";

// --- Testimonials Data ---
const TESTIMONIALS = [
  {
    name: "Alex J.",
    title: "Designer, Freelancer",
    text: "CheapCC saved me hundreds! The process was smooth and I got my Adobe account instantly. Highly recommended!",
    rating: 5,
  },
  {
    name: "Maria S.",
    title: "Marketing Lead",
    text: "I was skeptical at first, but the subscription is 100% genuine. Support was super responsive too.",
    rating: 5,
  },
  {
    name: "David P.",
    title: "Student",
    text: "As a student, this is a game changer. All apps, no issues, and a fraction of the price.",
    rating: 5,
  },
  {
    name: "Priya K.",
    title: "Photographer",
    text: "The best deal for Adobe CC online. Fast delivery and great customer service!",
    rating: 5,
  },
];

export default function Home() {
  const [selectedPrice, setSelectedPrice] = useState<string>(PRICING_OPTIONS[0].id);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'loading' | 'success' | 'error' | 'cancel'>('idle');
  const [orderID, setOrderID] = useState<string | null>(null);
  const [sdkReady, setSdkReady] = useState<boolean>(false);
  const [sdkError, setSdkError] = useState<boolean>(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [formError, setFormError] = useState('');
  const paypalButtonContainerRef = useRef<HTMLDivElement>(null);

  // --- FAQ Accordion State ---
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // --- Testimonials Carousel State ---
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  const testimonialTimeout = useRef<NodeJS.Timeout | null>(null);

  // Social proof counter animation
  const counterRef = useRef<HTMLDivElement>(null);
  const [counterVisible, setCounterVisible] = useState(false);
  const [counters, setCounters] = useState([
    { value: 0, target: 150, label: 'Happy Customers', icon: 'fas fa-users' },
    { value: 0, target: 250, label: 'Successful Activations', icon: 'fas fa-check-circle' },
    { value: 0, target: 99, label: 'Customer Satisfaction', icon: 'fas fa-star' },
    { value: 0, target: 24, label: 'Support Availability', icon: 'fas fa-headset', suffix: '/7' },
  ]);
  const [animated, setAnimated] = useState(false);

  // Validate email format
  const isValidEmail = (email: string) => /.+@.+\..+/.test(email);

  // Function to handle when the PayPal SDK is loaded
  const handlePayPalLoad = () => {
    setSdkReady(true);
    setSdkError(false);
  };

  const handlePayPalError = () => {
    setSdkError(true);
  };

  // Initialize PayPal buttons when the SDK is loaded
  useEffect(() => {
    if (!sdkReady || !name || !isValidEmail(email)) return;
    if (paypalButtonContainerRef.current) {
      paypalButtonContainerRef.current.innerHTML = '';
    }
    if (typeof window !== 'undefined' && window.paypal) {
      window.paypal.Buttons({
        createOrder: async () => {
          try {
            setPaymentStatus('loading');
            const response = await fetch('/api/orders', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ priceId: selectedPrice, name, email }),
            });
            const orderData = await response.json();
            if (orderData.error) {
              throw new Error(orderData.error);
            }
            setOrderID(orderData.id);
            return orderData.id;
          } catch (error) {
            setPaymentStatus('error');
            throw error;
          }
        },
        onApprove: async (data: any, actions: any) => {
          try {
            setPaymentStatus('loading');
            const response = await fetch('/api/orders/capture', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ orderID: data.orderID }),
            });
            const captureData = await response.json();
            if (captureData.error) {
              throw new Error(captureData.error);
            }
            setPaymentStatus('success');
          } catch (error) {
            setPaymentStatus('error');
          }
        },
        onCancel: () => {
          setPaymentStatus('cancel');
        },
        onError: (err: Error) => {
          setPaymentStatus('error');
        },
      }).render('#paypal-button-container');
    }
  }, [sdkReady, selectedPrice, name, email]);

  const selectedPriceOption = PRICING_OPTIONS.find(option => option.id === selectedPrice)!;
  const canPay = name.trim() && isValidEmail(email);

  // Testimonials auto-rotate
  useEffect(() => {
    if (testimonialTimeout.current) clearTimeout(testimonialTimeout.current);
    testimonialTimeout.current = setTimeout(() => {
      setTestimonialIdx((idx) => (idx + 1) % TESTIMONIALS.length);
    }, 6000);
    return () => { if (testimonialTimeout.current) clearTimeout(testimonialTimeout.current); };
  }, [testimonialIdx]);

  useEffect(() => {
    function onScroll() {
      if (!counterRef.current) return;
      const rect = counterRef.current.getBoundingClientRect();
      if (rect.top < window.innerHeight - 100) {
        setCounterVisible(true);
      }
    }
    window.addEventListener('scroll', onScroll);
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (counterVisible && !animated) {
      setAnimated(true);
      const durations = [1200, 1200, 1200, 1200];
      counters.forEach((counter, idx) => {
        let start = 0;
        const end = counter.target;
        const duration = durations[idx];
        const startTime = performance.now();
        function animate(now: number) {
          const elapsed = now - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const current = Math.floor(progress * (end - start) + start);
          setCounters(prev => {
            const updated = [...prev];
            updated[idx] = { ...updated[idx], value: current };
            return updated;
          });
          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
            setCounters(prev => {
              const updated = [...prev];
              updated[idx] = { ...updated[idx], value: end };
              return updated;
            });
          }
        }
        requestAnimationFrame(animate);
      });
    }
  }, [counterVisible, animated]);

  return (
    <main className="bg-white">
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="savings-badge">
            <i className="fas fa-tags" /> Save up to 86% vs Official Pricing
          </div>
          <h1>
            Unleash Your Creativity with<br />
            <span className="highlight">
              Adobe Creative Cloud
              <span className="highlight-underline" />
            </span>
          </h1>
          <p>
            Get the complete suite with all premium applications at a fraction of the official cost. Same powerful tools, same features, massive savings.
          </p>
          <div className="hero-features">
            <div className="hero-feature">
              <i className="fas fa-check-circle" /> All Creative Cloud Apps
            </div>
            <div className="hero-feature">
              <i className="fas fa-check-circle" /> 100GB Cloud Storage
            </div>
            <div className="hero-feature">
              <i className="fas fa-check-circle" /> Adobe Firefly Included
            </div>
          </div>
          <a href="#pricing" className="primary-btn">
            <i className="fas fa-bolt" /> View Plans & Pricing
          </a>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="social-proof bg-gradient-to-br from-[#2c2d5a] to-[#1e0029] py-12">
        <div className="container">
          <div
            className={`counter-container flex flex-wrap justify-center gap-6${counterVisible ? ' visible' : ''}`}
            ref={counterRef}
          >
            {counters.map((counter, idx) => (
              <div key={counter.label} className={`counter-item${counterVisible ? ' visible' : ''}`}>
                <i className={`${counter.icon} text-2xl`} />
                <div className={`counter-value${animated ? ' animated' : ''}`}>
                  {counter.value}
                  {counter.suffix || (counter.label === 'Customer Satisfaction' ? '%' : '+')}
                </div>
                <div className="counter-label">{counter.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="benefits py-20 bg-white">
        <div className="container">
          <div className="section-heading text-center mb-12">
            <h2 className="text-4xl font-extrabold bg-gradient-to-r from-[#2c2d5a] to-[#484a9e] bg-clip-text text-transparent inline-block mb-2">
              Why Choose CheapCC?
            </h2>
            <p className="text-lg text-gray-500 max-w-xl mx-auto">
              Authorized Adobe Creative Cloud subscriptions at significantly reduced prices compared to official channels
            </p>
          </div>
          <div className="benefits-container grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto mt-12">
            <div className="benefit-card">
              <i className="fas fa-piggy-bank" />
              <h3>Massive Savings</h3>
              <p>Pay up to 86% less than official Adobe pricing while getting the exact same product and benefits.</p>
            </div>
            <div className="benefit-card">
              <i className="fas fa-bolt" />
              <h3>Email Delivery</h3>
              <p>Receive your Adobe account details via email after purchase with all apps ready to download.</p>
            </div>
            <div className="benefit-card">
              <i className="fas fa-check-circle" />
              <h3>100% Genuine</h3>
              <p>Full access to all Creative Cloud apps and services with regular updates and cloud storage.</p>
            </div>
            <div className="benefit-card">
              <i className="fas fa-exchange-alt" />
              <h3>Alternative to cheapcc.net</h3>
              <p>cheapcc.online is your alternative destination to cheapcc.net for affordable Adobe Creative Cloud subscriptions.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="pricing py-20 bg-gradient-to-b from-[#f3f4f6] to-white border-t border-b border-gray-100" id="pricing">
        <div className="container">
          <div className="section-heading text-center mb-12">
            <h2 className="text-4xl font-extrabold text-[#2c2d5a] mb-2">Choose Your Plan</h2>
            <p className="text-lg text-gray-500">Select the subscription duration that works best for you</p>
          </div>
          <div className="plans-container flex flex-wrap gap-6 justify-center">
            {PRICING_OPTIONS.map((option) => (
              <div
                key={option.id}
                className={`plan-card${selectedPrice === option.id ? ' selected' : ''}`}
                onClick={() => setSelectedPrice(option.id)}
                tabIndex={0}
                role="button"
                aria-pressed={selectedPrice === option.id}
                onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && setSelectedPrice(option.id)}
              >
                <div className="plan-duration">{option.duration}</div>
                <div className="plan-price">${option.price}</div>
                <div className="plan-features text-left mt-4 mb-6">
                  <ul className="space-y-2">
                    <li>All Creative Cloud Apps</li>
                    <li>100GB Cloud Storage</li>
                    <li>Email Delivery</li>
                  </ul>
                </div>
                <button className="select-btn w-full">{selectedPrice === option.id ? 'Selected' : 'Select'}</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works py-20 bg-white">
        <div className="container">
          <div className="section-heading text-center mb-12">
            <h2 className="text-4xl font-extrabold text-[#2c2d5a] mb-2">How It Works</h2>
            <p className="text-lg text-gray-500">Getting your Adobe Creative Cloud subscription is simple and fast</p>
          </div>
          <div className="steps-container flex flex-wrap gap-8 justify-center">
            <div className="step bg-[#f9fafb] rounded-xl shadow p-8 text-center min-w-[220px] max-w-[320px] flex-1">
              <div className="step-number bg-gradient-to-r from-[#ff3366] to-[#ff9966] text-white text-2xl font-bold w-14 h-14 flex items-center justify-center rounded-full mx-auto mb-4 shadow">
                1
              </div>
              <h3 className="text-lg font-bold mb-2 text-[#2c2d5a]">Choose a Plan</h3>
              <p className="text-gray-500 text-base">Select the subscription duration that best fits your needs.</p>
            </div>
            <div className="step bg-[#f9fafb] rounded-xl shadow p-8 text-center min-w-[220px] max-w-[320px] flex-1">
              <div className="step-number bg-gradient-to-r from-[#ff3366] to-[#ff9966] text-white text-2xl font-bold w-14 h-14 flex items-center justify-center rounded-full mx-auto mb-4 shadow">
                2
              </div>
              <h3 className="text-lg font-bold mb-2 text-[#2c2d5a]">Complete Purchase</h3>
              <p className="text-gray-500 text-base">Enter your email and pay securely with PayPal.</p>
            </div>
            <div className="step bg-[#f9fafb] rounded-xl shadow p-8 text-center min-w-[220px] max-w-[320px] flex-1">
              <div className="step-number bg-gradient-to-r from-[#ff3366] to-[#ff9966] text-white text-2xl font-bold w-14 h-14 flex items-center justify-center rounded-full mx-auto mb-4 shadow">
                3
              </div>
              <h3 className="text-lg font-bold mb-2 text-[#2c2d5a]">Receive Details</h3>
              <p className="text-gray-500 text-base">Get your Adobe account information delivered via email.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Checkout Section */}
      <section className="checkout py-20 bg-[#f3f4f6]">
        <div className="container">
          <div className="section-heading text-center mb-12">
            <h2 className="text-4xl font-extrabold text-[#2c2d5a] mb-2">Complete Your Order</h2>
            <p className="text-lg text-gray-500">You're just moments away from accessing Adobe Creative Cloud</p>
          </div>
          <div className="checkout-container flex flex-wrap gap-8 justify-center items-start">
            <div className="checkout-form w-full max-w-md">
              <form id="checkout-form" onSubmit={e => e.preventDefault()} className="space-y-6">
                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    placeholder="Where we'll send your account details"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    autoComplete="email"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="name">Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    placeholder="Your name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    autoComplete="name"
                  />
                </div>
                <div className="form-group">
                  <Script
                    src={`https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'sb'}&currency=USD&intent=capture`}
                    strategy="afterInteractive"
                    onLoad={handlePayPalLoad}
                    onError={handlePayPalError}
                  />
                  <div
                    id="paypal-button-container"
                    ref={paypalButtonContainerRef}
                    className={!canPay ? 'opacity-50 pointer-events-none' : ''}
                  />
                  {!canPay && (
                    <p className="form-note text-[#ef4444]">Please enter your name and a valid email to continue.</p>
                  )}
                </div>
                {paymentStatus === 'loading' && (
                  <div className="form-note flex items-center gap-2">
                    <span className="inline-block w-6 h-6 border-2 border-[#b9a7d1] border-b-transparent rounded-full animate-spin"></span>
                    Processing payment...
                  </div>
                )}
                {paymentStatus === 'success' && (
                  <div className="form-note bg-[#d1fae5] text-[#065f46] p-4 rounded-md">
                    Payment successful! Check your email for access details.
                  </div>
                )}
                {paymentStatus === 'error' && (
                  <div className="form-note bg-[#fee2e2] text-[#991b1b] p-4 rounded-md">
                    There was an error processing your payment. Please try again.
                  </div>
                )}
                <p className="form-disclaimer">
                  By completing your purchase, you agree to our{' '}
                  <a href="/terms">Terms of Service</a> and{' '}
                  <a href="/privacy">Privacy Policy</a>.
                </p>
              </form>
            </div>
            <div className="selected-plan-summary w-full max-w-sm">
              <h3>Your Selected Plan <span>{selectedPriceOption.name}</span></h3>
              <p>Subscription Duration <span>{selectedPriceOption.duration}</span></p>
              <p>Regular Price <span className="line-through text-gray-400">${selectedPriceOption.price * 4}</span></p>
              <p>Your Savings <span className="text-[#10b981]">{Math.round(100 - (selectedPriceOption.price / (selectedPriceOption.price * 4)) * 100)}%</span></p>
              <p>Total <span className="text-[#2c2d5a] font-bold">${selectedPriceOption.price}</span></p>
              <div className="trust-guarantee">
                <div className="guarantee-badge"><i className="fas fa-check" /> 100% Satisfaction Guarantee</div>
                <div className="guarantee-badge"><i className="fas fa-check" /> 24/7 Customer Support</div>
                <div className="guarantee-badge"><i className="fas fa-check" /> Email Delivery</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq py-20 bg-white" id="faq">
        <div className="container">
          <div className="section-heading text-center mb-12">
            <h2 className="text-4xl font-extrabold text-[#2c2d5a] mb-2">Frequently Asked Questions</h2>
            <p className="text-lg text-gray-500">Quick answers to common questions about our Adobe Creative Cloud subscriptions</p>
          </div>
          <div className="faq-accordion">
            {[
              {
                q: "How does cheapcc.online offer such low prices?",
                a: "As an alternative to cheapcc.net, we specialize in offering Adobe Creative Cloud subscriptions at significantly reduced prices. We achieve these savings through volume licensing agreements and strategic partnerships that allow us to pass the savings onto you. This is why we can offer up to 86% off compared to Adobe's official pricing while providing the same authentic product.",
              },
              {
                q: "Are these genuine Adobe Creative Cloud subscriptions?",
                a: "Yes, absolutely. You will receive genuine Adobe Creative Cloud accounts with full access to all Creative Cloud applications and services. The subscriptions include regular updates, cloud storage, and all the features you would get from purchasing directly from Adobe, but at a much lower price.",
              },
              {
                q: "How quickly will I receive my Adobe account details?",
                a: "In most cases, you will receive your Adobe account information immediately after your payment is confirmed. The details will be sent to the email address you provided during checkout. Occasionally, during periods of high demand, delivery may take up to 24 hours, but this is rare.",
              },
              {
                q: "What payment methods do you accept?",
                a: "We currently accept payments through PayPal, which allows you to pay using your PayPal balance, linked bank account, or credit/debit card. This ensures your payment information is secure and protected.",
              },
              {
                q: "What is your refund policy?",
                a: "We offer a 7-day money-back guarantee if you are unable to access the Adobe Creative Cloud services with the credentials provided. If you encounter any issues, please contact our support team at support@cheapcc.online with your order details, and we'll assist you promptly.",
              },
            ].map((item, idx) => (
              <div
                key={item.q}
                className={`faq-item${openFaq === idx ? ' active' : ''}`}
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                tabIndex={0}
                role="button"
                aria-expanded={openFaq === idx}
                onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && setOpenFaq(openFaq === idx ? null : idx)}
              >
                <div className="faq-question">
                  <h3>{item.q}</h3>
                  <span className={`faq-icon${openFaq === idx ? ' open' : ''}`}><i className="fas fa-chevron-down" /></span>
                </div>
                <div
                  className={`faq-answer${openFaq === idx ? ' open' : ''}`}
                  style={{ maxHeight: openFaq === idx ? 300 : 0, opacity: openFaq === idx ? 1 : 0 }}
                >
                  <p>{item.a}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="view-all-faqs text-center mt-10">
            <a href="/faq" className="btn btn-outline inline-flex items-center gap-2 px-6 py-2 rounded-full border border-[#b9a7d1] text-[#2c2d5a] font-semibold hover:bg-[#f3f4f6] transition">
              <span>View All FAQs</span> <i className="fas fa-arrow-right" />
            </a>
          </div>
        </div>
      </section>

      {/* Testimonials Carousel Section */}
      <section className="testimonials py-20 bg-gradient-to-b from-white to-[#f3f4f6] border-t border-gray-100">
        <div className="container">
          <div className="section-heading text-center mb-12">
            <h2 className="text-4xl font-extrabold text-[#2c2d5a] mb-2">What Our Customers Say</h2>
            <p className="text-lg text-gray-500">Real feedback from real users</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="testimonial-card" key={testimonialIdx}>
              <div className="testimonial-rating">
                {Array.from({ length: 5 }).map((_, i) => (
                  <i key={i} className={`fas fa-star${i < TESTIMONIALS[testimonialIdx].rating ? '' : ' inactive'}`}></i>
                ))}
              </div>
              <div className="testimonial-text">"{TESTIMONIALS[testimonialIdx].text}"</div>
              <div className="testimonial-author flex items-center gap-4 mt-4">
                <div className="author-image">
                  {TESTIMONIALS[testimonialIdx].name[0]}
                </div>
                <div className="author-details">
                  <div className="author-name">{TESTIMONIALS[testimonialIdx].name}</div>
                  <div className="author-title">{TESTIMONIALS[testimonialIdx].title}</div>
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              {TESTIMONIALS.map((_, idx) => (
                <button
                  key={idx}
                  className={`btn btn-outline${testimonialIdx === idx ? ' active' : ''}`}
                  style={{ width: 12, height: 12, borderRadius: '50%', padding: 0, minWidth: 0, minHeight: 0, borderWidth: 2, borderColor: testimonialIdx === idx ? '#ff3366' : '#b9a7d1', background: testimonialIdx === idx ? '#ff3366' : 'transparent' }}
                  aria-label={`Show testimonial ${idx + 1}`}
                  onClick={() => setTestimonialIdx(idx)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
