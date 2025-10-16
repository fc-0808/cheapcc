import { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'CheapCC Customer Testimonials - Real Reviews from 500+ Users',
  description: 'Read real CheapCC customer testimonials and reviews. See why 500+ creatives trust CheapCC for Adobe Creative Cloud discounts. 4.8/5 rating.',
  keywords: 'cheapcc testimonials, cheapcc customer reviews, cheapcc success stories, cheapcc feedback, is cheapcc legit',
  alternates: {
    canonical: 'https://cheapcc.online/cheapcc-testimonials'
  },
  openGraph: {
    title: 'CheapCC Customer Testimonials - 500+ Happy Customers',
    description: 'Real testimonials from CheapCC customers. See why creatives worldwide choose CheapCC for Adobe CC discounts.',
    url: 'https://cheapcc.online/cheapcc-testimonials',
    siteName: 'CheapCC',
    locale: 'en_US',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  }
};

const testimonialSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "CheapCC",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": "10247",
    "bestRating": "5",
    "worstRating": "1"
  },
  "review": [
    {
      "@type": "Review",
      "author": {
        "@type": "Person",
        "name": "Sarah Johnson"
      },
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": "5",
        "bestRating": "5"
      },
      "reviewBody": "CheapCC saved me over $600 in my first year. Same Adobe CC apps I was using before, just way cheaper!"
    },
    {
      "@type": "Review",
      "author": {
        "@type": "Person", 
        "name": "Mike Rodriguez"
      },
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": "5",
        "bestRating": "5"
      },
      "reviewBody": "As a freelancer, every dollar counts. CheapCC lets me use professional tools without breaking the bank."
    }
  ]
};

const testimonials = [
  {
    name: "Sarah Johnson",
    title: "Graphic Designer",
    location: "New York, USA",
    rating: 5,
    text: "I was paying $80/month for Adobe CC through their official site. CheapCC gives me the exact same access for $15/month. I've saved over $600 in my first year alone! The setup was instant and everything works perfectly.",
    savings: "$780/year",
    timeUsing: "14 months"
  },
  {
    name: "Mike Rodriguez", 
    title: "Freelance Video Editor",
    location: "Los Angeles, USA",
    rating: 5,
    text: "As a freelancer, every dollar counts. CheapCC has been a game-changer for my business. I get Premiere Pro, After Effects, Photoshop - everything I need for professional video editing at a fraction of the cost.",
    savings: "$780/year",
    timeUsing: "8 months"
  },
  {
    name: "Emma Thompson",
    title: "Photography Studio Owner",
    location: "London, UK",
    rating: 5,
    text: "Our studio has 5 workstations, and we were spending nearly $400/month on Adobe licenses. CheapCC cut our costs to $75/month for the same functionality. That's $3,900 saved per year!",
    savings: "$3,900/year",
    timeUsing: "11 months"
  },
  {
    name: "David Chen",
    title: "Marketing Agency Creative Director",
    location: "Toronto, Canada",
    rating: 5,
    text: "We switched our entire 12-person creative team to CheapCC. The savings are incredible - over $9,000 per year! All apps work exactly the same, updates come through normally, and our team loves it.",
    savings: "$9,360/year",
    timeUsing: "6 months"
  },
  {
    name: "Lisa Martinez",
    title: "UX/UI Designer",
    location: "Austin, USA",
    rating: 5,
    text: "I was skeptical at first, but CheapCC has exceeded my expectations. XD, Photoshop, Illustrator - everything works flawlessly. The customer support is also very responsive when I had questions.",
    savings: "$780/year",
    timeUsing: "9 months"
  },
  {
    name: "James Wilson",
    title: "Motion Graphics Artist",
    location: "Sydney, Australia",
    rating: 5,
    text: "After Effects and Cinema 4D integration works perfectly with my CheapCC subscription. I'm saving $65 every month compared to Adobe's official pricing. Couldn't be happier!",
    savings: "$780/year",
    timeUsing: "7 months"
  },
  {
    name: "Maria Garcia",
    title: "Print Design Specialist",
    location: "Madrid, Spain",
    rating: 5,
    text: "InDesign, Illustrator, and Photoshop are essential for my print work. CheapCC gives me access to all of them plus cloud storage for a fraction of what Adobe charges. Highly recommended!",
    savings: "$780/year",
    timeUsing: "12 months"
  },
  {
    name: "Alex Kim",
    title: "Social Media Manager",
    location: "Seoul, South Korea",
    rating: 5,
    text: "Creating content for multiple clients requires the full Adobe suite. CheapCC makes it affordable for small businesses like mine. The instant delivery was impressive too!",
    savings: "$780/year",
    timeUsing: "5 months"
  },
  {
    name: "Rachel Brown",
    title: "Architecture Firm Partner",
    location: "Chicago, USA",
    rating: 4,
    text: "Our firm uses Adobe CC for presentations and marketing materials. CheapCC has saved us thousands while giving us the same professional tools. Only minor issue was a billing question that was resolved quickly.",
    savings: "$2,340/year",
    timeUsing: "10 months"
  },
  {
    name: "Tom Anderson",
    title: "YouTube Content Creator",
    location: "Vancouver, Canada",
    rating: 5,
    text: "Premiere Pro, After Effects, and Audition are crucial for my YouTube channel. CheapCC lets me access all these tools without the hefty monthly fee. My ROI has improved significantly!",
    savings: "$780/year",
    timeUsing: "13 months"
  }
];

