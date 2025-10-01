import { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'Adobe CC Alternatives 2025: Why CheapCC is the Smart Choice',
  description: 'Compare Adobe Creative Cloud alternatives in 2025. CheapCC offers the REAL Adobe CC for 75% less than official pricing. Same apps, same features, massive savings.',
  keywords: 'adobe alternatives, adobe cc alternatives, cheap adobe creative cloud, adobe alternatives 2025, adobe illustrator alternative, adobe photoshop alternative, cheapcc vs adobe',
  alternates: {
    canonical: '/adobe-alternatives'
  },
  openGraph: {
    title: 'Adobe CC Alternatives 2025: Real Adobe for 75% Less',
    description: 'Why settle for Adobe alternatives when you can get the REAL Adobe Creative Cloud for 75% less? Compare all options and see why CheapCC wins.',
    url: '/adobe-alternatives',
    siteName: 'CheapCC',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Adobe CC Alternatives 2025: Real Adobe for 75% Less',
    description: 'Stop searching for Adobe alternatives. Get the REAL Adobe Creative Cloud for 75% less with CheapCC. Same apps, same updates, massive savings.',
  }
};

// Schema markup for the alternatives comparison
const alternativesSchema = {
  "@context": "https://schema.org",
  "@type": "ComparisonTable",
  "name": "Adobe Creative Cloud Alternatives Comparison 2025",
  "description": "Comprehensive comparison of Adobe Creative Cloud alternatives including pricing, features, and capabilities",
  "url": "https://cheapcc.online/adobe-alternatives",
  "comparedItems": [
    {
      "@type": "SoftwareApplication",
      "name": "Adobe Creative Cloud (Official)",
      "applicationCategory": "Design Software",
      "operatingSystem": "Windows, macOS",
      "offers": {
        "@type": "Offer",
        "price": "79.99",
        "priceCurrency": "USD",
        "priceValidUntil": "2025-12-31"
      }
    },
    {
      "@type": "SoftwareApplication", 
      "name": "CheapCC - Adobe Creative Cloud",
      "applicationCategory": "Design Software",
      "operatingSystem": "Windows, macOS",
      "offers": {
        "@type": "Offer",
        "price": "14.99",
        "priceCurrency": "USD",
        "priceValidUntil": "2025-12-31"
      }
    },
    {
      "@type": "SoftwareApplication",
      "name": "Canva Pro",
      "applicationCategory": "Design Software",
      "offers": {
        "@type": "Offer",
        "price": "14.99",
        "priceCurrency": "USD"
      }
    },
    {
      "@type": "SoftwareApplication",
      "name": "Affinity Suite",
      "applicationCategory": "Design Software",
      "offers": {
        "@type": "Offer",
        "price": "169.99",
        "priceCurrency": "USD"
      }
    }
  ]
};

