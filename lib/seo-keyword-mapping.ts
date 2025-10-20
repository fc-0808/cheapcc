/**
 * SEO Keyword Mapping for CheapCC
 * 
 * This file contains comprehensive keyword mappings based on CSV analysis
 * to help optimize different page types and content sections.
 */

export interface KeywordMapping {
  primary: string;
  secondary: string[];
  longTail: string[];
  intent: 'navigational' | 'transactional' | 'informational' | 'commercial';
  volume: number;
  difficulty: number;
  priority: 'high' | 'medium' | 'low';
}

export interface PageKeywordStrategy {
  pageType: string;
  targetKeywords: KeywordMapping[];
  titleTemplate: string;
  descriptionTemplate: string;
  contentFocus: string[];
}

// High-value keywords from CSV analysis
export const KEYWORD_MAPPINGS: Record<string, KeywordMapping> = {
  // Core brand keywords
  'cheapcc': {
    primary: 'cheapcc',
    secondary: ['cheapcc adobe', 'cheapcc.net', 'cheapcc review', 'cheapcc login'],
    longTail: ['what is cheapcc', 'is cheapcc legit', 'cheapcc vs adobe official'],
    intent: 'navigational',
    volume: 1000,
    difficulty: 30,
    priority: 'high'
  },

  // Adobe Creative Cloud discount keywords
  'adobe-creative-cloud-discount': {
    primary: 'adobe creative cloud discount',
    secondary: ['adobe cc discount', 'adobe creative cloud discount code', 'adobe creative cloud coupon code'],
    longTail: ['adobe creative cloud discount code 2025', 'adobe creative cloud discount coupon', 'adobe creative cloud free coupon code'],
    intent: 'transactional',
    volume: 480,
    difficulty: 45,
    priority: 'high'
  },

  // Student discount keywords
  'adobe-student-discount': {
    primary: 'adobe creative cloud student discount',
    secondary: ['adobe creative cloud student', 'adobe creative cloud for students', 'adobe creative cloud education discount'],
    longTail: ['adobe creative cloud student pricing', 'adobe creative cloud student plan', 'adobe creative cloud student rate', 'adobe creative cloud student deal'],
    intent: 'transactional',
    volume: 720,
    difficulty: 46,
    priority: 'high'
  },

  // Teacher discount keywords
  'adobe-teacher-discount': {
    primary: 'adobe creative cloud teacher discount',
    secondary: ['adobe creative cloud education', 'adobe creative cloud for teachers'],
    longTail: ['adobe creative cloud teacher pricing', 'adobe creative cloud education discount'],
    intent: 'transactional',
    volume: 390,
    difficulty: 54,
    priority: 'high'
  },

  // Military discount keywords
  'adobe-military-discount': {
    primary: 'adobe creative cloud military discount',
    secondary: ['adobe military discount', 'adobe creative cloud military pricing'],
    longTail: ['adobe creative cloud military discount code', 'adobe creative cloud military pricing'],
    intent: 'transactional',
    volume: 70,
    difficulty: 28,
    priority: 'medium'
  },

  // Pricing and cost keywords
  'adobe-pricing': {
    primary: 'adobe creative cloud pricing',
    secondary: ['adobe creative cloud cost', 'adobe creative cloud price', 'how much is adobe creative cloud'],
    longTail: ['adobe creative cloud pricing plans', 'adobe creative cloud cost comparison', 'adobe creative cloud price increase'],
    intent: 'informational',
    volume: 4400,
    difficulty: 68,
    priority: 'high'
  },

  // Subscription keywords
  'adobe-subscription': {
    primary: 'adobe creative cloud subscription',
    secondary: ['adobe creative cloud subscription plans', 'adobe creative cloud membership', 'adobe creative cloud subscriptions'],
    longTail: ['adobe creative cloud annual subscription', 'adobe creative cloud yearly subscription', 'adobe creative cloud monthly cost'],
    intent: 'transactional',
    volume: 6600,
    difficulty: 66,
    priority: 'high'
  },

  // Cancel subscription keywords
  'cancel-adobe': {
    primary: 'cancel adobe creative cloud',
    secondary: ['how to cancel adobe creative cloud', 'adobe creative cloud cancel subscription', 'adobe creative cloud cancellation'],
    longTail: ['cancel adobe creative cloud subscription', 'adobe creative cloud cancel account', 'adobe creative cloud end subscription'],
    intent: 'informational',
    volume: 320,
    difficulty: 60,
    priority: 'medium'
  },

  // Alternative keywords
  'adobe-alternatives': {
    primary: 'adobe creative cloud alternatives',
    secondary: ['best adobe creative cloud alternatives', 'cheaper alternatives to adobe creative cloud', 'adobe cc alternatives'],
    longTail: ['adobe creative cloud alternative download', 'cheapest adobe creative cloud country', 'cheapest way to get adobe creative cloud'],
    intent: 'commercial',
    volume: 140,
    difficulty: 20,
    priority: 'high'
  },

  // Cheap Adobe keywords
  'cheap-adobe': {
    primary: 'cheap adobe creative cloud',
    secondary: ['adobe creative cloud cheap', 'cheap adobe cc', 'affordable adobe creative cloud'],
    longTail: ['adobe creative cloud 1 year cheap', 'adobe creative cloud buy cheap', 'adobe creative cloud cheap price'],
    intent: 'transactional',
    volume: 90,
    difficulty: 50,
    priority: 'high'
  },

  // Discount code keywords
  'adobe-discount-codes': {
    primary: 'adobe discount code',
    secondary: ['adobe coupon code', 'adobe offer code', 'adobe promo code', 'adobe discount codes'],
    longTail: ['adobe creative cloud discount code', 'adobe acrobat discount code', 'adobe photoshop discount code'],
    intent: 'transactional',
    volume: 880,
    difficulty: 38,
    priority: 'high'
  },

  // All apps keywords
  'adobe-all-apps': {
    primary: 'adobe creative cloud all apps',
    secondary: ['adobe creative cloud all apps subscription', 'adobe creative cloud all apps price'],
    longTail: ['adobe creative cloud all apps student discount', 'adobe creative cloud suite price'],
    intent: 'informational',
    volume: 1600,
    difficulty: 66,
    priority: 'medium'
  }
};