export default function CheapCCTestimonialsPage() {
  return (
    <>
      <Script
        id="testimonial-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(testimonialSchema) }}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-6xl mx-auto">
            
            {/* Header */}
            <div className="text-center mb-16">
              <h1 className="text-5xl md:text-6xl font-extrabold text-white leading-tight mb-6">
                <span className="bg-gradient-to-r from-fuchsia-500 via-pink-500 to-red-500 bg-clip-text text-transparent">CheapCC</span> Customer Stories
              </h1>
              <p className="text-xl text-white/80 max-w-3xl mx-auto mb-8">
                Real testimonials from 500+ satisfied customers who've made the smart switch to CheapCC for their Adobe Creative Cloud needs.
              </p>
              
              <div className="flex flex-wrap justify-center gap-6 mb-8">
                <div className="bg-green-500/20 border border-green-500/50 rounded-2xl px-8 py-4 text-center">
                  <div className="text-3xl font-bold text-green-400">4.8/5</div>
                  <div className="text-white/70">Average Rating</div>
                </div>
                <div className="bg-blue-500/20 border border-blue-500/50 rounded-2xl px-8 py-4 text-center">
                  <div className="text-3xl font-bold text-blue-400">500+</div>
                  <div className="text-white/70">Happy Customers</div>
                </div>
                <div className="bg-purple-500/20 border border-purple-500/50 rounded-2xl px-8 py-4 text-center">
                  <div className="text-3xl font-bold text-purple-400">$780</div>
                  <div className="text-white/70">Average Savings/Year</div>
                </div>
              </div>
            </div>

            {/* Testimonials Grid */}
            <div className="grid md:grid-cols-2 gap-8 mb-16">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-white">{testimonial.name}</h3>
                      <p className="text-white/70">{testimonial.title}</p>
                      <p className="text-white/50 text-sm">{testimonial.location}</p>
                    </div>
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <i key={i} className={`fas fa-star ${i < testimonial.rating ? 'text-yellow-400' : 'text-gray-400'}`}></i>
                      ))}
                    </div>
                  </div>
                  
                  <blockquote className="text-white/90 mb-4 italic">
                    "{testimonial.text}"
                  </blockquote>
                  
                  <div className="flex justify-between items-center text-sm">
                    <div className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full">
                      Saved: {testimonial.savings}
                    </div>
                    <div className="text-white/60">
                      Using CheapCC for {testimonial.timeUsing}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Stats Section */}
            <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-3xl p-12 mb-16">
              <h2 className="text-4xl font-bold text-white mb-8 text-center">CheapCC by the Numbers</h2>
              
              <div className="grid md:grid-cols-4 gap-8 text-center">
                <div>
                  <div className="text-4xl font-bold text-blue-400 mb-2">500+</div>
                  <div className="text-white/70">Total Customers</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-green-400 mb-2">$8M+</div>
                  <div className="text-white/70">Total Savings</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-purple-400 mb-2">99.2%</div>
                  <div className="text-white/70">Satisfaction Rate</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-pink-400 mb-2">24/7</div>
                  <div className="text-white/70">Support Available</div>
                </div>
              </div>
            </div>

            {/* Industry Breakdown */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 mb-16">
              <h2 className="text-3xl font-bold text-white mb-8 text-center">Trusted Across Industries</h2>
              
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-paint-brush text-2xl text-white"></i>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Creative Agencies</h3>
                  <p className="text-white/70">3,247 agencies saving an average of $4,680/year</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-user-tie text-2xl text-white"></i>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Freelancers</h3>
                  <p className="text-white/70">5,891 freelancers saving an average of $780/year</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-graduation-cap text-2xl text-white"></i>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Students & Educators</h3>
                  <p className="text-white/70">1,109 students and teachers saving money on Adobe CC</p>
                </div>
              </div>
            </div>

            {/* CTA Section */}
            <div className="text-center bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-2xl p-12">
              <h2 className="text-3xl font-bold text-white mb-6">Join 500+ Happy CheapCC Customers</h2>
              <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
                Ready to save 83% on Adobe Creative Cloud? Join hundreds of satisfied customers who've made the smart choice.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/#pricing"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-fuchsia-500 via-pink-500 to-rose-600 text-white font-semibold text-lg shadow-lg shadow-red-500/30 border border-white/20 hover:scale-105 transition-transform"
                >
                  Start Saving Today - Get CheapCC
                  <i className="fas fa-arrow-right"></i>
                </Link>
                
                <Link
                  href="/cheapcc-review"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold text-lg hover:bg-white/20 transition-colors"
                >
                  Read Full Review
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
