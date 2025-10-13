// Competitive Intelligence and Market Analysis
// Professional competitor monitoring and SEO gap analysis

export interface Competitor {
  name: string;
  domain: string;
  type: 'official' | 'discount' | 'alternative';
  targetKeywords: string[];
  strengths: string[];
  weaknesses: string[];
  pricePoint: number;
}

// Key competitors in the Adobe CC space
export const COMPETITORS: Competitor[] = [
  {
    name: 'Adobe Official',
    domain: 'adobe.com',
    type: 'official',
    targetKeywords: [
      'adobe creative cloud',
      'adobe cc',
      'photoshop',
      'illustrator',
      'premiere pro',
      'after effects'
    ],
    strengths: [
      'Brand authority',
      'Official product',
      'Full support',
      'Latest features'
    ],
    weaknesses: [
      'High pricing ($79.99/month)',
      'Complex licensing',
      'Corporate focus',
      'Long contracts'
    ],
    pricePoint: 79.99
  },
  {
    name: 'Adobe Student Discount',
    domain: 'adobe.com/students',
    type: 'official',
    targetKeywords: [
      'adobe student discount',
      'cheap adobe for students',
      'adobe education pricing',
      'student creative cloud'
    ],
    strengths: [
      'Official Adobe',
      'Student verification',
      'Educational support'
    ],
    weaknesses: [
      'Limited to students only',
      'Still expensive ($19.99/month)',
      'Verification required',
      'Time-limited eligibility'
    ],
    pricePoint: 19.99
  },
  {
    name: 'Canva Pro',
    domain: 'canva.com',
    type: 'alternative',
    targetKeywords: [
      'canva vs photoshop',
      'adobe alternative',
      'design software',
      'graphic design tool'
    ],
    strengths: [
      'User-friendly',
      'Web-based',
      'Templates',
      'Affordable ($12.99/month)'
    ],
    weaknesses: [
      'Limited professional features',
      'Not Adobe CC',
      'Web-only',
      'Template dependency'
    ],
    pricePoint: 12.99
  },
  {
    name: 'Affinity Suite',
    domain: 'affinity.serif.com',
    type: 'alternative',
    targetKeywords: [
      'affinity vs adobe',
      'photoshop alternative',
      'one time purchase adobe alternative',
      'affinity photo'
    ],
    strengths: [
      'One-time purchase',
      'Professional features',
      'No subscription',
      'Good performance'
    ],
    weaknesses: [
      'Not Adobe CC',
      'Learning curve',
      'Limited ecosystem',
      'No cloud sync'
    ],
    pricePoint: 69.99 // One-time
  }
];

// Keywords we should target based on competitor analysis
export const OPPORTUNITY_KEYWORDS = [
  // Direct competitor comparisons
  'cheapcc vs adobe official',
  'cheapcc vs adobe student discount',
  'adobe cc discount vs official',
  
  // Price-focused keywords
  'adobe cc cheaper than official',
  'genuine adobe cc discount',
  'real adobe cc for less',
  'authentic adobe creative cloud discount',
  
  // Alternative-focused keywords
  'best adobe cc alternative',
  'adobe cc but cheaper',
  'same as adobe cc but less expensive',
  'genuine adobe cc not alternative',
  
  // Problem-solving keywords
  'adobe cc too expensive',
  'can\'t afford adobe cc',
  'adobe cc price too high',
  'cheaper way to get adobe cc',
  
  // Feature-specific keywords
  'photoshop discount genuine',
  'illustrator discount real',
  'premiere pro cheaper price',
  'after effects discount authentic',
  
  // Long-tail opportunities
  'how to get adobe cc for less money',
  'where to buy cheap adobe creative cloud',
  'is there a cheaper version of adobe cc',
  'adobe cc discount for professionals'
];

// Content gaps we should fill based on competitor analysis
export const CONTENT_OPPORTUNITIES = [
  {
    topic: 'Adobe CC vs CheapCC Feature Comparison',
    targetKeywords: ['cheapcc vs adobe features', 'same features cheaper price'],
    competitorGap: 'No direct feature-by-feature comparison available',
    priority: 'high'
  },
  {
    topic: 'Professional Use Case Studies',
    targetKeywords: ['cheapcc for agencies', 'professional adobe discount'],
    competitorGap: 'Limited professional case studies from discount providers',
    priority: 'high'
  },
  {
    topic: 'Student vs Professional Pricing Analysis',
    targetKeywords: ['cheapcc vs student discount', 'better than student pricing'],
    competitorGap: 'No comparison between discount services and student pricing',
    priority: 'medium'
  },
  {
    topic: 'Setup and Migration Guide',
    targetKeywords: ['how to switch to cheapcc', 'migrate from adobe official'],
    competitorGap: 'Limited migration guidance from competitors',
    priority: 'medium'
  },
  {
    topic: 'Industry-Specific Use Cases',
    targetKeywords: ['cheapcc for photographers', 'cheapcc for video editors'],
    competitorGap: 'Generic positioning, not industry-specific',
    priority: 'low'
  }
];

