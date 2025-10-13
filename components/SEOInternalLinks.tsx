'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface InternalLink {
  href: string;
  title: string;
  description: string;
  category: 'pricing' | 'alternatives' | 'blog' | 'tools' | 'support';
  priority: 'high' | 'medium' | 'low';
}

interface SEOInternalLinksProps {
  currentPage?: string;
  category?: string;
  maxLinks?: number;
  showDescription?: boolean;
  layout?: 'grid' | 'list' | 'inline';
  className?: string;
}

// Strategic internal links for SEO
const INTERNAL_LINKS: InternalLink[] = [
  // High priority pages
  {
    href: '/#pricing',
    title: 'Adobe Creative Cloud Discount Plans',
    description: 'Compare our Adobe CC discount pricing plans - genuine Creative Cloud subscriptions starting at $14.99/month',
    category: 'pricing',
    priority: 'high'
  },
  {
    href: '/adobe-alternatives',
    title: 'Adobe CC Alternatives 2025',
    description: 'Comprehensive comparison of Adobe Creative Cloud alternatives and why CheapCC is the smart choice',
    category: 'alternatives',
    priority: 'high'
  },
  {
    href: '/adobe-pricing-calculator',
    title: 'Adobe CC Pricing Calculator',
    description: 'Calculate your exact savings with our interactive Adobe Creative Cloud pricing calculator',
    category: 'tools',
    priority: 'high'
  },
  {
    href: '/blog',
    title: 'Adobe CC Blog & Tutorials',
    description: 'Expert tutorials, tips, and guides for Adobe Creative Cloud applications',
    category: 'blog',
    priority: 'high'
  },
  {
    href: '/cheapcc-net',
    title: 'CheapCC.net Alternative - Adobe CC Discount',
    description: 'Looking for CheapCC.net? Find genuine Adobe Creative Cloud subscriptions at 83% off official pricing',
    category: 'alternatives',
    priority: 'high'
  },
  {
    href: '/cheapcc-review',
    title: 'CheapCC Review 2025 - Is CheapCC Legit?',
    description: 'Honest CheapCC review with real customer experiences. Find out if CheapCC is worth it for Adobe CC discounts',
    category: 'support',
    priority: 'high'
  },
  {
    href: '/cheapcc-vs-adobe-official',
    title: 'CheapCC vs Adobe Official Pricing - Save 83%',
    description: 'Compare CheapCC vs Adobe official pricing. Same Adobe CC apps for $14.99/month vs $79.99/month',
    category: 'pricing',
    priority: 'high'
  },
  {
    href: '/what-is-cheapcc',
    title: 'What is CheapCC? - Adobe CC Discount Service',
    description: 'Learn what CheapCC is and how it provides genuine Adobe Creative Cloud subscriptions at 83% off',
    category: 'support',
    priority: 'high'
  },
  {
    href: '/cheapcc-testimonials',
    title: 'CheapCC Customer Testimonials - 10,000+ Reviews',
    description: 'Read real CheapCC customer testimonials and success stories. See why creatives worldwide trust CheapCC',
    category: 'support',
    priority: 'medium'
  },
  {
    href: '/voice-search-faq',
    title: 'Voice Search FAQ - CheapCC Questions Answered',
    description: 'Voice-optimized FAQ with instant answers to common CheapCC questions and concerns.',
    category: 'support',
    priority: 'medium'
  },
  
  // Medium priority pages
  {
    href: '/compare/adobe-cc-vs-canva',
    title: 'Adobe CC vs Canva Comparison',
    description: 'Detailed comparison between Adobe Creative Cloud and Canva for professional design work',
    category: 'alternatives',
    priority: 'medium'
  },
  {
    href: '/compare/photoshop-vs-affinity-photo',
    title: 'Photoshop vs Affinity Photo',
    description: 'Professional comparison of Adobe Photoshop vs Affinity Photo for photo editing',
    category: 'alternatives',
    priority: 'medium'
  },
  {
    href: '/adobe-photoshop-discount',
    title: 'Adobe Photoshop Discount',
    description: 'Get Adobe Photoshop at 83% off official pricing with full Creative Cloud access',
    category: 'pricing',
    priority: 'medium'
  },
  {
    href: '/cancel-adobe-subscription',
    title: 'How to Cancel Adobe Subscription',
    description: 'Step-by-step guide to cancel your Adobe subscription and switch to CheapCC',
    category: 'support',
    priority: 'medium'
  },
  {
    href: '/faq',
    title: 'Frequently Asked Questions',
    description: 'Common questions about our Adobe Creative Cloud subscriptions and services',
    category: 'support',
    priority: 'medium'
  },
  
  // Lower priority but still valuable
  {
    href: '/compare',
    title: 'Adobe Software Comparisons',
    description: 'Compare Adobe Creative Cloud with alternatives and find the best solution for your needs',
    category: 'alternatives',
    priority: 'low'
  }
];

