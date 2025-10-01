'use client';

import { useState, useEffect } from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';

// Schema markup for the calculator
const calculatorSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Adobe Creative Cloud Pricing Calculator",
  "description": "Calculate how much you can save with CheapCC vs Adobe's official pricing. Compare costs for different subscription lengths.",
  "url": "https://cheapcc.online/adobe-pricing-calculator",
  "applicationCategory": "FinanceApplication",
  "operatingSystem": "Web Browser",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  }
};

export default function AdobePricingCalculatorPage() {
  const [months, setMonths] = useState(12);
  const [adobePrice, setAdobePrice] = useState(79.99);
  const [cheapccPrice, setCheapccPrice] = useState(14.99);
  const [savings, setSavings] = useState(0);
  const [percentSaved, setPercentSaved] = useState(0);

  useEffect(() => {
    const totalAdobe = adobePrice * months;
    const totalCheapcc = cheapccPrice * months;
    const totalSavings = totalAdobe - totalCheapcc;
    const percent = ((totalSavings / totalAdobe) * 100);
    
    setSavings(totalSavings);
    setPercentSaved(percent);
  }, [months, adobePrice, cheapccPrice]);

  const handleMonthsChange = (value: number) => {
    setMonths(value);
    
    // Adjust CheapCC pricing based on duration (volume discounts)
    if (value >= 12) {
      setCheapccPrice(14.99); // Annual discount
    } else if (value >= 6) {
      setCheapccPrice(16.99); // 6-month discount
    } else if (value >= 3) {
      setCheapccPrice(18.99); // 3-month discount
    } else {
      setCheapccPrice(19.99); // Monthly price
    }
  };

  return (
    <>
      <Script
        id="calculator-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(calculatorSchema) }}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
        <div className="container mx-auto px-4 pt-24 pb-16">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-white mb-6">
              Adobe CC Pricing Calculator: <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">See Your Savings</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-4xl mx-auto">
              Calculate exactly how much you'll save with CheapCC vs Adobe's official pricing. Same Creative Cloud apps, massive savings.
            </p>
          </div>

          {/* Calculator Section */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-8">
              <h2 className="text-3xl font-bold text-white mb-8 text-center">Interactive Savings Calculator</h2>
              
              {/* Duration Selector */}
              <div className="mb-8">
                <label className="block text-white text-lg font-semibold mb-4">Select Subscription Duration:</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[1, 3, 6, 12, 24, 36].map((monthOption) => (
                    <button
                      key={monthOption}
                      onClick={() => handleMonthsChange(monthOption)}
                      className={`p-4 rounded-lg font-semibold transition-all ${
                        months === monthOption
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                          : 'bg-white/5 text-gray-300 hover:bg-white/10'
                      }`}
                    >
                      {monthOption} {monthOption === 1 ? 'Month' : 'Months'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Comparison */}
              <div className="grid md:grid-cols-3 gap-8 mb-8">
                <div className="bg-red-900/30 border border-red-500 rounded-xl p-6 text-center">
                  <h3 className="text-xl font-bold text-red-400 mb-4">Adobe Official</h3>
                  <div className="text-3xl font-bold text-white mb-2">${adobePrice}/month</div>
                  <div className="text-lg text-gray-300 mb-4">${(adobePrice * months).toFixed(2)} total</div>
                  <div className="text-sm text-red-300">For {months} {months === 1 ? 'month' : 'months'}</div>
                </div>

                <div className="bg-green-900/30 border border-green-500 rounded-xl p-6 text-center">
                  <h3 className="text-xl font-bold text-green-400 mb-4">CheapCC</h3>
                  <div className="text-3xl font-bold text-white mb-2">${cheapccPrice}/month</div>
                  <div className="text-lg text-gray-300 mb-4">${(cheapccPrice * months).toFixed(2)} total</div>
                  <div className="text-sm text-green-300">Same CC apps</div>
                </div>

                <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 border border-blue-500 rounded-xl p-6 text-center">
                  <h3 className="text-xl font-bold text-blue-400 mb-4">Your Savings</h3>
                  <div className="text-3xl font-bold text-white mb-2">${savings.toFixed(2)}</div>
                  <div className="text-lg text-gray-300 mb-4">{percentSaved.toFixed(0)}% saved</div>
                  <div className="text-sm text-blue-300">Total savings</div>
                </div>
              </div>

              {/* Savings Visualization */}
              <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-xl p-6 text-center">
                <h3 className="text-2xl font-bold text-white mb-4">
                  💰 You Save ${savings.toFixed(2)} Over {months} {months === 1 ? 'Month' : 'Months'}!
                </h3>
                <p className="text-xl text-green-100">
                  That's enough to buy: {savings > 500 ? 'A new laptop!' : savings > 200 ? 'A professional camera!' : savings > 100 ? 'Premium software licenses!' : 'A nice dinner out!'}
                </p>
              </div>
            </div>

            {/* What You Get Section */}
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 mb-8">
              <h3 className="text-3xl font-bold text-white mb-8 text-center">What You Get with CheapCC</h3>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-xl font-semibold text-blue-400 mb-4">✅ All Adobe Creative Cloud Apps:</h4>
                  <div className="grid grid-cols-2 gap-2 text-gray-300">
                    <div>• Photoshop</div>
                    <div>• Illustrator</div>
                    <div>• Premiere Pro</div>
                    <div>• After Effects</div>
                    <div>• InDesign</div>
                    <div>• Lightroom</div>
                    <div>• XD</div>
                    <div>• Dreamweaver</div>
                    <div>• Animate</div>
                    <div>• Audition</div>
                    <div>• Dimension</div>
                    <div>• And 10+ more!</div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-xl font-semibold text-blue-400 mb-4">✅ Premium Features Included:</h4>
                  <ul className="space-y-2 text-gray-300">
                    <li>• 100GB cloud storage</li>
                    <li>• Adobe Firefly AI features</li>
                    <li>• Regular software updates</li>
                    <li>• Premium fonts library</li>
                    <li>• Adobe Stock integration</li>
                    <li>• Mobile app access</li>
                    <li>• Creative Cloud Libraries</li>
                    <li>• Portfolio website</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Testimonials */}
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 mb-8">
              <h3 className="text-3xl font-bold text-white mb-8 text-center">What Our Customers Say</h3>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white/5 p-6 rounded-lg">
                  <p className="text-gray-300 mb-4">"Saved over $600 in my first year with CheapCC. Same Adobe CC apps I was using before, just way cheaper!"</p>
                  <div className="text-blue-400 font-semibold">- Sarah K., Graphic Designer</div>
                </div>
                
                <div className="bg-white/5 p-6 rounded-lg">
                  <p className="text-gray-300 mb-4">"As a freelancer, every dollar counts. CheapCC lets me use professional tools without breaking the bank."</p>
                  <div className="text-blue-400 font-semibold">- Mike R., Video Editor</div>
                </div>
                
                <div className="bg-white/5 p-6 rounded-lg">
                  <p className="text-gray-300 mb-4">"Our agency switched all 8 workstations to CheapCC. We're saving $6,000+ per year!"</p>
                  <div className="text-blue-400 font-semibold">- Lisa M., Creative Director</div>
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 mb-8">
              <h3 className="text-3xl font-bold text-white mb-8 text-center">Calculator FAQs</h3>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-blue-400 mb-2">Are these the real Adobe prices?</h4>
                  <p className="text-gray-300">Yes, we use Adobe's official pricing ($79.99/month for Creative Cloud All Apps). Prices may vary by region or promotional offers.</p>
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold text-blue-400 mb-2">How can CheapCC offer such low prices?</h4>
                  <p className="text-gray-300">We leverage volume licensing agreements to offer genuine Adobe Creative Cloud subscriptions at significantly reduced rates, passing the savings to you.</p>
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold text-blue-400 mb-2">Is this really the same Adobe Creative Cloud?</h4>
                  <p className="text-gray-300">Absolutely. You get the exact same Adobe Creative Cloud applications with all features, updates, and cloud services. The only difference is the price.</p>
                </div>
              </div>
            </div>

            {/* CTA Section */}
            <div className="text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12">
              <h3 className="text-3xl font-bold text-white mb-4">Ready to Save ${savings.toFixed(2)}?</h3>
              <p className="text-xl text-blue-100 mb-8">Get the same Adobe Creative Cloud for {percentSaved.toFixed(0)}% less</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/#pricing" className="bg-white text-purple-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors">
                  Get CheapCC Now - Save ${savings.toFixed(2)}
                </Link>
                <Link href="/adobe-alternatives" className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-purple-600 transition-colors">
                  Compare All Options
                </Link>
              </div>
              <p className="text-sm text-blue-100 mt-4">Same Adobe CC • No contracts • Instant access</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