export default function AdobeAlternativesPage() {
  return (
    <>
      <Script
        id="alternatives-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(alternativesSchema) }}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
        <div className="container mx-auto px-4 pt-24 pb-16">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-white mb-6">
              Adobe CC Alternatives 2025: <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-violet-500">Why Settle for Less?</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-4xl mx-auto">
              Everyone's searching for Adobe alternatives because of the high cost. But what if you could get the <strong className="text-white">REAL Adobe Creative Cloud</strong> for 75% less? Stop compromising. Get the original.
            </p>
            <div className="bg-gradient-to-r from-pink-600 to-violet-600 p-1 rounded-lg inline-block">
              <div className="bg-gray-900 px-6 py-3 rounded-md">
                <p className="text-white font-semibold">Adobe Official: $79.99/month → CheapCC: $14.99/month</p>
                <p className="text-pink-400">Save $780/year • Same Apps • Same Features</p>
              </div>
            </div>
          </div>

          {/* Comparison Table */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-16">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">The Ultimate Adobe Alternatives Comparison</h2>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-600">
                    <th className="py-4 px-6 text-white font-semibold">Solution</th>
                    <th className="py-4 px-6 text-white font-semibold">Monthly Cost</th>
                    <th className="py-4 px-6 text-white font-semibold">Apps Included</th>
                    <th className="py-4 px-6 text-white font-semibold">Professional Features</th>
                    <th className="py-4 px-6 text-white font-semibold">Industry Standard</th>
                    <th className="py-4 px-6 text-white font-semibold">Verdict</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-700 bg-gradient-to-r from-pink-900/30 to-violet-900/30">
                    <td className="py-4 px-6">
                      <div className="font-semibold text-pink-400">CheapCC</div>
                      <div className="text-sm text-gray-300">Real Adobe CC</div>
                    </td>
                    <td className="py-4 px-6 text-green-400 font-bold">$14.99</td>
                    <td className="py-4 px-6 text-white">All 20+ Adobe Apps</td>
                    <td className="py-4 px-6 text-green-400">✅ Full Professional</td>
                    <td className="py-4 px-6 text-green-400">✅ Industry Standard</td>
                    <td className="py-4 px-6">
                      <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-semibold">WINNER</span>
                    </td>
                  </tr>
                  <tr className="border-b border-gray-700">
                    <td className="py-4 px-6">
                      <div className="font-semibold text-white">Adobe Official</div>
                      <div className="text-sm text-gray-300">Direct from Adobe</div>
                    </td>
                    <td className="py-4 px-6 text-red-400 font-bold">$79.99</td>
                    <td className="py-4 px-6 text-white">All 20+ Adobe Apps</td>
                    <td className="py-4 px-6 text-green-400">✅ Full Professional</td>
                    <td className="py-4 px-6 text-green-400">✅ Industry Standard</td>
                    <td className="py-4 px-6">
                      <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm">OVERPRICED</span>
                    </td>
                  </tr>
                  <tr className="border-b border-gray-700">
                    <td className="py-4 px-6">
                      <div className="font-semibold text-white">Canva Pro</div>
                      <div className="text-sm text-gray-300">Template-based design</div>
                    </td>
                    <td className="py-4 px-6 text-yellow-400">$14.99</td>
                    <td className="py-4 px-6 text-gray-400">Limited templates</td>
                    <td className="py-4 px-6 text-red-400">❌ Basic only</td>
                    <td className="py-4 px-6 text-red-400">❌ Not professional</td>
                    <td className="py-4 px-6">
                      <span className="bg-yellow-600 text-white px-3 py-1 rounded-full text-sm">LIMITED</span>
                    </td>
                  </tr>
                  <tr className="border-b border-gray-700">
                    <td className="py-4 px-6">
                      <div className="font-semibold text-white">Affinity Suite</div>
                      <div className="text-sm text-gray-300">One-time purchase</div>
                    </td>
                    <td className="py-4 px-6 text-gray-400">$169.99 once</td>
                    <td className="py-4 px-6 text-gray-400">3 apps only</td>
                    <td className="py-4 px-6 text-yellow-400">⚠️ Some features</td>
                    <td className="py-4 px-6 text-red-400">❌ Not standard</td>
                    <td className="py-4 px-6">
                      <span className="bg-gray-600 text-white px-3 py-1 rounded-full text-sm">INCOMPLETE</span>
                    </td>
                  </tr>
                  <tr className="border-b border-gray-700">
                    <td className="py-4 px-6">
                      <div className="font-semibold text-white">GIMP + Inkscape</div>
                      <div className="text-sm text-gray-300">Free alternatives</div>
                    </td>
                    <td className="py-4 px-6 text-green-400">Free</td>
                    <td className="py-4 px-6 text-gray-400">2 apps, basic</td>
                    <td className="py-4 px-6 text-red-400">❌ Very limited</td>
                    <td className="py-4 px-6 text-red-400">❌ Not professional</td>
                    <td className="py-4 px-6">
                      <span className="bg-gray-600 text-white px-3 py-1 rounded-full text-sm">HOBBY ONLY</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Why CheapCC Wins Section */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <div className="bg-white/5 backdrop-blur-lg rounded-xl p-8">
              <h3 className="text-2xl font-bold text-white mb-4">❌ Why "Alternatives" Fall Short</h3>
              <ul className="space-y-3 text-gray-300">
                <li>• <strong>Canva:</strong> Template-based, not professional-grade</li>
                <li>• <strong>Figma:</strong> UI design only, missing video/photo tools</li>
                <li>• <strong>Affinity:</strong> No cloud sync, limited compatibility</li>
                <li>• <strong>GIMP:</strong> Steep learning curve, unprofessional interface</li>
                <li>• <strong>Free tools:</strong> Missing advanced features, poor support</li>
              </ul>
            </div>
            
            <div className="bg-gradient-to-br from-pink-900/30 to-violet-900/30 backdrop-blur-lg rounded-xl p-8 border border-pink-500/20">
              <h3 className="text-2xl font-bold text-white mb-4">✅ Why CheapCC is Different</h3>
              <ul className="space-y-3 text-gray-300">
                <li>• <strong>Real Adobe CC:</strong> Same apps, same features, same updates</li>
                <li>• <strong>Industry Standard:</strong> Works with all professional workflows</li>
                <li>• <strong>Full Compatibility:</strong> All file formats, plugins, extensions</li>
                <li>• <strong>Professional Support:</strong> Get help when you need it</li>
                <li>• <strong>75% Savings:</strong> Why pay $79.99 when you can pay $14.99?</li>
              </ul>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-8 mb-16">
            <h3 className="text-3xl font-bold text-white mb-8 text-center">Frequently Asked Questions</h3>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-lg font-semibold text-pink-400 mb-2">Is CheapCC really the same as Adobe CC?</h4>
                <p className="text-gray-300 mb-4">Yes, absolutely. You get the exact same Adobe Creative Cloud applications, with the same features, same updates, same everything. The only difference is the price.</p>
                
                <h4 className="text-lg font-semibold text-pink-400 mb-2">Why should I choose CheapCC over free alternatives?</h4>
                <p className="text-gray-300 mb-4">Free alternatives like GIMP or Canva are fine for hobbyists, but if you're serious about professional work, you need professional tools. CheapCC gives you the industry standard at an affordable price.</p>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold text-pink-400 mb-2">How much can I actually save with CheapCC?</h4>
                <p className="text-gray-300 mb-4">You save $65/month or $780/year compared to Adobe's official pricing. Over 3 years, that's $2,340 in savings while getting the exact same product.</p>
                
                <h4 className="text-lg font-semibold text-pink-400 mb-2">What about other paid alternatives like Affinity?</h4>
                <p className="text-gray-300">Affinity is decent but limited. You only get 3 apps vs Adobe's 20+, no cloud sync, and compatibility issues with professional workflows. CheapCC gives you everything.</p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center bg-gradient-to-r from-pink-600 to-violet-600 rounded-2xl p-12">
            <h3 className="text-3xl font-bold text-white mb-4">Stop Settling for "Alternatives"</h3>
            <p className="text-xl text-pink-100 mb-8">Get the REAL Adobe Creative Cloud for 75% less</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/#pricing" className="bg-white text-violet-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors">
                View CheapCC Pricing
              </Link>
              <Link href="/compare" className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-violet-600 transition-colors">
                See All Comparisons
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