// Page-specific keyword strategies
export const PAGE_KEYWORD_STRATEGIES: PageKeywordStrategy[] = [
  {
    pageType: 'home',
    targetKeywords: [
      KEYWORD_MAPPINGS['cheapcc'],
      KEYWORD_MAPPINGS['adobe-creative-cloud-discount'],
      KEYWORD_MAPPINGS['adobe-pricing'],
      KEYWORD_MAPPINGS['adobe-subscription']
    ],
    titleTemplate: 'CheapCC - {primary} | {secondary}',
    descriptionTemplate: 'Get {primary} with CheapCC. {secondary} at 83% off official pricing. All Adobe CC apps included.',
    contentFocus: ['pricing comparison', 'benefits', 'how it works', 'customer testimonials']
  },
  {
    pageType: 'pricing',
    targetKeywords: [
      KEYWORD_MAPPINGS['adobe-pricing'],
      KEYWORD_MAPPINGS['adobe-subscription'],
      KEYWORD_MAPPINGS['adobe-student-discount'],
      KEYWORD_MAPPINGS['adobe-teacher-discount']
    ],
    titleTemplate: '{primary} - Compare Adobe CC Plans & Save 83%',
    descriptionTemplate: 'Compare {primary} and find the best Adobe Creative Cloud plan for you. Student, teacher, and military discounts available.',
    contentFocus: ['pricing tables', 'discount information', 'plan comparison', 'savings calculator']
  },
  {
    pageType: 'alternatives',
    targetKeywords: [
      KEYWORD_MAPPINGS['adobe-alternatives'],
      KEYWORD_MAPPINGS['cheap-adobe'],
      KEYWORD_MAPPINGS['adobe-creative-cloud-discount']
    ],
    titleTemplate: 'Best {primary} 2025 - CheapCC vs Other Options',
    descriptionTemplate: 'Discover the best {primary} and why CheapCC is the smart choice. Compare features, pricing, and benefits.',
    contentFocus: ['feature comparison', 'pricing analysis', 'pros and cons', 'user reviews']
  },
  {
    pageType: 'student-discount',
    targetKeywords: [
      KEYWORD_MAPPINGS['adobe-student-discount'],
      KEYWORD_MAPPINGS['adobe-teacher-discount'],
      KEYWORD_MAPPINGS['adobe-military-discount']
    ],
    titleTemplate: '{primary} - Education Pricing for Students & Teachers',
    descriptionTemplate: 'Get {primary} with special education pricing. Verified student, teacher, and military discounts available.',
    contentFocus: ['eligibility requirements', 'verification process', 'special pricing', 'education benefits']
  },
  {
    pageType: 'cancel-subscription',
    targetKeywords: [
      KEYWORD_MAPPINGS['cancel-adobe'],
      KEYWORD_MAPPINGS['adobe-creative-cloud-discount']
    ],
    titleTemplate: 'How to {primary} - Step by Step Guide',
    descriptionTemplate: 'Learn how to {primary} and switch to CheapCC for better pricing. Complete cancellation guide with screenshots.',
    contentFocus: ['step-by-step guide', 'screenshots', 'troubleshooting', 'alternative options']
  },
  {
    pageType: 'discount-codes',
    targetKeywords: [
      KEYWORD_MAPPINGS['adobe-discount-codes'],
      KEYWORD_MAPPINGS['adobe-creative-cloud-discount']
    ],
    titleTemplate: '{primary} - Active Adobe Coupons & Promo Codes',
    descriptionTemplate: 'Find working {primary} and save on Adobe Creative Cloud. Verified discount codes and promotional offers.',
    contentFocus: ['active codes', 'expiration dates', 'usage instructions', 'terms and conditions']
  }
];

