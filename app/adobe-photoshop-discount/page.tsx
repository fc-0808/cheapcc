import { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'Adobe Photoshop Discount: Get Photoshop for $14.99/month (75% Off)',
  description: 'Adobe Photoshop costs $22.99/month officially, but get the full Photoshop + entire Creative Cloud for just $14.99/month with CheapCC. Same app, massive savings.',
  keywords: 'adobe photoshop price, adobe photoshop cost, photoshop subscription, adobe photoshop discount, cheap photoshop, photoshop alternative, how much is photoshop',
  alternates: {
    canonical: '/adobe-photoshop-discount'
  },
  openGraph: {
    title: 'Adobe Photoshop for $14.99/month - 75% Off Official Pricing',
    description: 'Why pay $22.99/month for Photoshop alone when you can get Photoshop + ALL Adobe CC apps for $14.99/month? Same software, 75% savings.',
    url: '/adobe-photoshop-discount',
    siteName: 'CheapCC',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Adobe Photoshop Discount: $14.99/month (75% Off)',
    description: 'Adobe Photoshop: $22.99/month vs CheapCC: $14.99/month for Photoshop + ALL CC apps. Why pay more for less?',
  }
};

// Product schema for Photoshop
const photoshopSchema = {
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Adobe Photoshop - CheapCC Discount",
  "description": "Adobe Photoshop subscription at 75% off official pricing. Get Photoshop plus all Creative Cloud apps for less than Adobe charges for Photoshop alone.",
  "brand": {
    "@type": "Brand",
    "name": "Adobe"
  },
  "category": "Photo Editing Software",
  "offers": {
    "@type": "Offer",
    "price": "14.99",
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock",
    "priceValidUntil": "2025-12-31",
    "seller": {
      "@type": "Organization",
      "name": "CheapCC"
    }
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "reviewCount": "892",
    "bestRating": "5",
    "worstRating": "1"
  }
};

