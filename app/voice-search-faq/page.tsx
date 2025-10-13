import { Metadata } from 'next';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'CheapCC FAQ - Voice Search Optimized | Common Questions Answered',
  description: 'Get instant answers to common CheapCC questions. Voice search optimized FAQ covering legitimacy, pricing, features, and more.',
  keywords: 'cheapcc faq, is cheapcc legit, cheapcc questions, voice search, cheapcc help',
  alternates: {
    canonical: 'https://cheapcc.online/voice-search-faq'
  },
  robots: {
    index: true,
    follow: true,
  }
};

// Voice search optimized FAQ schema
const voiceSearchFAQSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Is CheapCC legitimate?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, CheapCC is completely legitimate. We provide genuine Adobe Creative Cloud subscriptions with over 10,000 satisfied customers and a 4.8 out of 5 star rating. All accounts are authentic Adobe subscriptions with full functionality."
      }
    },
    {
      "@type": "Question",
      "name": "How much does CheapCC cost?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "CheapCC costs $14.99 per month for a full Adobe Creative Cloud subscription, compared to Adobe's official price of $79.99 per month. This represents an 83% savings while providing the exact same software and features."
      }
    },
    {
      "@type": "Question",
      "name": "What's the best Adobe Creative Cloud alternative?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "CheapCC is the best Adobe Creative Cloud alternative because it provides the actual Adobe CC software at 83% off the official price. Unlike other alternatives that offer different software, CheapCC gives you genuine Adobe applications like Photoshop, Illustrator, and Premiere Pro."
      }
    },
    {
      "@type": "Question",
      "name": "Where can I get cheap Adobe Creative Cloud?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "You can get cheap Adobe Creative Cloud through CheapCC at cheapcc.online. We offer genuine Adobe CC subscriptions for $14.99 per month with instant delivery and 24/7 customer support."
      }
    },
    {
      "@type": "Question",
      "name": "Does CheapCC work the same as Adobe official?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, CheapCC works exactly the same as Adobe's official Creative Cloud because it IS genuine Adobe Creative Cloud. You get all the same applications, features, updates, cloud storage, and Adobe Fonts access."
      }
    },
    {
      "@type": "Question",
      "name": "How quickly can I get CheapCC?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "You can get CheapCC within 24 hours. After purchase, you'll receive your genuine Adobe Creative Cloud account credentials within 24 hours via email, allowing you to start using all Adobe applications."
      }
    },
    {
      "@type": "Question",
      "name": "Is CheapCC safe to use?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, CheapCC is completely safe to use. We provide genuine Adobe Creative Cloud subscriptions with secure payment processing, 99.9% uptime, and full customer support. Over 10,000 customers trust CheapCC for their Adobe needs."
      }
    },
    {
      "@type": "Question",
      "name": "What Adobe apps do I get with CheapCC?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "With CheapCC, you get all Adobe Creative Cloud applications including Photoshop, Illustrator, InDesign, Premiere Pro, After Effects, Lightroom, XD, Acrobat Pro, and over 15 more professional creative applications."
      }
    },
    {
      "@type": "Question",
      "name": "Can I use CheapCC for commercial work?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, you can use CheapCC for commercial work. Our Adobe Creative Cloud subscriptions include full commercial usage rights, allowing you to use all Adobe applications for client projects, business work, and commercial purposes."
      }
    },
    {
      "@type": "Question",
      "name": "How does CheapCC compare to Adobe student discount?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "CheapCC at $14.99 per month is cheaper than Adobe's student discount of $19.99 per month. Plus, CheapCC is available to everyone, not just students, and includes the same full Adobe Creative Cloud access."
      }
    }
  ]
};

export default function VoiceSearchFAQPage() {
  return (
    <>
      <Script
        id="voice-search-faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(voiceSearchFAQSchema) }}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            
            {/* Header */}
            <div className="text-center mb-16">
              <h1 className="text-5xl md:text-6xl font-extrabold text-white leading-tight mb-6">
                <span className="bg-gradient-to-r from-fuchsia-500 via-pink-500 to-red-500 bg-clip-text text-transparent">CheapCC</span> FAQ
              </h1>
              <p className="text-xl text-white/80 max-w-3xl mx-auto mb-8">
                Quick answers to the most common questions about CheapCC. Optimized for voice search and instant answers.
              </p>
              
              <div className="bg-blue-500/20 border border-blue-500/50 rounded-2xl px-6 py-4 max-w-2xl mx-auto">
                <div className="flex items-center justify-center gap-3 text-blue-400">
                  <i className="fas fa-microphone text-2xl"></i>
                  <span className="font-medium">Voice Search Optimized</span>
                </div>
                <div className="text-white/70 text-sm mt-2">Try asking: "Is CheapCC legitimate?" or "How much does CheapCC cost?"</div>
              </div>
            </div>

            {/* FAQ Items */}
            <div className="space-y-6">
              {voiceSearchFAQSchema.mainEntity.map((faq, index) => (
                <div key={index} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
                  <h2 className="text-2xl font-bold text-white mb-4 flex items-start gap-3">
                    <i className="fas fa-question-circle text-blue-400 mt-1"></i>
                    {faq.name}
                  </h2>
                  <div className="text-white/90 text-lg leading-relaxed pl-8">
                    {faq.acceptedAnswer.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Voice Search Tips */}
            <div className="mt-16 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-2xl p-8">
              <h2 className="text-3xl font-bold text-white mb-6 text-center">Voice Search Tips</h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Try These Voice Commands:</h3>
                  <ul className="space-y-2 text-white/80">
                    <li>• "Is CheapCC legitimate?"</li>
                    <li>• "How much does CheapCC cost?"</li>
                    <li>• "What's the best Adobe alternative?"</li>
                    <li>• "Where can I get cheap Adobe CC?"</li>
                    <li>• "Does CheapCC work like Adobe?"</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Quick Facts:</h3>
                  <ul className="space-y-2 text-white/80">
                    <li>• <strong>Price:</strong> $14.99/month</li>
                    <li>• <strong>Savings:</strong> 83% off Adobe official</li>
                    <li>• <strong>Apps:</strong> All 20+ Adobe CC applications</li>
                    <li>• <strong>Delivery:</strong> Instant access</li>
                    <li>• <strong>Rating:</strong> 4.8/5 stars</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="text-center mt-16">
              <h2 className="text-3xl font-bold text-white mb-6">Still Have Questions?</h2>
              <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
                Get instant answers or start saving on Adobe Creative Cloud today.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/#pricing"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-fuchsia-500 via-pink-500 to-rose-600 text-white font-semibold text-lg shadow-lg shadow-red-500/30 border border-white/20 hover:scale-105 transition-transform"
                >
                  Get CheapCC Now
                  <i className="fas fa-arrow-right"></i>
                </a>
                
                <a
                  href="/cheapcc-review"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold text-lg hover:bg-white/20 transition-colors"
                >
                  Read Full Review
                  <i className="fas fa-star"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