// Content optimization suggestions based on keyword intent
export const CONTENT_OPTIMIZATION_SUGGESTIONS = {
  navigational: {
    focus: 'Brand recognition and user experience',
    elements: ['clear navigation', 'brand consistency', 'user-friendly interface', 'fast loading'],
    keywords: ['cheapcc', 'cheapcc.net', 'cheapcc login', 'cheapcc review']
  },
  transactional: {
    focus: 'Conversion and purchase intent',
    elements: ['clear pricing', 'trust signals', 'easy checkout', 'security badges'],
    keywords: ['adobe creative cloud discount', 'adobe discount code', 'adobe coupon code', 'adobe creative cloud student discount']
  },
  informational: {
    focus: 'Education and problem-solving',
    elements: ['comprehensive guides', 'FAQ sections', 'tutorials', 'comparison charts'],
    keywords: ['adobe creative cloud pricing', 'how much is adobe creative cloud', 'adobe creative cloud alternatives', 'cancel adobe creative cloud']
  },
  commercial: {
    focus: 'Comparison and evaluation',
    elements: ['feature comparisons', 'pros and cons', 'user reviews', 'testimonials'],
    keywords: ['adobe creative cloud alternatives', 'best adobe creative cloud alternatives', 'cheaper alternatives to adobe creative cloud']
  }
};

// Long-tail keyword opportunities
export const LONG_TAIL_OPPORTUNITIES = [
  'adobe creative cloud student discount 2025',
  'adobe creative cloud teacher discount code',
  'adobe creative cloud military discount pricing',
  'how to cancel adobe creative cloud subscription step by step',
  'adobe creative cloud alternatives for students',
  'cheapest adobe creative cloud country 2025',
  'adobe creative cloud discount code reddit',
  'adobe creative cloud coupon code free 2025',
  'adobe creative cloud all apps student discount',
  'best adobe creative cloud alternatives for photographers',
  'adobe creative cloud pricing comparison 2025',
  'adobe creative cloud subscription plans comparison',
  'adobe creative cloud cost vs alternatives',
  'adobe creative cloud price increase 2025',
  'adobe creative cloud monthly cost breakdown',
  'adobe creative cloud yearly subscription benefits',
  'adobe creative cloud annual subscription savings',
  'adobe creative cloud suite price comparison',
  'adobe creative cloud subscriptions for small business',
  'adobe creative cloud cancel account process'
];

// Export utility functions
export function getKeywordsForPage(pageType: string): KeywordMapping[] {
  const strategy = PAGE_KEYWORD_STRATEGIES.find(s => s.pageType === pageType);
  return strategy ? strategy.targetKeywords : [];
}

export function getPrimaryKeywords(pageType: string): string[] {
  const keywords = getKeywordsForPage(pageType);
  return keywords.map(k => k.primary);
}

export function getLongTailKeywords(pageType: string): string[] {
  const keywords = getKeywordsForPage(pageType);
  return keywords.flatMap(k => k.longTail);
}

export function getContentSuggestions(intent: 'navigational' | 'transactional' | 'informational' | 'commercial') {
  return CONTENT_OPTIMIZATION_SUGGESTIONS[intent];
}

export function generateTitle(pageType: string, customPrimary?: string): string {
  const strategy = PAGE_KEYWORD_STRATEGIES.find(s => s.pageType === pageType);
  if (!strategy) return 'CheapCC - Adobe Creative Cloud Discount';
  
  const primary = customPrimary || strategy.targetKeywords[0]?.primary || 'Adobe Creative Cloud Discount';
  const secondary = strategy.targetKeywords[1]?.primary || 'Save 83%';
  
  return strategy.titleTemplate
    .replace('{primary}', primary)
    .replace('{secondary}', secondary);
}

export function generateDescription(pageType: string, customPrimary?: string): string {
  const strategy = PAGE_KEYWORD_STRATEGIES.find(s => s.pageType === pageType);
  if (!strategy) return 'Get Adobe Creative Cloud at 83% off with CheapCC. All CC apps included.';
  
  const primary = customPrimary || strategy.targetKeywords[0]?.primary || 'Adobe Creative Cloud Discount';
  const secondary = strategy.targetKeywords[1]?.primary || 'Student, teacher, and military discounts';
  
  return strategy.descriptionTemplate
    .replace('{primary}', primary)
    .replace('{secondary}', secondary);
}