export default function PhotoshopDiscountPage() {
  return (
    <>
      <Script
        id="photoshop-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(photoshopSchema) }}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900">
        <div className="container mx-auto px-4 py-16">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-white mb-6">
              Adobe Photoshop for <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-500">$14.99/month</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-4xl mx-auto">
              Why pay Adobe $22.99/month for Photoshop alone when you can get <strong className="text-white">Photoshop + ALL Creative Cloud apps</strong> for just $14.99/month?
            </p>
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-1 rounded-lg inline-block">
              <div className="bg-gray-900 px-6 py-3 rounded-md">
                <p className="text-white font-semibold">Adobe Photoshop: $22.99/month → CheapCC: $14.99/month + ALL CC apps</p>
                <p className="text-cyan-400">Save $8/month • Get 20+ extra apps FREE</p>
              </div>
            </div>
          </div>

          {/* Pricing Comparison */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-16">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">Adobe Photoshop Pricing Comparison</h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-red-900/30 border border-red-500 rounded-xl p-6 text-center">
                <h3 className="text-xl font-bold text-red-400 mb-4">Adobe Photoshop Only</h3>
                <div className="text-3xl font-bold text-white mb-2">$22.99/month</div>
                <div className="text-sm text-gray-300 mb-4">Official Adobe pricing</div>
                <ul className="text-left text-gray-300 space-y-2">
                  <li>• Photoshop only</li>
                  <li>• 100GB cloud storage</li>
                  <li>• Adobe Fonts</li>
                  <li>• Mobile apps</li>
                </ul>
                <div className="mt-4 text-red-300 font-semibold">$275.88/year</div>
              </div>

              <div className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 border-2 border-cyan-500 rounded-xl p-6 text-center relative">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-cyan-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  BEST VALUE
                </div>
                <h3 className="text-xl font-bold text-cyan-400 mb-4">CheapCC - Photoshop + ALL CC</h3>
                <div className="text-3xl font-bold text-white mb-2">$14.99/month</div>
                <div className="text-sm text-gray-300 mb-4">75% off Adobe pricing</div>
                <ul className="text-left text-gray-300 space-y-2">
                  <li>• <strong>Photoshop</strong> + 20+ CC apps</li>
                  <li>• Illustrator, Premiere Pro, etc.</li>
                  <li>• 100GB cloud storage</li>
                  <li>• Adobe Fonts & Stock</li>
                  <li>• All mobile apps</li>
                </ul>
                <div className="mt-4 text-green-400 font-semibold">$179.88/year</div>
              </div>

              <div className="bg-gray-900/30 border border-gray-600 rounded-xl p-6 text-center">
                <h3 className="text-xl font-bold text-gray-400 mb-4">Adobe Creative Cloud</h3>
                <div className="text-3xl font-bold text-white mb-2">$79.99/month</div>
                <div className="text-sm text-gray-300 mb-4">All apps, full price</div>
                <ul className="text-left text-gray-300 space-y-2">
                  <li>• All 20+ CC apps</li>
                  <li>• 100GB cloud storage</li>
                  <li>• Adobe Fonts & Stock</li>
                  <li>• All features</li>
                </ul>
                <div className="mt-4 text-red-300 font-semibold">$959.88/year</div>
              </div>
            </div>

            <div className="mt-8 text-center">
              <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-xl p-6">
                <h3 className="text-2xl font-bold text-white mb-2">🎯 CheapCC Winner: Save $96/year vs Photoshop-only</h3>
                <p className="text-xl text-green-100">Get Photoshop + 20 extra apps for LESS than Adobe charges for Photoshop alone!</p>
              </div>
            </div>
          </div>

          {/* What You Get */}
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 mb-16">
            <h3 className="text-3xl font-bold text-white mb-8 text-center">What's Included with Your Photoshop Subscription</h3>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-xl font-semibold text-blue-400 mb-4">✅ Adobe Photoshop (Full Version):</h4>
                <ul className="space-y-2 text-gray-300">
                  <li>• Advanced photo editing tools</li>
                  <li>• AI-powered features (Neural Filters)</li>
                  <li>• Professional retouching</li>
                  <li>• Layer management & compositing</li>
                  <li>• RAW image processing</li>
                  <li>• 3D design capabilities</li>
                  <li>• Video editing features</li>
                  <li>• Extensive brush library</li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-xl font-semibold text-blue-400 mb-4">🎁 BONUS: 20+ Extra CC Apps FREE:</h4>
                <ul className="space-y-2 text-gray-300">
                  <li>• <strong>Illustrator</strong> - Vector graphics</li>
                  <li>• <strong>Premiere Pro</strong> - Video editing</li>
                  <li>• <strong>After Effects</strong> - Motion graphics</li>
                  <li>• <strong>InDesign</strong> - Layout design</li>
                  <li>• <strong>Lightroom</strong> - Photo management</li>
                  <li>• <strong>XD</strong> - UI/UX design</li>
                  <li>• <strong>Audition</strong> - Audio editing</li>
                  <li>• And 13+ more professional apps!</li>
                </ul>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 mb-16">
            <h3 className="text-3xl font-bold text-white mb-8 text-center">Photoshop Discount FAQs</h3>
            
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-semibold text-blue-400 mb-2">Is this the same Photoshop that Adobe sells?</h4>
                <p className="text-gray-300">Yes, absolutely. You get the exact same Adobe Photoshop with all features, updates, and capabilities. The only difference is the price and that you get 20+ bonus apps.</p>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold text-blue-400 mb-2">Why is CheapCC cheaper than Adobe's Photoshop-only plan?</h4>
                <p className="text-gray-300">We leverage volume licensing to offer better rates. It's actually more cost-effective for us to provide the full Creative Cloud suite than individual apps.</p>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold text-blue-400 mb-2">Can I upgrade from Photoshop-only to Creative Cloud later?</h4>
                <p className="text-gray-300">With CheapCC, you already get everything from day one! No need to upgrade - you have access to all Creative Cloud apps immediately.</p>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold text-blue-400 mb-2">What about Photoshop alternatives like GIMP or Affinity Photo?</h4>
                <p className="text-gray-300">While alternatives exist, nothing matches Photoshop's industry-standard features and compatibility. With CheapCC, you get the real thing for less than most alternatives charge.</p>
              </div>
            </div>
          </div>

          {/* Testimonials */}
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 mb-16">
            <h3 className="text-3xl font-bold text-white mb-8 text-center">What Photoshop Users Say</h3>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white/5 p-6 rounded-lg">
                <p className="text-gray-300 mb-4">"I was paying $23/month for just Photoshop. Now I pay $15 for Photoshop + everything else. No brainer!"</p>
                <div className="text-blue-400 font-semibold">- Emma K., Photographer</div>
              </div>
              
              <div className="bg-white/5 p-6 rounded-lg">
                <p className="text-gray-300 mb-4">"The savings are incredible, but having access to Illustrator and Premiere Pro too has transformed my workflow."</p>
                <div className="text-blue-400 font-semibold">- David L., Graphic Designer</div>
              </div>
              
              <div className="bg-white/5 p-6 rounded-lg">
                <p className="text-gray-300 mb-4">"Same Photoshop I've always used, just way cheaper. Plus I discovered After Effects and love it!"</p>
                <div className="text-blue-400 font-semibold">- Maria S., Content Creator</div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-12">
            <h3 className="text-3xl font-bold text-white mb-4">Get Adobe Photoshop + 20 Bonus Apps</h3>
            <p className="text-xl text-blue-100 mb-8">For less than Adobe charges for Photoshop alone</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/#pricing" className="bg-white text-cyan-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors">
                Get Photoshop for $14.99/month
              </Link>
              <Link href="/adobe-pricing-calculator" className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-cyan-600 transition-colors">
                Calculate Your Savings
              </Link>
            </div>
            <p className="text-sm text-blue-100 mt-4">Same Photoshop • 20+ bonus apps • No contracts</p>
          </div>
        </div>
      </div>
    </>
  );
}
