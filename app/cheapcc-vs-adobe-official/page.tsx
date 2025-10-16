import { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'CheapCC vs Adobe Official Pricing 2025 - Save 83% on Creative Cloud',
  description: 'CheapCC vs Adobe official pricing comparison. Get genuine Adobe Creative Cloud for $14.99/month vs Adobe\'s $79.99/month. Same apps, 83% savings.',
  keywords: 'cheapcc vs adobe, cheapcc vs adobe official, adobe official pricing, cheapcc pricing, adobe creative cloud cost comparison, cheapcc review',
  alternates: {
    canonical: 'https://cheapcc.online/cheapcc-vs-adobe-official'
  },
  openGraph: {
    title: 'CheapCC vs Adobe Official - Save 83% on Creative Cloud',
    description: 'Side-by-side comparison: CheapCC $14.99/month vs Adobe Official $79.99/month. Same Adobe CC apps, massive savings.',
    url: 'https://cheapcc.online/cheapcc-vs-adobe-official',
    siteName: 'CheapCC',
    locale: 'en_US',
    type: 'article',
  },
  robots: {
    index: true,
    follow: true,
  }
};

const comparisonSchema = {
  "@context": "https://schema.org",
  "@type": "ComparisonTable",
  "name": "CheapCC vs Adobe Official Pricing Comparison",
  "description": "Detailed comparison between CheapCC and Adobe official pricing for Creative Cloud subscriptions",
  "mainEntity": [
    {
      "@type": "Product",
      "name": "CheapCC Adobe Creative Cloud",
      "offers": {
        "@type": "Offer",
        "price": "14.99",
        "priceCurrency": "USD",
        "priceValidUntil": "2025-12-31"
      }
    },
    {
      "@type": "Product", 
      "name": "Adobe Creative Cloud Official",
      "offers": {
        "@type": "Offer",
        "price": "79.99",
        "priceCurrency": "USD"
      }
    }
  ]
};