// Competitive advantage messaging
export const COMPETITIVE_ADVANTAGES = {
  vs_adobe_official: {
    headline: 'Same Adobe CC, 83% Less Cost',
    points: [
      'Identical software and features',
      'Save $780 per year',
      'Instant access, no contracts',
      'Same updates and cloud storage'
    ]
  },
  vs_student_discount: {
    headline: 'Better Than Student Pricing, Available to Everyone',
    points: [
      '$14.99 vs $19.99 student price',
      'No student verification required',
      'Available to professionals',
      'No eligibility restrictions'
    ]
  },
  vs_alternatives: {
    headline: 'Real Adobe CC, Not a Substitute',
    points: [
      'Genuine Adobe Creative Cloud',
      'Full professional feature set',
      'Industry-standard software',
      'Complete ecosystem integration'
    ]
  }
};

// SEO gap analysis - keywords competitors rank for that we don't
export const SEO_GAPS = [
  {
    keyword: 'adobe creative cloud review',
    competitor: 'Various review sites',
    opportunity: 'Create comprehensive CheapCC review content',
    difficulty: 'medium',
    volume: 'high'
  },
  {
    keyword: 'adobe cc alternatives 2025',
    competitor: 'Software comparison sites',
    opportunity: 'Position CheapCC as the best alternative (genuine Adobe)',
    difficulty: 'high',
    volume: 'high'
  },
  {
    keyword: 'how much does adobe cc cost',
    competitor: 'Adobe official and review sites',
    opportunity: 'Create pricing comparison with CheapCC savings',
    difficulty: 'medium',
    volume: 'very high'
  },
  {
    keyword: 'adobe cc student discount requirements',
    competitor: 'Adobe official and education sites',
    opportunity: 'Show CheapCC as easier alternative to student discount',
    difficulty: 'low',
    volume: 'medium'
  }
];

// Competitor tracking utilities
export const trackCompetitorMention = (competitor: string, context: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'competitor_mention', {
      event_category: 'Competitive Intelligence',
      event_action: 'mention_tracked',
      event_label: competitor,
      context: context
    });
  }
};

export const trackCompetitiveAdvantage = (advantage: string, competitor: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'competitive_advantage', {
      event_category: 'Competitive Intelligence',
      event_action: 'advantage_highlighted',
      event_label: advantage,
      competitor: competitor
    });
  }
};

// Generate competitive comparison content
export const generateCompetitorComparison = (competitorName: string) => {
  const competitor = COMPETITORS.find(c => c.name === competitorName);
  if (!competitor) return null;

  const advantages = COMPETITIVE_ADVANTAGES[
    competitorName.toLowerCase().replace(' ', '_') as keyof typeof COMPETITIVE_ADVANTAGES
  ];

  return {
    competitor,
    advantages,
    priceComparison: {
      competitor: competitor.pricePoint,
      cheapcc: 14.99,
      savings: competitor.pricePoint - 14.99,
      savingsPercentage: Math.round(((competitor.pricePoint - 14.99) / competitor.pricePoint) * 100)
    }
  };
};

// Monitor competitor keywords for content opportunities
export const getKeywordOpportunities = (industry: string = 'creative') => {
  return OPPORTUNITY_KEYWORDS.filter(keyword => 
    keyword.includes('adobe') || keyword.includes('creative') || keyword.includes('design')
  ).map(keyword => ({
    keyword,
    intent: keyword.includes('vs') ? 'comparison' : 
            keyword.includes('cheap') || keyword.includes('discount') ? 'commercial' : 
            keyword.includes('how') || keyword.includes('what') ? 'informational' : 'navigational',
    priority: keyword.includes('cheapcc') ? 'high' : 'medium',
    contentType: keyword.includes('vs') ? 'comparison' : 
                 keyword.includes('how') ? 'guide' : 
                 keyword.includes('best') ? 'listicle' : 'landing-page'
  }));
};

// Export competitive intelligence data for external tools
export const exportCompetitiveData = () => {
  return {
    competitors: COMPETITORS,
    opportunities: OPPORTUNITY_KEYWORDS,
    contentGaps: CONTENT_OPPORTUNITIES,
    seoGaps: SEO_GAPS,
    advantages: COMPETITIVE_ADVANTAGES,
    lastUpdated: new Date().toISOString()
  };
};

