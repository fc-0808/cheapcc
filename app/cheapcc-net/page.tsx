import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'CheapCC.net Alternative - Adobe Creative Cloud Discount | CheapCC.online',
  description: 'Looking for CheapCC.net? You found us! CheapCC.online offers genuine Adobe Creative Cloud subscriptions at 75% off official pricing. Same service, better prices.',
  keywords: 'cheapcc.net, cheapcc net, cheapcc alternative, adobe creative cloud discount, cheap adobe cc',
  alternates: {
    canonical: 'https://cheapcc.online/cheapcc-net'
  },
  openGraph: {
    title: 'CheapCC.net Alternative - Adobe CC Discount | CheapCC.online',
    description: 'Looking for CheapCC.net? You found us! Get genuine Adobe Creative Cloud for 75% less.',
    url: 'https://cheapcc.online/cheapcc-net',
    siteName: 'CheapCC',
    locale: 'en_US',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  }
};

export default function CheapCCNetPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* Hero Section */}
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 py-2 px-6 rounded-full bg-green-500/20 border border-green-500/50 text-green-400 text-sm font-medium mb-6">
              <i className="fas fa-check-circle" aria-hidden="true" />
              You Found Us! CheapCC.online is Here
            </div>
            
            <h1 className="text-5xl md:text-6xl font-extrabold text-white leading-tight mb-6">
              Looking for <span className="bg-gradient-to-r from-fuchsia-500 via-pink-500 to-red-500 bg-clip-text text-transparent">CheapCC.net</span>?
            </h1>
            
            <p className="text-xl text-white/80 max-w-3xl mx-auto mb-8">
              You've found the right place! <strong>CheapCC.online</strong> is your trusted source for genuine Adobe Creative Cloud subscriptions at incredible discounts.
            </p>
          </div>

          {/* Comparison Section */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 mb-12">
            <h2 className="text-3xl font-bold text-white mb-6">Why Choose CheapCC.online?</h2>
            
            <div className="grid md:grid-cols-2 gap-8 text-left">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                  <i className="fas fa-shield-alt text-green-400"></i>
                  Genuine Adobe CC
                </h3>
                <p className="text-white/70">
                  100% authentic Adobe Creative Cloud subscriptions with full access to all apps: Photoshop, Illustrator, Premiere Pro, After Effects, and more.
                </p>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                  <i className="fas fa-percentage text-pink-400"></i>
                  75% Off Official Pricing
                </h3>
                <p className="text-white/70">
                  Save hundreds compared to Adobe's official pricing. Get the same premium software for a fraction of the cost.
                </p>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                  <i className="fas fa-bolt text-yellow-400"></i>
                  Fast Delivery
                </h3>
                <p className="text-white/70">
                  Get your Adobe CC access within 24 hours of purchase. Quick delivery to start creating soon.
                </p>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                  <i className="fas fa-users text-blue-400"></i>
                  500+ Happy Customers
                </h3>
                <p className="text-white/70">
                  Join hundreds of satisfied creatives who've made the switch to CheapCC for their Adobe Creative Cloud needs.
                </p>
              </div>
            </div>
          </div>

          {/* Pricing Highlight */}
          <div className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/30 rounded-2xl p-8 mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Adobe CC Pricing Comparison</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-red-400 mb-2">Adobe Official</h3>
                <div className="text-3xl font-bold text-white mb-2">$79.99<span className="text-lg text-white/60">/month</span></div>
                <p className="text-white/70">Direct from Adobe</p>
              </div>
              
              <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6 relative">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">Best Value</span>
                </div>
                <h3 className="text-xl font-semibold text-green-400 mb-2">CheapCC.online</h3>
                <div className="text-3xl font-bold text-white mb-2">$14.99<span className="text-lg text-white/60">/month</span></div>
                <p className="text-white/70">Same apps, 75% savings</p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-6">Ready to Save on Adobe Creative Cloud?</h2>
            <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
              Don't pay full price for Adobe CC. Get the same professional tools for less with CheapCC.online.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/#pricing"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-fuchsia-500 via-pink-500 to-rose-600 text-white font-semibold text-lg shadow-lg shadow-red-500/30 border border-white/20 hover:scale-105 transition-transform"
              >
                View Pricing & Plans
                <i className="fas fa-arrow-right"></i>
              </Link>
              
              <Link
                href="/compare"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold text-lg hover:bg-white/20 transition-colors"
              >
                Compare Options
                <i className="fas fa-balance-scale"></i>
              </Link>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="mt-16 pt-8 border-t border-white/10">
            <div className="flex flex-wrap justify-center items-center gap-8 text-white/60">
              <div className="flex items-center gap-2">
                <i className="fas fa-shield-check text-green-400"></i>
                <span>Secure Payments</span>
              </div>
              <div className="flex items-center gap-2">
                <i className="fas fa-clock text-blue-400"></i>
                <span>Fast Delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <i className="fas fa-headset text-purple-400"></i>
                <span>24/7 Support</span>
              </div>
              <div className="flex items-center gap-2">
                <i className="fas fa-star text-yellow-400"></i>
                <span>4.8/5 Rating</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
