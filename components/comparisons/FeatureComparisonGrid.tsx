import React from 'react';
import { ComparisonFeature } from '@/lib/comparisons';

interface FeatureComparisonGridProps {
  adobeProduct: string;
  alternativeProduct: string;
  features: ComparisonFeature[];
}

export default function FeatureComparisonGrid({
  adobeProduct,
  alternativeProduct,
  features
}: FeatureComparisonGridProps) {
  // Group features by category or display all if no categories
  const renderRatingStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-5 h-5 ${star <= rating ? 'text-yellow-400' : 'text-gray-600'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  const renderWinnerBadge = (winner: 'adobe' | 'alternative' | 'tie', adobeProduct: string, alternativeProduct: string) => {
    if (winner === 'tie') {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/10 text-white">Tie</span>;
    } else if (winner === 'adobe') {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300">{adobeProduct}</span>;
    } else {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-300">{alternativeProduct}</span>;
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg shadow-md overflow-hidden my-8">
      <div className="p-6">
        <h3 className="text-2xl font-bold mb-6 text-white">Feature Comparison</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/10">
            <thead>
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Feature
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  {adobeProduct}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  {alternativeProduct}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Winner
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {features.map((feature, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white/5' : ''}>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-white">{feature.name}</div>
                    <div className="text-sm text-white/70">{feature.description}</div>
                  </td>
                  <td className="px-6 py-4">
                    {renderRatingStars(feature.adobeRating)}
                  </td>
                  <td className="px-6 py-4">
                    {renderRatingStars(feature.alternativeRating)}
                  </td>
                  <td className="px-6 py-4">
                    {renderWinnerBadge(feature.winner, adobeProduct, alternativeProduct)}
                    {feature.notes && (
                      <div className="mt-1 text-xs text-white/60">{feature.notes}</div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 