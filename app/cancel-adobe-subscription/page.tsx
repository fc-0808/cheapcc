import { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'How to Cancel Adobe Subscription (Step-by-Step Guide 2025)',
  description: 'Complete guide to cancel your Adobe subscription + discover CheapCC: Get the same Adobe CC for 75% less. No cancellation fees, same apps, massive savings.',
  keywords: 'how to cancel adobe subscription, cancel adobe subscription, adobe subscription cancel, adobe cancellation fee, cancel adobe creative cloud, cheapcc alternative',
  alternates: {
    canonical: '/cancel-adobe-subscription'
  },
  openGraph: {
    title: 'How to Cancel Adobe Subscription + Better Alternative (75% Cheaper)',
    description: 'Step-by-step guide to cancel Adobe subscription. Plus: Get the same Adobe CC for $14.99/month instead of $79.99. Same apps, 75% savings.',
    url: '/cancel-adobe-subscription',
    siteName: 'CheapCC',
    locale: 'en_US',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cancel Adobe Subscription + Get Adobe CC for 75% Less',
    description: 'Cancel your overpriced Adobe subscription and get the same Creative Cloud for $14.99/month instead of $79.99. Step-by-step guide included.',
  }
};

// HowTo Schema for cancellation steps
const howToSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "How to Cancel Adobe Creative Cloud Subscription",
  "description": "Step-by-step guide to cancel your Adobe Creative Cloud subscription and avoid cancellation fees",
  "image": "https://cheapcc.online/images/cancel-adobe-guide.jpg",
  "totalTime": "PT10M",
  "estimatedCost": {
    "@type": "MonetaryAmount",
    "currency": "USD",
    "value": "0"
  },
  "supply": [
    {
      "@type": "HowToSupply",
      "name": "Adobe Account Login"
    },
    {
      "@type": "HowToSupply", 
      "name": "Internet Connection"
    }
  ],
  "step": [
    {
      "@type": "HowToStep",
      "name": "Login to Adobe Account",
      "text": "Go to adobe.com and login to your Adobe account using your email and password.",
      "url": "https://cheapcc.online/cancel-adobe-subscription#step1"
    },
    {
      "@type": "HowToStep",
      "name": "Navigate to Plans & Products",
      "text": "Click on your profile icon and select 'Plans & Products' from the dropdown menu.",
      "url": "https://cheapcc.online/cancel-adobe-subscription#step2"
    },
    {
      "@type": "HowToStep",
      "name": "Find Your Creative Cloud Plan",
      "text": "Locate your Adobe Creative Cloud subscription in the list of active plans.",
      "url": "https://cheapcc.online/cancel-adobe-subscription#step3"
    },
    {
      "@type": "HowToStep",
      "name": "Click Cancel Plan",
      "text": "Click the 'Cancel Plan' button next to your Creative Cloud subscription.",
      "url": "https://cheapcc.online/cancel-adobe-subscription#step4"
    },
    {
      "@type": "HowToStep",
      "name": "Confirm Cancellation",
      "text": "Follow the prompts to confirm your cancellation. You may be offered discounts to stay - decline if you want to cancel.",
      "url": "https://cheapcc.online/cancel-adobe-subscription#step5"
    }
  ]
};

// FAQ Schema
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Does Adobe charge a cancellation fee?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Adobe may charge a cancellation fee if you cancel within the first year of an annual plan. The fee is typically 50% of the remaining balance. However, if you're switching to CheapCC, you'll still save money even with the fee."
      }
    },
    {
      "@type": "Question",
      "name": "Can I get a refund after canceling Adobe?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Adobe offers a 14-day refund policy for new subscriptions. After that, refunds are rare. This is why many users switch to CheapCC for the same Adobe CC at 75% less cost."
      }
    },
    {
      "@type": "Question",
      "name": "What's the best alternative to Adobe Creative Cloud?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "CheapCC offers the same genuine Adobe Creative Cloud applications for $14.99/month instead of Adobe's $79.99/month. You get the same apps, same features, same updates - just at a fraction of the cost."
      }
    }
  ]
};

