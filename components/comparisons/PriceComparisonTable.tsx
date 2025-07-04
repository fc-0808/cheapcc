import React from 'react';
import { PricePoint, calculateYearlySavings } from '@/lib/comparisons';

interface PriceComparisonTableProps {
  adobeProduct: string;
  alternativeProduct: string;
  adobePricing: PricePoint;
  cheapCCPricing: PricePoint;
  alternativePricing: PricePoint;
}

export default function PriceComparisonTable({
  adobeProduct,
  alternativeProduct,
  adobePricing,
  cheapCCPricing,
  alternativePricing
}: PriceComparisonTableProps) {
  const { cheapCCSavings, alternativeSavings } = calculateYearlySavings(
    adobePricing,
    cheapCCPricing,
    alternativePricing
  );

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  return (
    <div className="overflow-x-auto my-8 rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm">
      <table className="w-full border-collapse">
        <thead className="bg-white/10">
          <tr>
            <th className="p-4 text-left border-b border-white/10 text-white">Pricing Option</th>
            <th className="p-4 text-left border-b border-white/10 text-white">{adobeProduct} (Official)</th>
            <th className="p-4 text-left border-b border-white/10 bg-pink-500/20 text-white">
              {adobeProduct} via CheapCC
            </th>
            <th className="p-4 text-left border-b border-white/10 text-white">{alternativeProduct}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="p-4 border-b border-white/10 text-white">Monthly Price</td>
            <td className="p-4 border-b border-white/10 text-white/80">
              {adobePricing.subscription ? formatPrice(adobePricing.monthly) : 'N/A'}
            </td>
            <td className="p-4 border-b border-white/10 bg-pink-500/20 text-white/80">
              {cheapCCPricing.subscription ? formatPrice(cheapCCPricing.monthly) : 'N/A'}
            </td>
            <td className="p-4 border-b border-white/10 text-white/80">
              {alternativePricing.subscription ? formatPrice(alternativePricing.monthly) : 'N/A'}
            </td>
          </tr>
          <tr>
            <td className="p-4 border-b border-white/10 text-white">Annual Price</td>
            <td className="p-4 border-b border-white/10 text-white/80">
              {formatPrice(adobePricing.annual)}
            </td>
            <td className="p-4 border-b border-white/10 bg-pink-500/20 text-white/80">
              {formatPrice(cheapCCPricing.annual)}
            </td>
            <td className="p-4 border-b border-white/10 text-white/80">
              {alternativePricing.subscription 
                ? formatPrice(alternativePricing.annual) 
                : alternativePricing.oneTime 
                  ? `${formatPrice(alternativePricing.oneTime)} (one-time)`
                  : 'N/A'}
            </td>
          </tr>
          <tr>
            <td className="p-4 border-b border-white/10 text-white">Savings vs Adobe (Annual)</td>
            <td className="p-4 border-b border-white/10 text-white/80">-</td>
            <td className="p-4 border-b border-white/10 font-bold bg-pink-500/20 text-green-400">
              {formatPrice(cheapCCSavings)} ({Math.round((cheapCCSavings / adobePricing.annual) * 100)}%)
            </td>
            <td className="p-4 border-b border-white/10 font-bold text-green-400">
              {alternativeSavings > 0 
                ? `${formatPrice(alternativeSavings)} (${Math.round((alternativeSavings / adobePricing.annual) * 100)}%)`
                : 'No savings'}
            </td>
          </tr>
          <tr>
            <td className="p-4 border-b border-white/10 text-white">Payment Model</td>
            <td className="p-4 border-b border-white/10 text-white/80">
              {adobePricing.subscription ? 'Subscription' : 'One-time purchase'}
            </td>
            <td className="p-4 border-b border-white/10 bg-pink-500/20 text-white/80">
              {cheapCCPricing.subscription ? 'Subscription' : 'One-time purchase'}
            </td>
            <td className="p-4 border-b border-white/10 text-white/80">
              {alternativePricing.subscription ? 'Subscription' : 'One-time purchase'}
            </td>
          </tr>
          <tr>
            <td className="p-4 border-b border-white/10 text-white">Value Score</td>
            <td className="p-4 border-b border-white/10 text-white/80">
              <div className="flex items-center">
                <span className="mr-2">3.5/5</span>
                <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div className="bg-yellow-500 h-full" style={{ width: '70%' }}></div>
                </div>
              </div>
            </td>
            <td className="p-4 border-b border-white/10 bg-pink-500/20 text-white/80">
              <div className="flex items-center">
                <span className="mr-2 font-bold">4.5/5</span>
                <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div className="bg-pink-500 h-full" style={{ width: '90%' }}></div>
                </div>
              </div>
            </td>
            <td className="p-4 border-b border-white/10 text-white/80">
              <div className="flex items-center">
                <span className="mr-2">{alternativeSavings > 0 ? '4/5' : '3/5'}</span>
                <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div className="bg-green-500 h-full" style={{ width: alternativeSavings > 0 ? '80%' : '60%' }}></div>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
} 