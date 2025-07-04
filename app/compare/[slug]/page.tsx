import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ComparisonPageTemplate from '@/components/comparisons/ComparisonPageTemplate';
import { getComparisonBySlug, getAllComparisonSlugs } from '@/lib/comparison-data';

type Props = {
  params: { slug: string }
};

// Generate metadata for the page
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const comparison = getComparisonBySlug(params.slug);
  
  if (!comparison) {
    return {
      title: 'Comparison Not Found',
      description: 'The requested comparison could not be found.'
    };
  }
  
  return {
    title: comparison.title,
    description: comparison.metaDescription,
    openGraph: {
      title: comparison.title,
      description: comparison.metaDescription,
      type: 'article',
    }
  };
}

// Generate static params for all comparisons
export function generateStaticParams() {
  const slugs = getAllComparisonSlugs();
  return slugs.map(slug => ({ slug }));
}

export default function ComparisonPage({ params }: Props) {
  const comparison = getComparisonBySlug(params.slug);
  
  if (!comparison) {
    notFound();
  }
  
  return <ComparisonPageTemplate comparison={comparison} />;
} 