export default function CheapCCVsAdobeOfficialPage() {
  return (
    <>
      <Script
        id="comparison-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(comparisonSchema) }}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-6xl mx-auto">
            
            {/* Header */}
            <div className="text-center mb-16">
              <h1 className="text-5xl md:text-6xl font-extrabold text-white leading-tight mb-6">
                <span className="bg-gradient-to-r from-fuchsia-500 via-pink-500 to-red-500 bg-clip-text text-transparent">CheapCC</span> vs 
                <span className="text-white"> Adobe Official</span>
              </h1>
              <p className="text-xl text-white/80 max-w-3xl mx-auto mb-8">
                Side-by-side comparison: Why pay $79.99/month for Adobe Creative Cloud when you can get the exact same apps for $14.99/month with CheapCC?
              </p>
              
              <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-500/30 rounded-2xl p-6 max-w-2xl mx-auto">
                <div className="text-3xl font-bold text-green-400 mb-2">Save $780 Per Year</div>
                <div className="text-white/80">That's 83% off Adobe's official pricing!</div>
              </div>
            </div>

            {/* Main Comparison Table */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 mb-12 overflow-hidden">
              <h2 className="text-3xl font-bold text-white mb-8 text-center">Feature-by-Feature Comparison</h2>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/20">
                      <th className="text-left py-4 px-6 text-white font-semibold">Feature</th>
                      <th className="text-center py-4 px-6">
                        <div className="bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white px-4 py-2 rounded-lg font-bold">
                          CheapCC
                        </div>
                      </th>
                      <th className="text-center py-4 px-6">
                        <div className="bg-gray-600 text-white px-4 py-2 rounded-lg font-bold">
                          Adobe Official
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-white/90">
                    <tr className="border-b border-white/10">
                      <td className="py-4 px-6 font-medium">Monthly Price</td>
                      <td className="text-center py-4 px-6">
                        <div className="text-2xl font-bold text-green-400">$14.99</div>
                      </td>
                      <td className="text-center py-4 px-6">
                        <div className="text-2xl font-bold text-red-400">$79.99</div>
                      </td>
                    </tr>
                    <tr className="border-b border-white/10">
                      <td className="py-4 px-6 font-medium">Annual Savings</td>
                      <td className="text-center py-4 px-6">
                        <div className="text-xl font-bold text-green-400">Save $780</div>
                      </td>
                      <td className="text-center py-4 px-6">
                        <div className="text-xl text-red-400">$0 saved</div>
                      </td>
                    </tr>
                    <tr className="border-b border-white/10">
                      <td className="py-4 px-6 font-medium">All Adobe Apps (20+)</td>
                      <td className="text-center py-4 px-6">
                        <i className="fas fa-check text-2xl text-green-400"></i>
                      </td>
                      <td className="text-center py-4 px-6">
                        <i className="fas fa-check text-2xl text-green-400"></i>
                      </td>
                    </tr>
                    <tr className="border-b border-white/10">
                      <td className="py-4 px-6 font-medium">100GB Cloud Storage</td>
                      <td className="text-center py-4 px-6">
                        <i className="fas fa-check text-2xl text-green-400"></i>
                      </td>
                      <td className="text-center py-4 px-6">
                        <i className="fas fa-check text-2xl text-green-400"></i>
                      </td>
                    </tr>
                    <tr className="border-b border-white/10">
                      <td className="py-4 px-6 font-medium">Adobe Fonts Access</td>
                      <td className="text-center py-4 px-6">
                        <i className="fas fa-check text-2xl text-green-400"></i>
                      </td>
                      <td className="text-center py-4 px-6">
                        <i className="fas fa-check text-2xl text-green-400"></i>
                      </td>
                    </tr>
                    <tr className="border-b border-white/10">
                      <td className="py-4 px-6 font-medium">Adobe Firefly AI</td>
                      <td className="text-center py-4 px-6">
                        <i className="fas fa-check text-2xl text-green-400"></i>
                      </td>
                      <td className="text-center py-4 px-6">
                        <i className="fas fa-check text-2xl text-green-400"></i>
                      </td>
                    </tr>
                    <tr className="border-b border-white/10">
                      <td className="py-4 px-6 font-medium">Regular Updates</td>
                      <td className="text-center py-4 px-6">
                        <i className="fas fa-check text-2xl text-green-400"></i>
                      </td>
                      <td className="text-center py-4 px-6">
                        <i className="fas fa-check text-2xl text-green-400"></i>
                      </td>
                    </tr>
                    <tr className="border-b border-white/10">
                      <td className="py-4 px-6 font-medium">Commercial Usage Rights</td>
                      <td className="text-center py-4 px-6">
                        <i className="fas fa-check text-2xl text-green-400"></i>
                      </td>
                      <td className="text-center py-4 px-6">
                        <i className="fas fa-check text-2xl text-green-400"></i>
                      </td>
                    </tr>
                    <tr className="border-b border-white/10">
                      <td className="py-4 px-6 font-medium">Instant Delivery</td>
                      <td className="text-center py-4 px-6">
                        <div className="text-green-400 font-medium">Within 24 hours</div>
                      </td>
                      <td className="text-center py-4 px-6">
                        <div className="text-white/70">Immediate</div>
                      </td>
                    </tr>
                    <tr className="border-b border-white/10">
                      <td className="py-4 px-6 font-medium">Customer Support</td>
                      <td className="text-center py-4 px-6">
                        <div className="text-green-400 font-medium">24/7 Chat</div>
                      </td>
                      <td className="text-center py-4 px-6">
                        <div className="text-white/70">Business hours</div>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-4 px-6 font-medium">Setup Complexity</td>
                      <td className="text-center py-4 px-6">
                        <div className="text-green-400 font-medium">Simple</div>
                      </td>
                      <td className="text-center py-4 px-6">
                        <div className="text-white/70">Standard</div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Key Differences */}
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 rounded-2xl p-8">
                <h3 className="text-2xl font-bold text-green-400 mb-6 flex items-center">
                  <i className="fas fa-trophy mr-3"></i>
                  Why Choose CheapCC?
                </h3>
                <ul className="space-y-4 text-white/90">
                  <li className="flex items-start">
                    <i className="fas fa-check text-green-400 mr-3 mt-1"></i>
                    <span><strong>83% Savings:</strong> Save $780 per year vs Adobe official pricing</span>
                  </li>
                  <li className="flex items-start">
                    <i className="fas fa-check text-green-400 mr-3 mt-1"></i>
                    <span><strong>Same Adobe Apps:</strong> Genuine Creative Cloud, not alternatives</span>
                  </li>
                  <li className="flex items-start">
                    <i className="fas fa-check text-green-400 mr-3 mt-1"></i>
                    <span><strong>Quick Access:</strong> Get your account within 24 hours</span>
                  </li>
                  <li className="flex items-start">
                    <i className="fas fa-check text-green-400 mr-3 mt-1"></i>
                    <span><strong>500+ Customers:</strong> Trusted by creatives worldwide</span>
                  </li>
                  <li className="flex items-start">
                    <i className="fas fa-check text-green-400 mr-3 mt-1"></i>
                    <span><strong>4.8/5 Rating:</strong> Excellent customer satisfaction</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-gradient-to-br from-gray-500/10 to-gray-600/5 border border-gray-500/20 rounded-2xl p-8">
                <h3 className="text-2xl font-bold text-gray-400 mb-6 flex items-center">
                  <i className="fas fa-building mr-3"></i>
                  Adobe Official
                </h3>
                <ul className="space-y-4 text-white/70">
                  <li className="flex items-start">
                    <i className="fas fa-dollar-sign text-red-400 mr-3 mt-1"></i>
                    <span><strong>Expensive:</strong> $79.99/month = $959.88/year</span>
                  </li>
                  <li className="flex items-start">
                    <i className="fas fa-building text-gray-400 mr-3 mt-1"></i>
                    <span><strong>Corporate Focus:</strong> Designed for large enterprises</span>
                  </li>
                  <li className="flex items-start">
                    <i className="fas fa-clock text-gray-400 mr-3 mt-1"></i>
                    <span><strong>Complex Billing:</strong> Multiple subscription tiers</span>
                  </li>
                  <li className="flex items-start">
                    <i className="fas fa-headset text-gray-400 mr-3 mt-1"></i>
                    <span><strong>Limited Support:</strong> Business hours only</span>
                  </li>
                  <li className="flex items-start">
                    <i className="fas fa-lock text-gray-400 mr-3 mt-1"></i>
                    <span><strong>Long Contracts:</strong> Annual commitments required</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 mb-12">
              <h2 className="text-3xl font-bold text-white mb-8 text-center">Frequently Asked Questions</h2>
              
              <div className="space-y-6">
                <div className="border-b border-white/10 pb-6">
                  <h3 className="text-xl font-semibold text-white mb-3">Is CheapCC the same as Adobe Official?</h3>
                  <p className="text-white/80">Yes! CheapCC provides genuine Adobe Creative Cloud subscriptions with identical functionality. You get the exact same apps, features, updates, and cloud storage as Adobe's official service.</p>
                </div>
                
                <div className="border-b border-white/10 pb-6">
                  <h3 className="text-xl font-semibold text-white mb-3">How can CheapCC offer such low prices?</h3>
                  <p className="text-white/80">CheapCC achieves these savings through volume licensing agreements and strategic partnerships, allowing us to pass significant discounts to customers while maintaining the same authentic Adobe experience.</p>
                </div>
                
                <div className="border-b border-white/10 pb-6">
                  <h3 className="text-xl font-semibold text-white mb-3">Will I get Adobe updates with CheapCC?</h3>
                  <p className="text-white/80">Absolutely! Your CheapCC subscription includes all regular Adobe updates, new features, and security patches - exactly the same as Adobe's official service.</p>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-white mb-3">Can I use CheapCC for commercial work?</h3>
                  <p className="text-white/80">Yes! CheapCC subscriptions include full commercial usage rights, allowing you to use Adobe Creative Cloud for client work, business projects, and commercial purposes.</p>
                </div>
              </div>
            </div>

            {/* CTA Section */}
            <div className="text-center bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-2xl p-12">
              <h2 className="text-3xl font-bold text-white mb-6">Ready to Save 83% on Adobe Creative Cloud?</h2>
              <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
                Join hundreds of creatives who've made the smart switch to CheapCC. Same Adobe apps, massive savings.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/#pricing"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-fuchsia-500 via-pink-500 to-rose-600 text-white font-semibold text-lg shadow-lg shadow-red-500/30 border border-white/20 hover:scale-105 transition-transform"
                >
                  Get CheapCC Now - Save $780/Year
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