export default function CancelAdobeSubscriptionPage() {
  return (
    <>
      <Script
        id="howto-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
      <Script
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900 to-orange-900">
        <div className="container mx-auto px-4 py-16">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-white mb-6">
              How to Cancel Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">Overpriced</span> Adobe Subscription
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-4xl mx-auto">
              Tired of paying $79.99/month for Adobe Creative Cloud? Here's how to cancel + a better alternative that gives you the <strong className="text-white">same Adobe CC for $14.99/month</strong>.
            </p>
            <div className="bg-gradient-to-r from-red-600 to-orange-600 p-1 rounded-lg inline-block">
              <div className="bg-gray-900 px-6 py-3 rounded-md">
                <p className="text-white font-semibold">Adobe: $79.99/month → CheapCC: $14.99/month</p>
                <p className="text-orange-400">Same Apps • Same Features • 75% Less Cost</p>
              </div>
            </div>
          </div>

          {/* Quick Comparison Alert */}
          <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl p-8 mb-16 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">⚠️ Before You Cancel: Consider This</h2>
            <div className="grid md:grid-cols-3 gap-6 text-white">
              <div>
                <h3 className="font-semibold mb-2">Adobe Official</h3>
                <p className="text-3xl font-bold text-red-400">$79.99/mo</p>
                <p className="text-sm">$959.88/year</p>
              </div>
              <div className="text-4xl">VS</div>
              <div>
                <h3 className="font-semibold mb-2">CheapCC</h3>
                <p className="text-3xl font-bold text-green-400">$14.99/mo</p>
                <p className="text-sm">$179.88/year</p>
              </div>
            </div>
            <p className="text-xl mt-4">Same Adobe CC apps • Save $780/year • No cancellation needed</p>
          </div>

          {/* Step-by-Step Cancellation Guide */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-16">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">Step-by-Step Adobe Cancellation Guide</h2>
            
            <div className="space-y-8">
              <div id="step1" className="flex items-start space-x-4">
                <div className="bg-red-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg">1</div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Login to Your Adobe Account</h3>
                  <p className="text-gray-300 mb-3">Go to <strong>adobe.com</strong> and click "Sign In" in the top right corner. Enter your email and password.</p>
                  <div className="bg-yellow-900/30 border border-yellow-600 rounded-lg p-4">
                    <p className="text-yellow-200"><strong>Tip:</strong> Make sure you're logged into the correct Adobe account if you have multiple.</p>
                  </div>
                </div>
              </div>

              <div id="step2" className="flex items-start space-x-4">
                <div className="bg-red-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg">2</div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Navigate to Plans & Products</h3>
                  <p className="text-gray-300 mb-3">Click on your profile picture/icon in the top right, then select <strong>"Plans & Products"</strong> from the dropdown menu.</p>
                </div>
              </div>

              <div id="step3" className="flex items-start space-x-4">
                <div className="bg-red-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg">3</div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Find Your Creative Cloud Plan</h3>
                  <p className="text-gray-300 mb-3">Look for your Adobe Creative Cloud subscription in the list. It might be called "Creative Cloud All Apps" or similar.</p>
                </div>
              </div>

              <div id="step4" className="flex items-start space-x-4">
                <div className="bg-red-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg">4</div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Click "Cancel Plan"</h3>
                  <p className="text-gray-300 mb-3">Next to your Creative Cloud plan, you'll see a "Cancel Plan" or "Manage Plan" button. Click it.</p>
                  <div className="bg-red-900/30 border border-red-600 rounded-lg p-4">
                    <p className="text-red-200"><strong>Warning:</strong> Adobe may try to charge you a cancellation fee if you're in an annual contract.</p>
                  </div>
                </div>
              </div>

              <div id="step5" className="flex items-start space-x-4">
                <div className="bg-red-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg">5</div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Confirm Cancellation</h3>
                  <p className="text-gray-300 mb-3">Adobe will try to retain you with discounts and offers. If you're determined to cancel, decline these and confirm the cancellation.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Cancellation Fees Warning */}
          <div className="bg-red-900/30 border border-red-600 rounded-2xl p-8 mb-16">
            <h3 className="text-2xl font-bold text-white mb-4">⚠️ Adobe Cancellation Fees Explained</h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-lg font-semibold text-red-400 mb-3">When Adobe Charges Fees:</h4>
                <ul className="space-y-2 text-gray-300">
                  <li>• Annual plan canceled within first year</li>
                  <li>• Fee is typically 50% of remaining balance</li>
                  <li>• Can be $200-400+ depending on timing</li>
                  <li>• No fee for monthly plans (but more expensive)</li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-green-400 mb-3">CheapCC Alternative:</h4>
                <ul className="space-y-2 text-gray-300">
                  <li>• No cancellation fees ever</li>
                  <li>• Same Adobe CC apps and features</li>
                  <li>• $14.99/month vs Adobe's $79.99/month</li>
                  <li>• Save money even after paying Adobe's fee</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Better Alternative Section */}
          <div className="bg-gradient-to-r from-green-900/30 to-blue-900/30 backdrop-blur-lg rounded-2xl p-8 mb-16 border border-green-500/20">
            <h3 className="text-3xl font-bold text-white mb-6 text-center">Why Cancel When You Can Save 75%?</h3>
            
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <h4 className="text-xl font-semibold text-white mb-4">What You Get with CheapCC:</h4>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-center"><span className="text-green-400 mr-2">✅</span> Same Adobe Creative Cloud apps</li>
                  <li className="flex items-center"><span className="text-green-400 mr-2">✅</span> Photoshop, Illustrator, Premiere Pro, etc.</li>
                  <li className="flex items-center"><span className="text-green-400 mr-2">✅</span> Regular updates from Adobe</li>
                  <li className="flex items-center"><span className="text-green-400 mr-2">✅</span> 100GB cloud storage</li>
                  <li className="flex items-center"><span className="text-green-400 mr-2">✅</span> Adobe Firefly AI features</li>
                  <li className="flex items-center"><span className="text-green-400 mr-2">✅</span> No cancellation fees</li>
                </ul>
              </div>
              <div>
                <h4 className="text-xl font-semibold text-white mb-4">Cost Comparison:</h4>
                <div className="space-y-4">
                  <div className="bg-red-900/30 p-4 rounded-lg">
                    <p className="text-red-400 font-semibold">Adobe Official</p>
                    <p className="text-2xl font-bold text-white">$79.99/month</p>
                    <p className="text-sm text-gray-300">$959.88/year</p>
                  </div>
                  <div className="bg-green-900/30 p-4 rounded-lg">
                    <p className="text-green-400 font-semibold">CheapCC</p>
                    <p className="text-2xl font-bold text-white">$14.99/month</p>
                    <p className="text-sm text-gray-300">$179.88/year</p>
                  </div>
                  <div className="bg-gradient-to-r from-green-600 to-blue-600 p-4 rounded-lg text-center">
                    <p className="text-white font-bold">You Save $780/Year!</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 mb-16">
            <h3 className="text-3xl font-bold text-white mb-8 text-center">Frequently Asked Questions</h3>
            
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-semibold text-orange-400 mb-2">Does Adobe charge a cancellation fee?</h4>
                <p className="text-gray-300">Yes, Adobe typically charges a cancellation fee of 50% of your remaining balance if you cancel an annual plan within the first year. This can be $200-400+.</p>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold text-orange-400 mb-2">Can I get a refund after canceling Adobe?</h4>
                <p className="text-gray-300">Adobe offers a 14-day refund policy for new subscriptions. After that, refunds are very rare and difficult to obtain.</p>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold text-orange-400 mb-2">What's the best alternative to Adobe Creative Cloud?</h4>
                <p className="text-gray-300">CheapCC offers the same genuine Adobe Creative Cloud applications for $14.99/month instead of Adobe's $79.99/month. You get the same apps, same features, same updates.</p>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold text-orange-400 mb-2">Is CheapCC really the same as Adobe CC?</h4>
                <p className="text-gray-300">Yes, absolutely. CheapCC provides access to the genuine Adobe Creative Cloud suite. Same applications, same features, same updates - just at a fraction of the cost.</p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl p-12">
            <h3 className="text-3xl font-bold text-white mb-4">Don't Cancel - Save 75% Instead!</h3>
            <p className="text-xl text-green-100 mb-8">Get the same Adobe Creative Cloud for $14.99/month instead of $79.99</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/#pricing" className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors">
                Get CheapCC for $14.99/month
              </Link>
              <Link href="/adobe-alternatives" className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-600 transition-colors">
                Compare All Alternatives
              </Link>
            </div>
            <p className="text-sm text-green-100 mt-4">No contracts • No cancellation fees • Same Adobe CC apps</p>
          </div>
        </div>
      </div>
    </>
  );
}