export default function SEOInternalLinks({ 
  currentPage = '',
  category,
  maxLinks = 6,
  showDescription = true,
  layout = 'grid',
  className = ''
}: SEOInternalLinksProps) {
  
  // Filter and sort links
  let filteredLinks = INTERNAL_LINKS.filter(link => {
    // Don't show link to current page
    if (currentPage && (link.href === currentPage || link.href.includes(currentPage))) {
      return false;
    }
    
    // Filter by category if specified
    if (category && link.category !== category) {
      return false;
    }
    
    return true;
  });
  
  // Sort by priority (high -> medium -> low)
  filteredLinks.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });
  
  // Limit number of links
  filteredLinks = filteredLinks.slice(0, maxLinks);
  
  if (filteredLinks.length === 0) return null;
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.215, 0.61, 0.355, 1]
      }
    }
  };
  
  const getLayoutClasses = () => {
    switch (layout) {
      case 'grid':
        return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4';
      case 'list':
        return 'space-y-4';
      case 'inline':
        return 'flex flex-wrap gap-2';
      default:
        return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4';
    }
  };
  
  const getLinkClasses = () => {
    switch (layout) {
      case 'grid':
        return 'block p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-pink-500/30 hover:bg-white/10 transition-all duration-300 group';
      case 'list':
        return 'block p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-pink-500/30 hover:bg-white/10 transition-all duration-300 group';
      case 'inline':
        return 'inline-block px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-sm text-white hover:bg-pink-500/20 hover:border-pink-500/40 transition-all duration-300';
      default:
        return 'block p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-pink-500/30 hover:bg-white/10 transition-all duration-300 group';
    }
  };
  
  return (
    <motion.div 
      className={`seo-internal-links ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className={getLayoutClasses()}>
        {filteredLinks.map((link, index) => (
          <motion.div key={link.href} variants={itemVariants}>
            <Link 
              href={link.href}
              className={getLinkClasses()}
              prefetch={link.priority === 'high'}
            >
              {layout === 'inline' ? (
                <span className="font-medium">{link.title}</span>
              ) : (
                <>
                  <h3 className="font-semibold text-white mb-2 group-hover:text-pink-400 transition-colors duration-300">
                    {link.title}
                  </h3>
                  {showDescription && (
                    <p className="text-sm text-gray-300 group-hover:text-gray-200 transition-colors duration-300">
                      {link.description}
                    </p>
                  )}
                  <div className="mt-3 flex items-center text-pink-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span>Learn more</span>
                    <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </>
              )}
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// Utility function to get related links based on current page
export function getRelatedLinks(currentPath: string): InternalLink[] {
  const pathMappings: Record<string, string[]> = {
    '/': ['pricing', 'alternatives', 'blog'],
    '/adobe-alternatives': ['pricing', 'alternatives', 'tools'],
    '/adobe-pricing-calculator': ['pricing', 'alternatives'],
    '/blog': ['alternatives', 'tools', 'support'],
    '/faq': ['support', 'pricing', 'alternatives'],
    '/compare': ['alternatives', 'pricing'],
  };
  
  const categories = pathMappings[currentPath] || ['pricing', 'alternatives'];
  
  return INTERNAL_LINKS.filter(link => 
    categories.includes(link.category) && 
    !link.href.includes(currentPath)
  ).slice(0, 6);
}
