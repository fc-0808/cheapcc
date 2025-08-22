import { photoshopVsAffinityPhoto } from './photoshop-vs-affinity-photo';
import { premiereProVsDavinciResolve } from './premiere-pro-vs-davinci-resolve';
import { adobeCCVsCanva } from './adobe-cc-vs-canva';
import { adobeCCVsFigma } from './adobe-cc-vs-figma';
import { ComparisonData } from '../comparisons';

// Export all comparison data
export const allComparisons: ComparisonData[] = [
  photoshopVsAffinityPhoto,
  premiereProVsDavinciResolve,
  adobeCCVsCanva,
  adobeCCVsFigma
];

// Get a comparison by slug
export function getComparisonBySlug(slug: string): ComparisonData | undefined {
  return allComparisons.find(comparison => comparison.slug === slug);
}

// Get all comparison slugs
export function getAllComparisonSlugs(): string[] {
  return allComparisons.map(comparison => comparison.slug);
} 