import { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'What is CheapCC? - Adobe Creative Cloud Discount Service Explained',
  description: 'What is CheapCC? CheapCC is a service that provides genuine Adobe Creative Cloud subscriptions at 83% off official pricing. Learn how CheapCC works and why it\'s trusted by 10,000+ customers.',
  keywords: 'what is cheapcc, cheapcc explained, cheapcc service, how does cheapcc work, cheapcc adobe creative cloud',
  alternates: {
    canonical: 'https://cheapcc.online/what-is-cheapcc'
  },
  openGraph: {
    title: 'What is CheapCC? Adobe CC Discount Service Explained',
    description: 'CheapCC provides genuine Adobe Creative Cloud subscriptions at 83% off official pricing. Trusted by 10,000+ customers worldwide.',
    url: 'https://cheapcc.online/what-is-cheapcc',
    siteName: 'CheapCC',
    locale: 'en_US',
    type: 'article',
  },
  robots: {
    index: true,
    follow: true,
  }
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is CheapCC?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "CheapCC is a service that provides genuine Adobe Creative Cloud subscriptions at up to 83% off Adobe's official pricing. Customers receive authentic Adobe CC accounts with full access to all Creative Cloud applications, cloud storage, and features for a fraction of the official cost."
      }
    },
    {
      "@type": "Question", 
      "name": "How does CheapCC work?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "CheapCC works by leveraging volume licensing agreements and strategic partnerships to offer genuine Adobe Creative Cloud subscriptions at discounted rates. After purchase, customers receive authentic Adobe account credentials within 24 hours, providing access to all Adobe applications."
      }
    },
    {
      "@type": "Question",
      "name": "Is CheapCC safe and legitimate?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, CheapCC is safe and legitimate. The service has over 10,000 satisfied customers and maintains a 4.8/5 customer rating. CheapCC provides genuine Adobe Creative Cloud subscriptions with full functionality, regular updates, and commercial usage rights."
      }
    }
  ]
};

export default function WhatIsCheapCCPage() {
  return (
    <>
      <Script
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            
            {/* Featured Snippet Optimized Answer */}
            <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-2xl p-8 mb-12">
              <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-6">
                What is <span className="bg-gradient-to-r from-fuchsia-500 via-pink-500 to-red-500 bg-clip-text text-transparent">CheapCC</span>?
              </h1>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-6">
                <p className="text-xl text-white leading-relaxed">
                  <strong>CheapCC is a service that provides genuine Adobe Creative Cloud subscriptions at up to 83% off Adobe's official pricing.</strong> Customers receive authentic Adobe CC accounts with full access to all Creative Cloud applications, 100GB cloud storage, and premium features for just $14.99/month instead of Adobe's $79.99/month.
                </p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400">83% Off</div>
                  <div className="text-white/70">Adobe Official Pricing</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400">10,000+</div>
                  <div className="text-white/70">Happy Customers</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400">4.8/5</div>
                  <div className="text-white/70">Customer Rating</div>
                </div>
              </div>
            </div>

            {/* How CheapCC Works */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 mb-12">
              <h2 className="text-3xl font-bold text-white mb-8">How Does CheapCC Work?</h2>
              
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-shopping-cart text-2xl text-white"></i>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">1. Choose Your Plan</h3>
                  <p className="text-white/80">Select from our affordable Adobe Creative Cloud subscription plans starting at $14.99/month.</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-credit-card text-2xl text-white"></i>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">2. Secure Payment</h3>
                  <p className="text-white/80">Complete your purchase using our secure payment system with multiple payment options.</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-bolt text-2xl text-white"></i>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">3. Instant Access</h3>
                  <p className="text-white/80">Receive your genuine Adobe Creative Cloud account credentials within 24 hours via email.</p>
                </div>
              </div>
            </div>

            {/* What You Get */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 mb-12">
              <h2 className="text-3xl font-bold text-white mb-8">What You Get with CheapCC</h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-2xl font-semibold text-white mb-4">✅ All Adobe Applications</h3>
                  <ul className="space-y-2 text-white/80 mb-6">
                    <li>• Adobe Photoshop</li>
                    <li>• Adobe Illustrator</li>
                    <li>• Adobe Premiere Pro</li>
                    <li>• Adobe After Effects</li>
                    <li>• Adobe InDesign</li>
                    <li>• Adobe Lightroom</li>
                    <li>• Adobe XD</li>
                    <li>• Adobe Acrobat Pro</li>
                    <li>• + 12 more applications</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-2xl font-semibold text-white mb-4">✅ Premium Features</h3>
                  <ul className="space-y-2 text-white/80 mb-6">
                    <li>• 100GB Cloud Storage</li>
                    <li>• Adobe Fonts Access</li>
                    <li>• Adobe Firefly AI</li>
                    <li>• Regular Updates</li>
                    <li>• Commercial Usage Rights</li>
                    <li>• Creative Cloud Libraries</li>
                    <li>• Collaboration Tools</li>
                    <li>• Mobile App Access</li>
                    <li>• Priority Support</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Why Choose CheapCC */}
            <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-500/30 rounded-2xl p-8 mb-12">
              <h2 className="text-3xl font-bold text-white mb-8 text-center">Why Choose CheapCC Over Adobe Official?</h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex items-start">
                    <i className="fas fa-dollar-sign text-green-400 mr-3 mt-1"></i>
                    <div>
                      <h4 className="font-semibold text-white">Massive Savings</h4>
                      <p className="text-white/80">Save $780 per year compared to Adobe's official pricing</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <i className="fas fa-shield-check text-green-400 mr-3 mt-1"></i>
                    <div>
                      <h4 className="font-semibold text-white">Genuine Adobe CC</h4>
                      <p className="text-white/80">100% authentic Adobe Creative Cloud subscriptions</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <i className="fas fa-clock text-green-400 mr-3 mt-1"></i>
                    <div>
                      <h4 className="font-semibold text-white">Instant Delivery</h4>
                      <p className="text-white/80">Get your account within 24 hours of purchase</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start">
                    <i className="fas fa-users text-green-400 mr-3 mt-1"></i>
                    <div>
                      <h4 className="font-semibold text-white">Trusted Service</h4>
                      <p className="text-white/80">10,000+ satisfied customers worldwide</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <i className="fas fa-star text-green-400 mr-3 mt-1"></i>
                    <div>
                      <h4 className="font-semibold text-white">Excellent Reviews</h4>
                      <p className="text-white/80">4.8/5 customer satisfaction rating</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <i className="fas fa-headset text-green-400 mr-3 mt-1"></i>
                    <div>
                      <h4 className="font-semibold text-white">24/7 Support</h4>
                      <p className="text-white/80">Responsive customer service when you need it</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA Section */}
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-6">Ready to Experience CheapCC?</h2>
              <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
                Join thousands of creatives who've discovered the smart way to get Adobe Creative Cloud for less.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/#pricing"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-fuchsia-500 via-pink-500 to-rose-600 text-white font-semibold text-lg shadow-lg shadow-red-500/30 border border-white/20 hover:scale-105 transition-transform"
                >
                  Get CheapCC Now - Save 83%
                  <i className="fas fa-arrow-right"></i>
                </Link>
                
                <Link
                  href="/cheapcc-review"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold text-lg hover:bg-white/20 transition-colors"
                >
                  Read Customer Reviews
                  <i className="fas fa-star"></i>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
